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

    if (!profile.selectedLoan) {
      return NextResponse.json(
        { error: "No loan option selected" },
        { status: 400 }
      )
    }

    const sanctionLetter = generateSanctionLetter(
      profile.name || "Applicant",
      profile.selectedLoan,
      profile.loanType || "Personal Loan"
    )

    session.step = "SANCTION"

    return NextResponse.json({
      success: true,
      sanctionLetter,
      message: "Sanction letter generated successfully."
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    const session = getSession(sessionId)
    const { profile } = session

    if (!profile.selectedLoan) {
      return NextResponse.json(
        { error: "No loan option selected" },
        { status: 400 }
      )
    }

    const sanctionLetter = generateSanctionLetter(
      profile.name || "Applicant",
      profile.selectedLoan,
      profile.loanType || "Personal Loan"
    )

    // Return as downloadable text file
    return new NextResponse(sanctionLetter, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="sanction_letter_${profile.name?.replace(/\s+/g, "_") || "applicant"}.txt"`
      }
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateSanctionLetter(
  name: string,
  loan: LoanOption,
  purpose: string
): string {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount)
  }

  return `
================================================================================
                              SANCTION LETTER
================================================================================

Reference No: SX/${Date.now()}
Date: ${today}

Dear ${name},

Subject: Sanction of Personal Loan Application

We are pleased to inform you that your loan application has been approved by
SanctionX Digital Loan Processing System.

================================================================================
                              LOAN DETAILS
================================================================================

Loan Amount          : ${formatCurrency(loan.amount)}
Interest Rate        : ${loan.rate}% per annum (reducing balance)
Tenure               : ${loan.months} months
EMI Amount           : ${formatCurrency(loan.emi)} per month
Purpose              : ${purpose}

================================================================================
                           TERMS AND CONDITIONS
================================================================================

1. This sanction is valid for 30 days from the date of this letter.

2. The loan is subject to verification of original documents at the branch.

3. Processing fee and other applicable charges will be deducted at the time
   of disbursement.

4. EMI will be debited from your registered bank account on the 5th of every
   month.

5. Pre-closure of the loan is allowed after 6 months with applicable charges.

6. In case of default, penal interest at 2% per month will be applicable.

================================================================================
                             IMPORTANT NOTICE
================================================================================

Please visit your nearest bank branch for disbursement of the loan amount.

You will need to bring the following documents:
- Original ID proof (Aadhaar/PAN/Passport)
- Address proof
- Income documents
- 2 passport size photographs
- Cancelled cheque from your salary account

================================================================================

This is a system-generated letter and does not require a signature.

Thank you for choosing SanctionX.

Regards,
SanctionX Loan Processing System
www.sanctionx.in

================================================================================
                         CONFIDENTIAL & PROPRIETARY
================================================================================
`.trim()
}
