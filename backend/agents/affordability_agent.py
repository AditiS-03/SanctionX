def handle_affordability(session):
    income = session["profile"]["income"]
    tenure = session["loan"]["tenure"]

    max_emi = income * 0.4
    monthly_rate = 0.18 / 12

    loan_amount = (max_emi * tenure) / (1 + monthly_rate)
    loan_amount = int(loan_amount)

    session["loan"]["amount"] = loan_amount
    session["step"] = "APPROVE"

    return (
        f"For a tenure of {tenure} months, "
        f"you are eligible for a loan up to ₹{loan_amount}. "
        "Shall I proceed with approval?"
    )
