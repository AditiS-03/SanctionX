import math

def handle_emi(session):
    P = session["profile"]["approved_amount"]
    N = 24
    R = 10 / (12 * 100)

    emi = (P * R * (1 + R)**N) / ((1 + R)**N - 1)
    session["profile"]["emi"] = round(emi, 2)
    return f"Your EMI will be ₹{round(emi,2)} for 24 months. Sanction letter generated."
