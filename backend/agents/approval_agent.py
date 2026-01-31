def handle_approval(session):
    amount = session["loan"]["amount"]
    session["step"] = "END"

    return f"🎉 Your loan of ₹{amount} has been approved. Sanction letter generated."
