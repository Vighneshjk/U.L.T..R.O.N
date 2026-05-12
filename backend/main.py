import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Add project root to sys.path to resolve 'backend' module
root_path = Path(__file__).parent.parent
if str(root_path) not in sys.path:
    sys.path.append(str(root_path))

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

import shutil
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from backend.core.cognitive_engine import cognitive_engine
from backend.core.autonomous_engine import autonomous_agent
from pydantic import BaseModel

app = FastAPI(
    title="U.L.T.R.O.N System Core",
    description="The cognitive core of Project U.L.T.R.O.N",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    is_ultimate: bool = False
    personality: str = "Logic"

@app.post("/chat")
async def chat(request: ChatRequest):
    # Convert Pydantic models to dicts for the cognitive engine
    history_dicts = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []
    result = await cognitive_engine.process_input(
        request.message, 
        history=history_dicts, 
        is_ultimate=request.is_ultimate,
        personality=request.personality
    )
    return result

@app.post("/analyze_image_upload")
async def analyze_image_upload(file: UploadFile = File(...)):
    import tempfile
    
    # Save the file temporarily
    temp_dir = tempfile.gettempdir()
    file_location = os.path.join(temp_dir, file.filename)
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Analyze it
    intel_engine = cognitive_engine.intel_engine
    ai_result = intel_engine.detect_ai_image(file_location)
    exif_result = intel_engine.extract_image_exif_location(file_location)
    vision_scan = intel_engine.neural_vision_scan(file_location)
    
    # Format a response for the UI
    response = f"Initiating Image Forensics Protocol on {file.filename}...\n\n"
    response += "**[NEURAL AI DETECTION]**\n" + "\n".join([f"- {k}: {v}" for k, v in ai_result.items()]) + "\n\n"
    response += "**[NEURAL VISION SCAN]**\n" + "\n".join([f"- {k}: {v}" for k, v in vision_scan.items()]) + "\n\n"
    response += "**[EXIF GPS DATA]**\n" + "\n".join([f"- {k}: {v}" for k, v in exif_result.items()])
    
    # Clean up the file
    try:
        os.remove(file_location)
    except:
        pass
        
    return {
        "response": response,
        "data": exif_result,
        "model_used": "IntelligenceEngine.ImageForensics"
    }

@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "U.L.T.R.O.N",
        "version": "0.1.0",
        "message": "All systems operational. Peace in our time."
    }

@app.get("/task_logs")
async def get_task_logs():
    logs = autonomous_agent.get_new_logs()
    return {"logs": logs}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
