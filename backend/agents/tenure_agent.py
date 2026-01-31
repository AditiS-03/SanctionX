def handle_tenure(session, message):
    try:
        tenure = int(message)
    except:
        return "Please choose a valid tenure: 12, 24, or 36 months."

    if tenure not in [12, 24, 36]:
        return "Tenure must be 12, 24, or 36 months."

    session["loan"]["tenure"] = tenure
    session["step"] = "AFFORD"

    return f"Great. Calculating eligibility for {tenure}-month tenure."
