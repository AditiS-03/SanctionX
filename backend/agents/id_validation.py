import re

def validate_aadhaar(aadhaar):
    return bool(re.fullmatch(r"\d{12}", aadhaar))

def validate_pan(pan):
    return bool(re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", pan))

