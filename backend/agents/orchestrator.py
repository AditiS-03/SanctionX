from agents.fraud_agent import check_fraud
from agents.chat_agent import chat_assist


def handle_message(session, message: str):
    step = session.get("step", "START")
    profile = session["profile"]
    flags = session["flags"]

    # STEP 1: Greeting (always first)
    if step == "START":
        session["step"] = "INCOME"
        return "Welcome to SanctionX, your digital loan officer. Please enter your monthly income."

    # STEP 2: Income
    if step == "INCOME":
        # basic numeric validation
        try:
            income = int(message)
            if income <= 0:
                return "Please enter a valid monthly income amount."
        except:
            return "Please enter your income as a number (e.g., 30000)."

        profile["income"] = income
        session["step"] = "LOAN_TYPE"
        return "What type of loan do you want and for what purpose?"

    # STEP 3: Loan type & purpose
    if step == "LOAN_TYPE":
        profile["loan_type"] = message
        session["step"] = "EMPLOYMENT"
        return "Are you salaried or self-employed?"

    # STEP 4: Employment type
    if step == "EMPLOYMENT":
        emp = message.lower()
        if emp not in ["salaried", "self-employed", "self employed"]:
            return "Please reply with either 'salaried' or 'self-employed'."

        profile["employment"] = emp
        session["step"] = "PAN"
        return "Please enter your PAN number for verification."

    # STEP 5: PAN verification (handled via API in main.py)
    if step == "PAN":
        # We only store PAN here, actual verification happens in /verify-pan
        profile["pan"] = message.upper()
        session["step"] = "DOCUMENT"
        return "Thank you. PAN verified. Please upload your income proof document or allow DigiLocker access."

    # STEP 6: Document upload
    if step == "DOCUMENT":
        # User should upload file, not type
        return "Please upload your income proof document using the upload button."

    # STEP 7: Credit check (simulated for now)
    if step == "CREDIT":
        profile["credit_score"] = 720  # simulated
        session["step"] = "FRAUD"
        return "Credit profile checked. Performing fraud risk assessment."

    # STEP 8: Fraud check
    if step == "FRAUD":
        if flags.get("fraud_risk"):
            session["step"] = "END"
            return "⚠️ Application flagged as high risk."

        session["step"] = "AADHAAR"
        return "Fraud checks passed. Please enter your Aadhaar number for eKYC verification."

    if step == "AADHAAR":
        return "An OTP has been sent to your Aadhaar-linked mobile number. Please enter the OTP."

    if step == "AADHAAR_OTP":
        return "Verifying OTP. Please wait..."


    # STEP 10: Final eligibility
    if step == "ELIGIBILITY":
        income = profile.get("income", 0)
        credit = profile.get("credit_score", 0)

        if income >= 25000 and credit >= 700 and flags.get("pan_verified") and flags.get("kyc_verified"):
            session["step"] = "END"
            return "✅ You are eligible for a loan. Would you like to proceed with approval?"
        else:
            session["step"] = "END"
            return "❌ Unfortunately, you do not meet the eligibility criteria at this time."
    
        # If message is not part of flow → use OpenRouter for help
    if step not in ["START","INCOME","LOAN_TYPE","EMPLOYMENT","PAN","DOCUMENT","CREDIT","FRAUD","KYC","ELIGIBILITY"]:
        return chat_assist(message)
    # STEP 11: End
    if step == "END":
        return "Thank you for using SanctionX."
    return "Thank you for using SanctionX."
  

