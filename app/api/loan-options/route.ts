import { NextRequest, NextResponse } from "next/server"
import { getSession, type LoanOption } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    const session = getSession(sessionId)
    const { profile } = session

    const income = profile.declaredIncome
    const gender = profile.gender

    if (!income) {
      return NextResponse.json(
        { error: "Income not declared" },
        { status: 400 }
      )
    }

    const options = generateLoanOptions(income, gender)
    session.loanOptions = options
    session.step = "CHOOSE_OPTION"

    const maxLoan = income * 20

    return NextResponse.json({
      options,
      maxEligibleAmount: maxLoan,
      message: `You are eligible for a loan up to Rs. ${maxLoan.toLocaleString("en-IN")}.`
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateLoanOptions(income: number, gender?: string): LoanOption[] {
  const maxEmi = income * 0.5 // EMI should not exceed 50% of income (DTI rule)
  let baseRate = 11

  // Female borrowers get 0.5% discount
  if (gender === "female") {
    baseRate -= 0.5
  }

  const options: LoanOption[] = [
    { amount: 200000, months: 24, rate: baseRate, emi: 0 },
    { amount: 300000, months: 36, rate: baseRate + 1, emi: 0 },
    { amount: 500000, months: 48, rate: baseRate + 2, emi: 0 }
  ]

  return options
    .map(opt => ({
      ...opt,
      emi: calculateEMI(opt.amount, opt.rate, opt.months)
    }))
    .filter(opt => opt.emi <= maxEmi)
}

function calculateEMI(principal: number, annualRate: number, months: number): number {
  // EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
  // where P = principal, r = monthly interest rate, n = number of months
  
  const monthlyRate = annualRate / (12 * 100)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1)
  
  return Math.round(emi)
}
