# backend/agents/loan_options_agent.py

def generate_loan_options(profile):
    income = profile["declared_income"]
    gender = profile["gender"]

    max_emi = income * 0.4
    base_rate = 12.0

    # female benefit
    if gender == "female":
        base_rate -= 0.5

    options = [
        {"amount": income * 10, "months": 24, "rate": base_rate},
        {"amount": income * 15, "months": 36, "rate": base_rate + 1},
        {"amount": income * 20, "months": 48, "rate": base_rate + 2}
    ]

    results = []
    for opt in options:
        emi = calculate_emi(opt["amount"], opt["rate"], opt["months"])
        if emi <= max_emi:
            opt["emi"] = round(emi)
            results.append(opt)

    return results


def calculate_emi(principal, rate, months):
    r = rate / (12 * 100)
    emi = (principal * r * (1 + r)**months) / ((1 + r)**months - 1)
    return emi
