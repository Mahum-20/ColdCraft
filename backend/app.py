import os
import uvicorn
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from email_verifier import run_email_discovery
from pitch_engine import extract_tech_and_pain_points, generate_fallback_pitches, generate_pitches_with_gemini

app = FastAPI(
    title="ColdCraft AI API & Web App",
    description="Free Email Permutation Finder & Technical Pitch Generator",
    version="1.0.0"
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailVerificationRequest(BaseModel):
    first_name: str
    last_name: str
    domain: str

class PitchGenerationRequest(BaseModel):
    cto_name: str = "Alex Rivera"
    company_name: str = "ScaleFlow"
    domain: str = "scaleflow.io"
    verified_email: Optional[str] = "alex.rivera@scaleflow.io"
    job_snippet: str
    sender_name: str = "Mahum"
    sender_title: str = "CS Gold Medalist & Senior Backend Engineer"
    sender_specialty: str = "high-throughput Django/Celery architectures & PostgreSQL optimization"
    availability: str = "Available for up to 20 hours/week with zero onboarding lag"
    gemini_api_key: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {"status": "online", "app": "ColdCraft AI"}

@app.post("/api/verify-email")
def verify_email_endpoint(req: EmailVerificationRequest):
    if not req.domain:
        raise HTTPException(status_code=400, detail="Domain is required.")
    
    try:
        results = run_email_discovery(req.first_name, req.last_name, req.domain)
        return {
            "success": True,
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email verification failed: {str(e)}")

@app.post("/api/extract-pain-points")
def extract_pain_points_endpoint(payload: Dict[str, str] = Body(...)):
    job_snippet = payload.get("job_snippet", "")
    try:
        extracted = extract_tech_and_pain_points(job_snippet)
        return {
            "success": True,
            "data": extracted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pain point extraction failed: {str(e)}")

@app.post("/api/generate-pitches")
async def generate_pitches_endpoint(req: PitchGenerationRequest):
    try:
        extracted_info = extract_tech_and_pain_points(req.job_snippet)
        
        if req.gemini_api_key and req.gemini_api_key.strip():
            pitches = await generate_pitches_with_gemini(
                api_key=req.gemini_api_key.strip(),
                cto_name=req.cto_name,
                company_name=req.company_name,
                domain=req.domain,
                job_snippet=req.job_snippet,
                extracted_info=extracted_info,
                sender_name=req.sender_name,
                sender_title=req.sender_title,
                sender_specialty=req.sender_specialty,
                availability=req.availability
            )
        else:
            pitches = generate_fallback_pitches(
                cto_name=req.cto_name,
                company_name=req.company_name,
                domain=req.domain,
                job_snippet=req.job_snippet,
                extracted_info=extracted_info,
                sender_name=req.sender_name,
                sender_title=req.sender_title,
                sender_specialty=req.sender_specialty,
                availability=req.availability
            )
            
        return {
            "success": True,
            "extracted_info": extracted_info,
            "pitches": pitches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pitch generation failed: {str(e)}")

# Mount static files if frontend is built (dist folder)
dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_p = os.path.join(dist_path, full_path)
        if os.path.exists(file_p) and os.path.isfile(file_p):
            return FileResponse(file_p)
        return FileResponse(os.path.join(dist_path, "index.html"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
