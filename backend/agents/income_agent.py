def handle_income(session, message):
    try:
        income = int(message)
        session["profile"]["income"] = income
        session["step"] = "EMPLOYMENT"
        return "Are you salaried or self-employed?"
    except:
        return "Please enter income as a number (e.g. 40000)."
