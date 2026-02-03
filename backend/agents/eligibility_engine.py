# backend/agents/eligibility_engine.py

def check_eligibility(profile, flags):
    reasons = []

    age = profile.get("age", 0)
    income = profile.get("declared_income", 0)
    employment = profile.get("employment")
    doc_income = profile.get("doc_income", 0)

    if age < 18:
        reasons.append("Applicant must be at least 18 years old.")

    if employment not in ["salaried", "self-employed"]:
        reasons.append("Applicant must be salaried or self-employed.")

    if income < 15000:
        reasons.append("Minimum income requirement is ₹15,000.")

    if not flags.get("pan_verified"):
        reasons.append("PAN verification failed.")

    if not flags.get("kyc_verified"):
        reasons.append("Aadhaar eKYC not completed.")

    if doc_income:
        diff = abs(doc_income - income)
        if diff > (0.2 * income):
            reasons.append("Declared income does not match uploaded document.")

    if flags.get("fraud_risk"):
        reasons.append("Application flagged as high fraud risk.")

    eligible = len(reasons) == 0

    return {
        "eligible": eligible,
        "reasons": reasons
    }
