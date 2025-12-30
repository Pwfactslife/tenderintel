import os
import json
import logging
import time
import tempfile
import asyncio
import traceback
from typing import List, Dict, Any
# from dotenv import load_dotenv # Verified: Keep commented on Vercel to avoid issues

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from supabase import create_client, Client

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---

# Attempt to load from standard keys, fallback to VITE_ keys if missing
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
# Supabase key might be SUPABASE_KEY, SUPABASE_PUBLISHABLE_KEY, or the frontend versions
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("VITE_SUPABASE_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

# Gemini Model Configurations
MODEL_NAME = "gemini-1.5-flash"
DAILY_LIMIT = 50
GEMINI_REQUEST_LIMIT = 13
GEMINI_REQUESTS = []

app = FastAPI(title="Tender Intelligence Hub API", version="2.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CLIENT INITIALIZATION (DEFENSIVE) ---
supabase: Client = None

try:
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Supabase Client Initialized Successfully")
        except Exception as e:
            logger.error(f"Supabase Init Failed: {e}")
    else:
        logger.warning("Supabase Credentials Missing - Database features will fail")
        
    if GEMINI_API_KEY:
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            logger.info("Gemini Client Initialized Successfully")
        except Exception as e:
            logger.error(f"Gemini Init Failed: {e}")
    else:
        logger.warning("Gemini API Key Missing - Analysis will fail")
        
except Exception as e:
    logger.critical(f"Global Initialization Error (Non-Fatal): {e}")

# --- HELPER FUNCTIONS ---

async def check_rate_limit():
    global GEMINI_REQUESTS
    current_time = time.time()
    GEMINI_REQUESTS = [t for t in GEMINI_REQUESTS if current_time - t < 60]
    if len(GEMINI_REQUESTS) >= GEMINI_REQUEST_LIMIT:
        raise HTTPException(429, "High Traffic. Please wait 1 minute.")
    GEMINI_REQUESTS.append(current_time)

async def check_user_limits(user_id: str):
    if supabase is None:
        raise HTTPException(503, "Database Service Unavailable (Init Failed)")
        
    try:
        response = supabase.table("profiles").select("credits_remaining, daily_usage_count").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(404, f"User {user_id} not found")
            
        user_data = response.data[0]
        if user_data.get("credits_remaining", 0) <= 0:
            raise HTTPException(402, "Insufficient Credits")
        if user_data.get("daily_usage_count", 0) >= DAILY_LIMIT:
            raise HTTPException(429, "Daily Limit Reached")
            
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"DB Error: {e}")
        raise HTTPException(500, f"Authorization Failed: {str(e)}")

async def upload_to_gemini(path: str):
    try:
        file = genai.upload_file(path, mime_type="application/pdf")
        while file.state.name == "PROCESSING":
            await asyncio.sleep(2)
            file = genai.get_file(file.name)
        if file.state.name == "FAILED":
            raise ValueError("Gemini processing failed")
        return file
    except Exception as e:
        logger.error(f"Upload Error: {e}")
        raise

async def cleanup_resources(gemini_files, local_paths):
    for gf in gemini_files:
        try:
            genai.delete_file(gf.name)
        except: pass
    for lp in local_paths:
        try:
            if os.path.exists(lp): os.remove(lp)
        except: pass

# --- ENDPOINTS ---

@app.get("/")
def home():
    # Diagnostic Health Check
    return {
        "status": "Online",
        "health": {
            "supabase": supabase is not None,
            "gemini": bool(GEMINI_API_KEY),
            "env_check": {
                "S_URL": bool(SUPABASE_URL),
                "S_KEY": bool(SUPABASE_KEY),
                "G_KEY": bool(GEMINI_API_KEY)
            }
        }
    }

@app.get("/tenders/{user_id}")
async def get_my_tenders(user_id: str):
    if supabase is None:
        return [] # Fail gracefully
    try:
        response = supabase.table("analysis_reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        tenders = []
        for item in response.data or []:
            report = item.get("report_data", {})
            tenders.append({
                "tender_id": report.get("tender_id") or report.get("Tender ID") or "Unknown",
                "eligibility_score": item.get("score"),
                "status": item.get("status"),
                "created_at": item.get("created_at")
            })
        return tenders
    except Exception as e:
        logger.error(f"Fetch Error: {e}")
        return []

@app.post("/analyze")
async def analyze_tender(
    bg_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    user_id: str = Form(...),
    user_profile: str = Form(...)
):
    g_files = []
    l_paths = []
    try:
        await check_rate_limit()
        user_data = await check_user_limits(user_id)
        
        for file in files:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(await file.read())
                l_paths.append(tmp.name)
            g_files.append(await upload_to_gemini(tmp.name))
            
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction="Analyze tender PDF against User Profile. Return JSON: {tender_id, eligibility_score, status, summary, gap_analysis, penalty_clauses, missing_documents}",
            generation_config={"response_mime_type": "application/json"}
        )
        
        response = model.generate_content([f"Profile: {user_profile}", *g_files])
        result = json.loads(response.text)
        
        # Deduction Logic
        try:
            if supabase:
                supabase.table("analysis_reports").insert({
                    "user_id": user_id, "report_data": result, 
                    "score": result.get("eligibility_score"), "status": result.get("status")
                }).execute()
                
                supabase.table("profiles").update({
                    "credits_remaining": user_data.get("credits_remaining") - 1,
                    "daily_usage_count": user_data.get("daily_usage_count") + 1
                }).eq("id", user_id).execute()
        except Exception as e:
            logger.error(f"Billing Error: {e}")

        await cleanup_resources(g_files, l_paths)
        return result

    except HTTPException as he:
        await cleanup_resources(g_files, l_paths)
        raise he
    except Exception as e:
        await cleanup_resources(g_files, l_paths)
        return JSONResponse(status_code=500, content={"error": "Internal Error", "details": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
