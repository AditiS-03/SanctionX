import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, aadhaar, otp } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    const session = getSession(sessionId)

    // If OTP is provided, verify it
    if (otp) {
      // Mock OTP verification - in production, this would verify against actual OTP
      if (otp === "123456") {
        session.flags.kycVerified = true
        return NextResponse.json({
          valid: true,
          step: "otp_verified",
          message: "Aadhaar eKYC completed successfully."
        })
      } else {
        return NextResponse.json({
          valid: false,
          step: "otp_failed",
          reason: "Invalid OTP. Please try again."
        })
      }
    }

    // If Aadhaar number is provided, validate and send OTP
    if (aadhaar) {
      // Validate Aadhaar format: 12 digits
      const aadhaarRegex = /^\d{12}$/
      
      if (!aadhaarRegex.test(aadhaar)) {
        return NextResponse.json({
          valid: false,
          step: "aadhaar_invalid",
          reason: "Invalid Aadhaar number. Please enter a valid 12-digit Aadhaar number."
        })
      }

      // Store Aadhaar (in production, this would be encrypted)
      session.profile.aadhaar = aadhaar

      // Mock OTP sending - in production, this would call UIDAI API
      return NextResponse.json({
        valid: true,
        step: "otp_sent",
        message: "OTP has been sent to your Aadhaar-linked mobile number."
      })
    }

    return NextResponse.json(
      { error: "Missing aadhaar or otp parameter" },
      { status: 400 }
    )
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
