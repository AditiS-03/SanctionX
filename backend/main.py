from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image
import os
import re
from fastapi.responses import FileResponse

from state import get_session, reset_sessions
from agents.orchestrator import handle_message
from agents.fraud_agent import run_fraud_checks

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract\tesseract.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    session = get_session(req.session_id)
    reply = handle_message(session, req.message)
    return {"reply": reply}

@app.post("/upload-doc")
async def upload_doc(file: UploadFile = File(...), session_id: str = "demo-user"):
    session = get_session(session_id)

    contents = await file.read()
    temp_file = "temp.png"

    with open(temp_file, "wb") as f:
        f.write(contents)

    text = pytesseract.image_to_string(Image.open(temp_file))
    os.remove(temp_file)

    session["profile"]["doc_text"] = text
    income = extract_income(text)

    if income is None:
        return {"valid": False, "reason": "Could not detect income"}

    session["profile"]["doc_income"] = income
    session["step"] = "FRAUD"

    return {"valid": True, "income": income}

def extract_income(text: str):
    text = text.lower().replace(",", "").replace("₹", "")

    patterns = [
        r"net\s*pay\s*(\d{4,7})",
        r"gross\s*salary\s*(\d{4,7})",
        r"salary\s*(\d{4,7})",
        r"income\s*(\d{4,7})"
    ]

    for p in patterns:
        m = re.search(p, text)
        if m:
            return int(m.group(1))
    return None


@app.get("/download-sanction")
def download_sanction(session_id: str):
    session = get_session(session_id)
    path = session["profile"].get("sanction_path")

    if not path:
        return {"error": "No sanction letter found"}

    return FileResponse(path, media_type="application/pdf", filename="sanction_letter.pdf")


@app.post("/reset")
def reset():
    reset_sessions()
    return {"status": "reset"}
