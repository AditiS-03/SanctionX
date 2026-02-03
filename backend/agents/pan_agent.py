import re

def handle_pan(session, pan: str):
    pan = pan.strip().upper()
    pattern = r"[A-Z]{5}[0-9]{4}[A-Z]"

    if not re.fullmatch(pattern, pan):
        return "❌ Invalid PAN format. Please enter a valid PAN number (e.g. ABCDE1234F)."

    # mock verification success
    session["flags"]["pan_verified"] = True
    session["profile"]["pan"] = pan
    session["step"] = "DOCUMENT"

    return "✅ PAN verified successfully. Please upload your income proof document."
