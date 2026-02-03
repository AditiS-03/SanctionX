import { NextRequest, NextResponse } from "next/server"
import { resetSession, resetAllSessions } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { sessionId } = body

    if (sessionId) {
      // Reset specific session
      resetSession(sessionId)
      return NextResponse.json({
        status: "reset",
        message: `Session ${sessionId} has been reset.`
      })
    } else {
      // Reset all sessions
      resetAllSessions()
      return NextResponse.json({
        status: "reset",
        message: "All sessions have been reset."
      })
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
