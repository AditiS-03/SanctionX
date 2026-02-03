import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

// Simulated OCR income extraction patterns
const INCOME_PATTERNS = [
  /net\s*pay[:\s]*(?:rs\.?\s*)?(\d[\d,]*)/i,
  /gross\s*salary[:\s]*(?:rs\.?\s*)?(\d[\d,]*)/i,
  /salary[:\s]*(?:rs\.?\s*)?(\d[\d,]*)/i,
  /income[:\s]*(?:rs\.?\s*)?(\d[\d,]*)/i,
  /total\s*earnings[:\s]*(?:rs\.?\s*)?(\d[\d,]*)/i,
  /net\s*income[:\s]*(?:rs\.?\s*)?(\d[\d,]*)/i,
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const sessionId = formData.get("sessionId") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    const session = getSession(sessionId)
    const declaredIncome = session.profile.declaredIncome

    if (!declaredIncome) {
      return NextResponse.json(
        { error: "Income not declared yet" },
        { status: 400 }
      )
    }

    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real implementation, this would:
    // 1. Save the file temporarily
    // 2. Run OCR using Tesseract or similar
    // 3. Extract income from the text
    // 4. Delete the temporary file

    // For demo purposes, we simulate OCR with slight variance
    // Real OCR would extract actual income from the document
    const extractedIncome = simulateOCRExtraction(declaredIncome)

    if (extractedIncome === null) {
      return NextResponse.json({
        valid: false,
        reason: "Unable to detect income from document. Please upload a clear salary slip, bank statement, or ITR."
      })
    }

    session.profile.docIncome = extractedIncome
    session.step = "FRAUD_CHECK"

    return NextResponse.json({
      valid: true,
      income: extractedIncome,
      message: "Income document processed successfully."
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Simulate OCR extraction with realistic variance
function simulateOCRExtraction(declaredIncome: number): number | null {
  // 90% chance of successful extraction
  if (Math.random() > 0.1) {
    // Simulate slight variance (5-10%) that might occur in real documents
    const variance = 0.95 + Math.random() * 0.1 // 0.95 to 1.05
    return Math.round(declaredIncome * variance)
  }
  
  // 10% chance of OCR failure
  return null
}

// This function would be used with actual OCR text
function extractIncomeFromText(text: string): number | null {
  const cleanedText = text.toLowerCase().replace(/₹/g, "").replace(/,/g, "")

  for (const pattern of INCOME_PATTERNS) {
    const match = cleanedText.match(pattern)
    if (match && match[1]) {
      const income = parseInt(match[1].replace(/,/g, ""))
      if (!isNaN(income) && income >= 5000 && income <= 5000000) {
        return income
      }
    }
  }

  return null
}
