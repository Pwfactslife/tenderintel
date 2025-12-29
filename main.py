import os
import json
import logging
import time
import tempfile
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from supabase import create_client, Client

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load Environment Variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    logger.critical("Missing Critical Environment Variables! Server cannot start.")
    # In production, you might let this crash, but for now we warn.

# Initialize Clients
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    logger.critical(f"Failed to initialize clients: {e}")

# Gemini Model Configurations
# Flash 1.5 - High efficiency, multimodal
MODEL_NAME = "gemini-1.5-flash"
DAILY_LIMIT = 50

app = FastAPI(title="Tender Intelligence Hub API", version="2.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def check_user_limits(user_id: str):
    """
    Checks Profit Protection rules:
    1. Credits > 0
    2. Daily Usage < 50
    """
    try:
        response = supabase.table("profiles").select("credits_remaining, daily_usage_count").eq("id", user_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        user_data = response.data
        credits = user_data.get("credits_remaining", 0)
        daily_usage = user_data.get("daily_usage_count", 0)
        
        # 1. Credit Check
        if credits <= 0:
            logger.warning(f"User {user_id} attempted analysis with 0 credits.")
            raise HTTPException(status_code=402, detail="Insufficient Credits. Please top up.")
            
        # 2. Fair Usage Check
        if daily_usage >= DAILY_LIMIT:
            logger.warning(f"User {user_id} hit daily limit of {DAILY_LIMIT}.")
            raise HTTPException(status_code=429, detail="Daily usage limit reached. Try again tomorrow.")

        return user_data

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Database Error during limit check: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during authorization")

async def upload_to_gemini(path: str, mime_type: str = "application/pdf"):
    """
    Uploads file to Gemini and waits for processing to complete.
    """
    try:
        file = genai.upload_file(path, mime_type=mime_type)
        logger.info(f"Uploaded file {file.display_name} as {file.uri}")

        # Wait for processing
        while file.state.name == "PROCESSING":
            logger.info("File is processing...")
            await asyncio.sleep(2)
            file = genai.get_file(file.name)
            
        if file.state.name == "FAILED":
             raise ValueError(f"Gemini failed to process file: {file.state.name}")
             
        return file
    except Exception as e:
        logger.error(f"Gemini Upload Error: {e}")
        raise

async def cleanup_resources(gemini_files: list, local_paths: list):
    """
    Strict Cleanup: Deletes files from Gemini Cloud and Local Temp.
    """
    # 1. Delete from Gemini Cloud
    for g_file in gemini_files:
        try:
            genai.delete_file(g_file.name)
            logger.info(f"Deleted Gemini file: {g_file.name}")
        except Exception as e:
            logger.warning(f"Failed to delete Gemini file {g_file.name}: {e}")

    # 2. Delete Local files
    for path in local_paths:
        try:
            if os.path.exists(path):
                os.remove(path)
                logger.info(f"Deleted local file: {path}")
        except Exception as e:
            logger.warning(f"Failed to delete local file {path}: {e}")

@app.get("/")
def home():
    return {"message": "Tender Intelligence API is Running!", "docs": "/docs"}

@app.post("/analyze")
async def analyze_tender(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    user_id: str = Form(...),
    user_profile: str = Form(...)  # Expecting JSON string
):
    """
    Main Analysis Endpoint (v2 - Gemini File API)
    """
    logger.info(f"Received analysis request from {user_id} with {len(files)} files.")
    
    # 1. Profit Protection
    user_data = await check_user_limits(user_id)
    
    gemini_files = []
    local_paths = []
    
    try:
        # 2. The Universal Reader (File API Upload)
        for file in files:
            # Create temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name
                local_paths.append(tmp_path)
            
            # Upload to Gemini
            g_file = await upload_to_gemini(tmp_path)
            gemini_files.append(g_file)
        
        # 3. The Intelligence (AI Analysis)
        system_instruction = (
            "Act as a Strict Government Tender Auditor. "
            "Analyze these attached tender documents against the provided User Profile. "
            "Ignore irrelevant text/boilerplate. "
            "Output strictly valid JSON with no markdown formatting."
        )
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )
        
        prompt = f"User Profile: {user_profile}\n\nProvide the Eligibility Report including score, status, summary, gap_analysis, penalty_clauses, and missing_documents."
        
        # Prepare context: Prompt + All Files
        request_content = [prompt] + gemini_files
        
        logger.info("Sending request to Gemini Model...")
        response = model.generate_content(request_content)
        
        # Parse Result
        try:
            analysis_result = json.loads(response.text)
        except json.JSONDecodeError:
            logger.error("Failed to parse JSON from Gemini")
            # Attempt cleanup before raising
            await cleanup_resources(gemini_files, local_paths)
            return JSONResponse(
                status_code=500, 
                content={"error": "AI failed to generate valid JSON report", "raw_response": response.text}
            )

        # 4. Save & Deduct
        try:
            # Update DB
            current_credits = user_data.get("credits_remaining")
            current_daily = user_data.get("daily_usage_count")
            
            # Save Report
            supabase.table("analysis_reports").insert({
                "user_id": user_id,
                "report_data": analysis_result,
                "score": analysis_result.get("eligibility_score", 0),
                "status": analysis_result.get("status", "Unknown")
            }).execute()
            
            # Update Profile
            supabase.table("profiles").update({
                "credits_remaining": current_credits - 1,
                "daily_usage_count": current_daily + 1
            }).eq("id", user_id).execute()
            
            logger.info("Database updated successfully.")

        except Exception as db_e:
            logger.error(f"Database Transaction Failed: {db_e}")
            # We return the result anyway, but log the billing error
        
        # Cleanup (Triggered immediately here or background)
        # Using await here to ensure it's done, but could be background task if latency is critical
        await cleanup_resources(gemini_files, local_paths)
        
        return analysis_result

    except HTTPException as he:
        # Cleanup validation errors
        await cleanup_resources(gemini_files, local_paths)
        raise he
    except Exception as e:
        logger.error(f"Critical Backend Error: {e}")
        await cleanup_resources(gemini_files, local_paths)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
