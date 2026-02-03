import { NextRequest, NextResponse } from "next/server"
import { sessions, getSession, type Session } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json()

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "Missing sessionId or message" },
        { status: 400 }
      )
    }

    const session = getSession(sessionId)
    const reply = handleMessage(session, message)

    return NextResponse.json({ reply, step: session.step })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function handleMessage(session: Session, message: string): string {
  const { step, profile, flags } = session

  switch (step) {
    case "START":
      session.step = "NAME"
      return "Welcome to SanctionX. Please enter your full name."

    case "NAME":
      profile.name = message
      session.step = "AGE"
      return "Please enter your age."

    case "AGE": {
      const age = parseInt(message)
      if (isNaN(age)) {
        return "Please enter a valid age as a number (example: 25)."
      }
      if (age < 18) {
        session.step = "REJECTED"
        return "You must be 18 years or older to apply for a loan."
      }
      if (age > 70) {
        session.step = "REJECTED"
        return "We are unable to process loan applications for applicants above 70 years of age."
      }
      profile.age = age
      session.step = "GENDER"
      return "Please select your gender (Male / Female / Other)."
    }

    case "GENDER": {
      const gender = message.toLowerCase()
      if (!["male", "female", "other"].includes(gender)) {
        return "Please enter Male, Female, or Other."
      }
      profile.gender = gender
      session.step = "LOAN"
      return "What type of loan do you want and for what purpose?"
    }

    case "LOAN":
      profile.loanType = message
      session.step = "EMPLOYMENT"
      return "Are you salaried, self-employed, or unemployed?"

    case "EMPLOYMENT": {
      const emp = message.toLowerCase()
      if (emp === "unemployed") {
        session.step = "REJECTED"
        return "Currently, loans are available only for salaried or self-employed applicants."
      }
      if (!["salaried", "self-employed"].includes(emp)) {
        return "Please enter salaried, self-employed, or unemployed."
      }
      profile.employment = emp
      session.step = "INCOME"
      return "Please enter your monthly income (numbers only)."
    }

    case "INCOME": {
      const income = parseInt(message.replace(/,/g, ""))
      if (isNaN(income)) {
        return "Please enter income as a number (example: 40000)."
      }
      if (income < 10000) {
        session.step = "REJECTED"
        return "Minimum income requirement is Rs. 10,000 per month."
      }
      profile.declaredIncome = income
      session.step = "ACCOUNT_TYPE"
      return "What type of bank account do you have? (Savings / Current / Salary)"
    }

    case "ACCOUNT_TYPE": {
      const accType = message.toLowerCase()
      if (!["savings", "current", "salary"].includes(accType)) {
        return "Please enter Savings, Current, or Salary."
      }
      profile.accountType = accType
      session.step = "PAN"
      return "Please enter your PAN number."
    }

    case "PAN": {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
      const panUpper = message.toUpperCase()
      if (!panRegex.test(panUpper)) {
        return "Invalid PAN format. Please enter a valid PAN number (e.g., ABCDE1234F)."
      }
      profile.pan = panUpper
      flags.panVerified = true
      session.step = "AADHAAR"
      return "PAN verified successfully. Please enter your 12-digit Aadhaar number."
    }

    case "AADHAAR": {
      const aadhaarRegex = /^\d{12}$/
      if (!aadhaarRegex.test(message)) {
        return "Invalid Aadhaar number. Please enter a valid 12-digit Aadhaar number."
      }
      profile.aadhaar = message
      session.step = "OTP"
      return "OTP has been sent to your Aadhaar-linked mobile number. Please enter the OTP."
    }

    case "OTP":
      if (message !== "123456") {
        return "Invalid OTP. Please try again. (Hint: Use 123456 for demo)"
      }
      flags.kycVerified = true
      session.step = "DOCUMENT"
      return "Aadhaar eKYC completed successfully. Please upload your income proof document."

    case "CHOOSE_OPTION": {
      const choice = parseInt(message.replace(/[^0-9]/g, ""))
      const options = session.loanOptions || []
      if (isNaN(choice) || choice < 1 || choice > options.length) {
        return `Please select a valid option (1, 2, or ${options.length}).`
      }
      const selectedOption = options[choice - 1]
      profile.selectedLoan = selectedOption
      session.step = "CONFIRM_EMI"
      return `Your EMI will be Rs. ${selectedOption.emi.toLocaleString("en-IN")} per month for ${selectedOption.months} months. Do you accept this offer? (Yes / No)`
    }

    case "CONFIRM_EMI": {
      const confirm = message.toLowerCase()
      if (confirm === "no") {
        session.step = "END"
        return "Thank you for considering SanctionX. You can restart the application anytime."
      }
      if (confirm !== "yes") {
        return "Please enter Yes or No."
      }
      session.step = "SANCTION"
      return `Congratulations! Your loan has been approved. Your sanction letter is ready. Please download it below.\n\nPlease visit your nearest bank branch for disbursement of the loan amount.`
    }

    case "REJECTED":
    case "END":
    case "SANCTION":
      return "Thank you for using SanctionX. Click the reset button to start a new application."

    default:
      return "Thank you for using SanctionX."
  }
}
