import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, pan } = await request.json()

    if (!sessionId || !pan) {
      return NextResponse.json(
        { error: "Missing sessionId or PAN number" },
        { status: 400 }
      )
    }

    // Validate PAN format: 5 letters, 4 digits, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
    const panUpper = pan.toUpperCase()

    if (!panRegex.test(panUpper)) {
      return NextResponse.json({
        valid: false,
        reason: "Invalid PAN format. Please enter a valid PAN number (e.g., ABCDE1234F)."
      })
    }

    // Mock verification - in production, this would call an actual verification API
    const session = getSession(sessionId)
    session.profile.pan = panUpper
    session.flags.panVerified = true

    return NextResponse.json({
      valid: true,
      pan: panUpper,
      message: "PAN verified successfully."
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
