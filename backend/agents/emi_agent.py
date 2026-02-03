def calculate_emi(message, profile):
    parts = message.split()

    amount = int(parts[0])
    months = int(parts[-1])

    rate = 0.01  # 12% annual approx
    emi = (amount * rate * (1 + rate) ** months) / ((1 + rate) ** months - 1)

    return round(emi)
