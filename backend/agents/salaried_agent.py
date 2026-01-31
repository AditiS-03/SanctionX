def handle_salaried(session, message):
    session["profile"]["documents_uploaded"] = True
    session["step"] = "KYC"
    return "Documents received. Starting live KYC verification."
