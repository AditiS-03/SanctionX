def run_fraud_checks(profile, flags):
    """
    Returns True if fraud is detected, else False
    """

    declared_income = profile.get("declared_income", 0)
    doc_income = profile.get("doc_income", 0)
    employment = profile.get("employment", "")
    age = profile.get("age", 0)

    # 🚨 Rule 1: Income mismatch > 20%
    if doc_income and declared_income:
        diff = abs(doc_income - declared_income)
        if diff > (0.2 * declared_income):
            flags["fraud_reason"] = "Income mismatch between declared and document."
            return True

    # 🚨 Rule 2: Unemployed but has income
    if employment not in ["salaried", "self-employed"] and declared_income > 0:
        flags["fraud_reason"] = "Income declared but employment is unemployed."
        return True

    # 🚨 Rule 3: Unrealistic income
    if declared_income > 500000:
        flags["fraud_reason"] = "Unrealistically high monthly income."
        return True

    # 🚨 Rule 4: Age-risk
    if age < 18 or age > 70:
        flags["fraud_reason"] = "Invalid applicant age."
        return True

    # 🚨 Rule 5: PAN or Aadhaar missing
    if not flags.get("pan_verified"):
        flags["fraud_reason"] = "PAN not verified."
        return True

    if not flags.get("kyc_verified"):
        flags["fraud_reason"] = "Aadhaar eKYC not completed."
        return True

    # ✅ No fraud detected
    return False
