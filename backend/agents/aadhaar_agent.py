def handle_aadhaar(session, aadhaar: str):
    aadhaar = aadhaar.strip()

    if len(aadhaar) != 12 or not aadhaar.isdigit():
        return "❌ Invalid Aadhaar number. Please enter a valid 12-digit Aadhaar number."

    session["profile"]["aadhaar"] = aadhaar
    session["step"] = "OTP"
    return "OTP has been sent to your Aadhaar-linked mobile number. Please enter the OTP."


def handle_otp(session, otp: str):
    otp = otp.strip()

    # mock OTP
    if otp == "123456":
        session["flags"]["kyc_verified"] = True
        session["step"] = "ELIGIBLE"
        return "✅ Aadhaar eKYC completed successfully. Checking your loan eligibility."
    else:
        return "❌ Invalid OTP. Please try again."
