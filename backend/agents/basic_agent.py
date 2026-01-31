def handle_basic(session, message):
    session["profile"]["loan_info"] = message
    session["step"] = "EMPLOYMENT"
    return "Please enter your name, age and address."
