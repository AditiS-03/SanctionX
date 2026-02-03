# backend/agents/orchestrator.py

from agents.pan_agent import handle_pan
from agents.aadhaar_agent import handle_aadhaar, handle_otp
from agents.fraud_agent import run_fraud_checks
from agents.eligibility_engine import check_eligibility
from agents.loan_options_agent import generate_loan_options
from agents.sanction_letter_generator import generate_sanction_letter

def handle_message(session, message):
    step = session.get("step", "START")
    profile = session["profile"]
    flags = session["flags"]

    # 1️⃣ GREETING
    if step == "START":
        session["step"] = "NAME"
        return "Welcome to SanctionX. Please enter your full name."

    if step == "NAME":
        profile["name"] = message
        session["step"] = "AGE"
        return "Please enter your age."

    if step == "AGE":
        profile["age"] = int(message)
        session["step"] = "GENDER"
        return "Please enter your gender (male/female)."

    if step == "GENDER":
        profile["gender"] = message.lower()
        session["step"] = "LOAN"
        return "What type of loan do you want and for what purpose?"

    if step == "LOAN":
        profile["loan_type"] = message
        session["step"] = "EMPLOYMENT"
        return "Are you salaried or self-employed?"

    if step == "EMPLOYMENT":
        emp = message.lower()
        if emp not in ["salaried", "self-employed"]:
            return "Currently, loans are only available for salaried or self-employed applicants."
        profile["employment"] = emp
        session["step"] = "INCOME"
        return "Please enter your monthly income."

    if step == "INCOME":
        profile["declared_income"] = int(message)
        session["step"] = "PAN"
        return "Please enter your PAN number."

    if step == "PAN":
        return handle_pan(session, message)

    if step == "DOCUMENT":
        session["step"] = "FRAUD"
        return "Income document received. Running fraud checks."

    if step == "FRAUD":
        fraud = run_fraud_checks(profile, flags)
        if fraud:
            session["step"] = "END"
            return "⚠ Your application is flagged as suspicious and cannot be processed."

        session["step"] = "AADHAAR"
        return "Fraud checks passed. Please enter your Aadhaar number."

    if step == "AADHAAR":
        return handle_aadhaar(session, message)

    if step == "OTP":
        return handle_otp(session, message)

    if step == "ELIGIBLE":
        result = check_eligibility(profile, flags)
        if not result["eligible"]:
            return "❌ You are not eligible due to:\n" + "\n".join(result["reasons"])

        options = generate_loan_options(profile)
        session["profile"]["options"] = options
        session["step"] = "CHOOSE"

        msg = "✅ You are eligible. Available loan options:\n"
        for i, opt in enumerate(options, 1):
            msg += f"\nOption {i}: ₹{opt['amount']} | {opt['months']} months | {opt['rate']}% | EMI ₹{opt['emi']}"
        msg += "\n\nPlease choose Option 1, 2, or 3."

        return msg

    if step == "CHOOSE":
        choice = int(message.strip()[-1]) - 1
        chosen = profile["options"][choice]
        profile["final_offer"] = chosen
        session["step"] = "SANCTION"
        return f"Loan approved for ₹{chosen['amount']} at {chosen['rate']}%. Generating sanction letter."

    if step == "SANCTION":
        path = generate_sanction_letter(profile)
        session["profile"]["sanction_path"] = path
        return f"🎉 Loan approved.\nYour sanction letter is ready.\nPlease download it.\nPlease visit your closest bank branch for disbursement of the loan amount."

    return "Thank you for using SanctionX."
