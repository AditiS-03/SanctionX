def handle_credit(session):
    income = session["profile"].get("income", 0)
    if income >= 25000:
        session["profile"]["credit_score"] = 720
        session["step"] = "KYC"
        return "Your credit profile looks good. Please allow camera permission for video KYC verification."
    else:
        session["step"] = "ELIGIBILITY"
        session["profile"]["eligible"] = False
        return "Your income does not meet minimum eligibility criteria."
