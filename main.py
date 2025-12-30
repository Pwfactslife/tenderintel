import os
import json
import logging
import time
import tempfile
import asyncio
import traceback
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

# ... (rest of loading code same as before, ensuring indentation is correct)

# ... (skip to home function)

@app.get("/")
def home():
    try:
        return {
            "message": "Tender Intelligence API is Running!", 
            "docs": "/docs",
            "health_check": {
                "supabase_url_configured": bool(SUPABASE_URL),
                "supabase_key_configured": bool(SUPABASE_KEY),
                "gemini_key_configured": bool(GEMINI_API_KEY),
                "supabase_client_initialized": supabase is not None,
                "debug_values": {
                    "SUPABASE_URL_TYPE": str(type(SUPABASE_URL)),
                    "SUPABASE_URL_REPR": repr(SUPABASE_URL), # This reveals empty strings or spaces
                },
                "available_env_keys": [k for k in os.environ.keys() if any(x in k for x in ["SUPA", "GEMINI", "VITE", "VERCEL", "KEY", "URL"])]
            }
        }
    except Exception as e:
        return {"error": "Health check generation failed", "details": str(e), "trace": traceback.format_exc()}

# Attempt to load from standard keys, fallback to VITE_ keys if missing
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
# Supabase key might be SUPABASE_KEY, SUPABASE_PUBLISHABLE_KEY, or the frontend versions
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("VITE_SUPABASE_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

# Check but DO NOT CRASH
missing_vars = []
if not SUPABASE_URL: missing_vars.append("SUPABASE_URL")
if not SUPABASE_KEY: missing_vars.append("SUPABASE_KEY")
if not GEMINI_API_KEY: missing_vars.append("GEMINI_API_KEY")

if missing_vars:
    logger.warning(f"Missing Env Vars: {missing_vars}")

# Initialize Clients
supabase: Client = None

# Lazy init or safe init
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    logger.critical(f"Failed to initialize clients: {e}")

# ... (Previous code)

@app.get("/")
def home():
    return {
        "message": "Tender Intelligence API is Running!", 
        "docs": "/docs",
        "health_check": {
            "supabase_url_configured": bool(SUPABASE_URL),
            "supabase_key_configured": bool(SUPABASE_KEY),
            "gemini_key_configured": bool(GEMINI_API_KEY),
            "supabase_client_initialized": supabase is not None,
            "debug_values": {
                "SUPABASE_URL_LEN": len(str(SUPABASE_URL)) if SUPABASE_URL else 0,
                "SUPABASE_KEY_LEN": len(str(SUPABASE_KEY)) if SUPABASE_KEY else 0,
                "GEMINI_KEY_LEN": len(str(GEMINI_API_KEY)) if GEMINI_API_KEY else 0,
                "SUPABASE_URL_START": str(SUPABASE_URL)[:4] if SUPABASE_URL else "None",
            },
            "available_env_keys": [k for k in os.environ.keys() if any(x in k for x in ["SUPA", "GEMINI", "VITE", "VERCEL", "KEY", "URL"])]
        }
    }


# Gemini Model Configurations
# Flash 1.5 - High efficiency, multimodal
MODEL_NAME = "gemini-1.5-flash"
DAILY_LIMIT = 50

# Rate Limiting Configuration
GEMINI_REQUEST_LIMIT = 13  # Max requests per minute
GEMINI_REQUESTS = []       # Timestamp tracker

app = FastAPI(title="Tender Intelligence Hub API", version="2.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def check_rate_limit():
    """
    Enforces a hard limit of 13 requests per minute.
    """
    global GEMINI_REQUESTS
    current_time = time.time()
    
    # Filter out timestamps older than 60 seconds
    GEMINI_REQUESTS = [t for t in GEMINI_REQUESTS if current_time - t < 60]
    
    if len(GEMINI_REQUESTS) >= GEMINI_REQUEST_LIMIT:
        logger.warning("Rate limit exceeded.")
        raise HTTPException(
            status_code=429, 
            detail="High Traffic. Your tender is queued. Please try again in 1 minute."
        )
    
    GEMINI_REQUESTS.append(current_time)

async def check_user_limits(user_id: str):
    """
    Checks Profit Protection rules:
    1. Credits > 0
    2. Daily Usage < 50
    """
    try:
        if supabase is None:
            raise Exception("Database client is not initialized. Check server logs/env vars.")
            
        # Use execute() instead of single() to avoid crash if no row found
        response = supabase.table("profiles").select("credits_remaining, daily_usage_count").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            logger.warning(f"Profile not found for user: {user_id}")
            raise HTTPException(status_code=404, detail=f"User profile with ID {user_id} not found in database.")
        
        user_data = response.data[0]
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
        # Return actual error for debugging
        raise HTTPException(status_code=500, detail=f"Authorization Error: {str(e)}")

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
    return {
        "message": "Tender Intelligence API is Running!", 
        "docs": "/docs",
        "health_check": {
            "supabase_url_configured": bool(SUPABASE_URL),
            "supabase_key_configured": bool(SUPABASE_KEY),
            "gemini_key_configured": bool(GEMINI_API_KEY),
            "supabase_client_initialized": supabase is not None,
            "debug_values": {
                "SUPABASE_URL_LEN": len(str(SUPABASE_URL)) if SUPABASE_URL else 0,
                "SUPABASE_KEY_LEN": len(str(SUPABASE_KEY)) if SUPABASE_KEY else 0,
                "GEMINI_KEY_LEN": len(str(GEMINI_API_KEY)) if GEMINI_API_KEY else 0,
                "SUPABASE_URL_START": str(SUPABASE_URL)[:4] if SUPABASE_URL else "None",
            },
            "available_env_keys": [k for k in os.environ.keys() if any(x in k for x in ["SUPA", "GEMINI", "VITE", "VERCEL", "KEY", "URL"])]
        }
    }

@app.get("/tenders/{user_id}")
async def get_my_tenders(user_id: str):
    """
    Fetches analysis history for a specific user.
    """
    try:
        response = supabase.table("analysis_reports")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
            
        if not response.data:
            return []
            
        # Transform data for frontend
        tenders = []
        for item in response.data:
            report = item.get("report_data", {})
            # Try to get tender_id from report, fallback to a generic name or date
            tender_id = report.get("tender_id") or report.get("Tender ID") or f"Tender_{item.get('created_at', 'Unknown')[:10]}"
            
            tenders.append({
                "tender_id": tender_id,
                "eligibility_score": item.get("score"),
                "status": item.get("status"),
                "created_at": item.get("created_at")
            })
            
        return tenders
        
    except Exception as e:
        logger.error(f"Error fetching tenders for {user_id}: {e}")
        # Don't crash, just return error in a clean way or empty list
        raise HTTPException(status_code=500, detail=str(e))

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
    
    gemini_files = []
    local_paths = []

    try:
        # --- GLOBAL ERROR HANDLING BLOCK ---
        
        # 0. Rate Limiting
        await check_rate_limit()

        # 1. Profit Protection
        user_data = await check_user_limits(user_id)
        
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
            "Output strictly valid JSON with no markdown formatting. "
            "Ensure the JSON has keys: tender_id, eligibility_score, status, summary, gap_analysis, penalty_clauses, missing_documents."
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
        await cleanup_resources(gemini_files, local_paths)
        
        return analysis_result

    except HTTPException as he:
        # Re-raise known HTTP exceptions (like 429, 402, 404)
        await cleanup_resources(gemini_files, local_paths)
        logger.warning(f"Handled HTTPException: {he.detail}")
        raise he

    except Exception as e:
        # Catch-all for "Stuck" uploads (Critical Bug Fix)
        # Log the full traceback
        error_trace = traceback.format_exc()
        logger.error(f"CRITICAL BACKEND CRASH: {e}\n{error_trace}")
        
        # Cleanup resources if possible
        await cleanup_resources(gemini_files, local_paths)
        
        # RETURN CLEAN 500 JSON
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error", 
                "details": str(e),
                "trace_id": str(time.time()) # Optional: helps with debugging
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
