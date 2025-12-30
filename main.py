from fastapi import FastAPI
import traceback
import sys

# DEBUG MODE: Minimal execution to test imports
app = FastAPI()

dependency_status = {}

try:
    import google.generativeai as genai
    dependency_status["google-generativeai"] = "OK"
except Exception:
    dependency_status["google-generativeai"] = traceback.format_exc()

try:
    from supabase import create_client
    dependency_status["supabase"] = "OK"
except Exception:
    dependency_status["supabase"] = traceback.format_exc()
    
try:
    from dotenv import load_dotenv
    dependency_status["python-dotenv"] = "OK"
except Exception:
    dependency_status["python-dotenv"] = traceback.format_exc()

@app.get("/")
def home():
    return {
        "status": "Import Debug Mode",
        "python_version": sys.version,
        "dependencies": dependency_status
    }
