def handle_eligibility(session):
    income = session["profile"].get("income", 0)
    credit = session["profile"].get("credit_score", 0)
    kyc = session["profile"].get("kyc_verified", False)

    if income >= 25000 and credit >= 700 and kyc:
        session["profile"]["approved_amount"] = 500000
        session["step"] = "EMI"
        return "You are eligible for a loan of ₹5,00,000. Calculating EMI."
    else:
        return "Based on your profile, you are not eligible for a loan."
