def handle_self_employed(session, message):
    session["profile"]["documents_uploaded"] = True
    session["step"] = "KYC"
    return "Documents received. Starting live KYC verification."
