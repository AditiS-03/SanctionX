# fraud_agent.py

def check_fraud(profile: dict, flags: dict):
    """
    Rule-based fraud detection engine.
    Returns risk score and reasons.
    """

    risk_score = 0
    reasons = []

    income = int(profile.get("income", 0))
    loan_amount = int(profile.get("loan_amount", 0)) if profile.get("loan_amount") else 0
    age = int(profile.get("age", 0)) if profile.get("age") else 0
    doc_text = profile.get("doc_text", "").lower()

    # Rule 1: PAN must be verified
    if not flags.get("pan_verified"):
        risk_score += 40
        reasons.append("PAN not verified")

    # Rule 2: Income vs Loan mismatch
    if loan_amount > 0 and income > 0:
        if loan_amount > income * 20:
            risk_score += 30
            reasons.append("Loan amount is unusually high compared to income")

    # Rule 3: Very high income for young age
    if age > 0 and income > 0:
        if age < 21 and income > 50000:
            risk_score += 20
            reasons.append("High income reported for very young age")

    # Rule 4: Suspicious keywords in document OCR
    suspicious_words = ["edited", "photoshop", "fake", "sample", "dummy"]
    for word in suspicious_words:
        if word in doc_text:
            risk_score += 15
            reasons.append("Suspicious patterns detected in uploaded document")
            break

    # Rule 5: Multiple failed attempts (optional flag)
    if flags.get("multiple_attempts"):
        risk_score += 20
        reasons.append("Multiple verification attempts detected")

    fraud = risk_score >= 60

    return {
        "fraud": fraud,
        "risk_score": risk_score,
        "reasons": reasons
    }
