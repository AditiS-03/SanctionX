from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image
import os
import re
import requests

from state import get_session, reset_sessions
from agents.orchestrator import handle_message
from agents.fraud_agent import check_fraud

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODELS ----------------
class ChatRequest(BaseModel):
    session_id: str
    message: str


# ---------------- CONFIG (PAN API) ----------------
PAN_API_KEY = "YOUR_SANDBOX_API_KEY"
PAN_API_URL = "https://sandbox.surepass.io/api/v1/pan/verify"
AADHAAR_API_KEY = "YOUR_SANDBOX_API_KEY"
AADHAAR_OTP_URL = "https://api.sandbox.co.in/kyc/aadhaar/okyc/otp"
AADHAAR_VERIFY_URL = "https://api.sandbox.co.in/kyc/aadhaar/okyc/verify"

@app.post("/aadhaar-generate-otp")
def aadhaar_generate_otp(aadhaar: str, session_id: str):
    session = get_session(session_id)

    headers = {
        "Authorization": f"Bearer {AADHAAR_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {"aadhaar_number": aadhaar}

    r = requests.post(AADHAAR_OTP_URL, json=payload, headers=headers)
    data = r.json()

    if data.get("success"):
        session["profile"]["aadhaar"] = aadhaar
        session["step"] = "AADHAAR_OTP"
        return {"success": True}
    else:
        return {"success": False, "reason": "Failed to send OTP"}

@app.post("/aadhaar-verify-otp")
def aadhaar_verify_otp(otp: str, session_id: str):
    session = get_session(session_id)

    headers = {
        "Authorization": f"Bearer {AADHAAR_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "aadhaar_number": session["profile"]["aadhaar"],
        "otp": otp
    }

    r = requests.post(AADHAAR_VERIFY_URL, json=payload, headers=headers)
    data = r.json()

    if data.get("success"):
        session["flags"]["kyc_verified"] = True
        session["profile"]["aadhaar_name"] = data["data"].get("name")
        session["step"] = "ELIGIBILITY"
        return {"success": True}
    else:
        return {"success": False, "reason": "OTP verification failed"}



# ---------------- CHAT ----------------
@app.post("/chat")
def chat(req: ChatRequest):
    session = get_session(req.session_id)
    reply = handle_message(session, req.message)
    return {"reply": reply}


# ---------------- PAN VERIFICATION ----------------
@app.post("/verify-pan")
def verify_pan(pan: str, session_id: str):
    session = get_session(session_id)

    headers = {
        "Authorization": f"Bearer {PAN_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {"pan": pan}

    try:
        r = requests.post(PAN_API_URL, json=payload, headers=headers, timeout=10)
        data = r.json()
    except:
        return {"valid": False, "reason": "PAN service unavailable"}

    if data.get("success"):
        session["flags"]["pan_verified"] = True
        session["profile"]["pan_name"] = data["data"].get("name", "")
        return {"valid": True, "name": session["profile"]["pan_name"]}
    else:
        session["flags"]["pan_verified"] = False
        return {"valid": False, "reason": "PAN verification failed"}


# ---------------- DOCUMENT UPLOAD ----------------
@app.post("/upload-doc")
async def upload_doc(file: UploadFile = File(...), session_id: str = "demo-user"):
    session = get_session(session_id)

    contents = await file.read()
    temp_file = "temp_upload.png"

    with open(temp_file, "wb") as f:
        f.write(contents)

    text = pytesseract.image_to_string(Image.open(temp_file))
    os.remove(temp_file)

    # store OCR text for fraud checks
    session["profile"]["doc_text"] = text

    income = extract_income(text)

    if income is None:
        return {"valid": False, "reason": "Could not detect income from document"}

    session["profile"]["income"] = income
    session["step"] = "CREDIT"

    return {"valid": True, "income": income}


def extract_income(text: str):
    match = re.search(r"(salary|income|net).*?(\d{4,})", text.lower())
    if match:
        return int(match.group(2))
    return None


# ---------------- DIGILOCKER (SIMULATED) ----------------
@app.post("/digilocker-fetch")
def digilocker_fetch(doc_type: str, session_id: str):
    session = get_session(session_id)

    fake_docs = {
        "itr": "ITR document fetched from DigiLocker.",
        "aadhaar": "Aadhaar fetched from DigiLocker.",
        "bank_statement": "Bank statement fetched from DigiLocker."
    }

    if doc_type in fake_docs:
        session["profile"]["doc_text"] = fake_docs[doc_type]
        session["step"] = "CREDIT"
        return {"success": True, "message": fake_docs[doc_type]}
    else:
        return {"success": False, "message": "Document not found in DigiLocker"}


# ---------------- FRAUD CHECK ----------------
@app.post("/run-fraud-check")
def run_fraud_check(session_id: str):
    session = get_session(session_id)
    profile = session["profile"]
    flags = session["flags"]

    result = check_fraud(profile, flags)

    if result["fraud"]:
        flags["fraud_risk"] = True
    else:
        flags["fraud_risk"] = False

    return result


# ---------------- KYC PHOTO ----------------
@app.post("/kyc-photo")
async def kyc_photo(file: UploadFile = File(...), session_id: str = "demo-user"):
    session = get_session(session_id)
    session["flags"]["kyc_verified"] = True
    session["step"] = "ELIGIBILITY"
    return {"status": "KYC image received"}


# ---------------- RESET ----------------
@app.post("/reset")
def reset():
    reset_sessions()
    return {"status": "session reset"}
