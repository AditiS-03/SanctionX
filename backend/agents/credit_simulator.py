import random

def simulate_credit_score(session):
    income = session["profile"].get("income", 0)

    if income >= 50000:
        score = random.randint(750, 820)
    elif income >= 30000:
        score = random.randint(700, 749)
    else:
        score = random.randint(600, 699)

    session["profile"]["credit_score"] = score
    return score
