def handle_employment(session, message):
    msg = message.lower()
    if "salaried" in msg:
        session["profile"]["employment"] = "salaried"
    elif "self" in msg:
        session["profile"]["employment"] = "self-employed"
    else:
        return "Please reply with salaried or self-employed."

    session["step"] = "DOCUMENT"
    return "Please upload your income proof document."
