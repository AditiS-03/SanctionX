def handle_loan_type(session, message):
    session["profile"]["loan_type"] = message
    session["step"] = "INCOME"
    return "Please enter your monthly income."
