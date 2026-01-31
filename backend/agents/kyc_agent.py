def handle_kyc(session):
    session["profile"]["kyc_verified"] = True
    session["step"] = "ELIGIBILITY"
    return "KYC completed successfully. Checking your loan eligibility."
