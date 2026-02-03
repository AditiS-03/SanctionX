import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

interface FraudCheckResult {
  passed: boolean
  reasons: string[]
  riskScore: number
}

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
    const { profile, flags } = session

    const result = runFraudChecks(profile, flags)

    if (!result.passed) {
      session.flags.fraudDetected = true
      session.step = "REJECTED"
    }

    return NextResponse.json({
      passed: result.passed,
      reasons: result.reasons,
      riskScore: result.riskScore,
      message: result.passed 
        ? "Fraud checks passed successfully."
        : "Your application is flagged for data mismatch. Please visit the nearest branch for assistance."
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function runFraudChecks(
  profile: {
    declaredIncome?: number
    docIncome?: number
    employment?: string
    age?: number
  },
  flags: {
    panVerified?: boolean
    kycVerified?: boolean
  }
): FraudCheckResult {
  const reasons: string[] = []
  let riskScore = 0

  const declaredIncome = profile.declaredIncome || 0
  const docIncome = profile.docIncome || 0
  const employment = profile.employment || ""
  const age = profile.age || 0

  // Rule 1: Income mismatch > 25%
  if (docIncome && declaredIncome) {
    const diff = Math.abs(docIncome - declaredIncome)
    const mismatchPercent = diff / declaredIncome
    
    if (mismatchPercent > 0.25) {
      reasons.push("Income mismatch between declared income and document exceeds 25%.")
      riskScore += 40
    } else if (mismatchPercent > 0.15) {
      riskScore += 15 // Minor variance, add some risk but don't fail
    }
  }

  // Rule 2: Income too low
  if (declaredIncome < 10000) {
    reasons.push("Monthly income below minimum threshold of Rs. 10,000.")
    riskScore += 30
  }

  // Rule 3: Unemployed but has income declared
  if (!["salaried", "self-employed"].includes(employment) && declaredIncome > 0) {
    reasons.push("Employment status does not match declared income.")
    riskScore += 35
  }

  // Rule 4: Age out of acceptable range
  if (age < 18) {
    reasons.push("Applicant must be at least 18 years old.")
    riskScore += 50
  } else if (age > 70) {
    reasons.push("Applicant age exceeds maximum limit of 70 years.")
    riskScore += 30
  }

  // Rule 5: PAN not verified
  if (!flags.panVerified) {
    reasons.push("PAN verification failed or not completed.")
    riskScore += 25
  }

  // Rule 6: Aadhaar eKYC not completed
  if (!flags.kycVerified) {
    reasons.push("Aadhaar eKYC verification not completed.")
    riskScore += 25
  }

  // Rule 7: Unrealistically high income (potential fraud)
  if (declaredIncome > 1000000) {
    riskScore += 10 // Flag for manual review but don't auto-reject
  }

  const passed = reasons.length === 0 && riskScore < 50

  return {
    passed,
    reasons,
    riskScore: Math.min(riskScore, 100)
  }
}
