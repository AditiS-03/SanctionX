import re

def handle_sales(session, message):
    nums = re.findall(r"\d+", message)

    if not nums:
        return "Please enter your monthly income in numbers."

    session["profile"]["income"] = int(nums[0])
    session["step"] = "KYC"

    return "Thanks. To proceed, please confirm your age."
