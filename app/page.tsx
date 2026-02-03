"use client"

import { useState, useRef, useEffect } from "react"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { LoanOptionsCard } from "@/components/loan-options-card"
import type { Message, LoanOption, ChatState } from "@/lib/types"

export default function SanctionXPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showLoanOptions, setShowLoanOptions] = useState(false)
  const [loanOptions, setLoanOptions] = useState<LoanOption[]>([])
  const [showDownload, setShowDownload] = useState(false)
  const [chatState, setChatState] = useState<ChatState>({
    step: "START",
    sessionId: `session-${Date.now()}`,
    profile: {},
    flags: {}
  })

  // Initialize with greeting
  useEffect(() => {
    const greeting: Message = {
      id: "1",
      type: "system",
      content: "Welcome to SanctionX. What type of loan do you want and for what purpose?",
      timestamp: new Date()
    }
    setMessages([greeting])
    setChatState(prev => ({ ...prev, step: "LOAN_PURPOSE" }))
  }, [])

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Process message based on current step
    await processStep(content)
    setIsLoading(false)
  }

  const processStep = async (input: string) => {
    const { step, profile, flags } = chatState
    let response = ""
    let nextStep = step
    let updatedProfile = { ...profile }
    let updatedFlags = { ...flags }

    switch (step) {
      case "LOAN_PURPOSE":
        updatedProfile.loanPurpose = input
        response = "Please enter your full name."
        nextStep = "NAME"
        break

      case "NAME":
        updatedProfile.name = input
        response = "Please enter your age."
        nextStep = "AGE"
        break

      case "AGE":
        const age = parseInt(input)
        if (isNaN(age)) {
          response = "Please enter a valid age as a number (example: 25)."
          break
        }
        if (age < 18) {
          response = "You must be 18 years or older to apply for a loan."
          nextStep = "REJECTED"
          break
        }
        if (age > 70) {
          response = "We are unable to process loan applications for applicants above 70 years of age."
          nextStep = "REJECTED"
          break
        }
        updatedProfile.age = age
        response = "Please select your gender (Male / Female / Other)."
        nextStep = "GENDER"
        break

      case "GENDER":
        const gender = input.toLowerCase()
        if (!["male", "female", "other"].includes(gender)) {
          response = "Please enter Male, Female, or Other."
          break
        }
        updatedProfile.gender = gender
        response = "Are you salaried, self-employed, or unemployed?"
        nextStep = "EMPLOYMENT"
        break

      case "EMPLOYMENT":
        const emp = input.toLowerCase()
        if (emp === "unemployed") {
          response = "Currently, loans are available only for salaried or self-employed applicants."
          nextStep = "REJECTED"
          break
        }
        if (!["salaried", "self-employed"].includes(emp)) {
          response = "Please enter salaried, self-employed, or unemployed."
          break
        }
        updatedProfile.employment = emp
        response = "Please enter your monthly income (numbers only)."
        nextStep = "INCOME"
        break

      case "INCOME":
        const income = parseInt(input.replace(/,/g, ""))
        if (isNaN(income)) {
          response = "Please enter income as a number (example: 40000)."
          break
        }
        if (income < 10000) {
          response = "Minimum income requirement is Rs. 10,000 per month."
          nextStep = "REJECTED"
          break
        }
        updatedProfile.declaredIncome = income
        response = "What type of bank account do you have? (Savings / Current / Salary)"
        nextStep = "ACCOUNT_TYPE"
        break

      case "ACCOUNT_TYPE":
        const accType = input.toLowerCase()
        if (!["savings", "current", "salary"].includes(accType)) {
          response = "Please enter Savings, Current, or Salary."
          break
        }
        updatedProfile.accountType = accType
        response = "Please enter your PAN number."
        nextStep = "PAN"
        break

      case "PAN":
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
        const panUpper = input.toUpperCase()
        if (!panRegex.test(panUpper)) {
          response = "Invalid PAN format. Please enter a valid PAN number (e.g., ABCDE1234F)."
          break
        }
        updatedProfile.pan = panUpper
        updatedFlags.panVerified = true
        response = "PAN verified successfully. Please enter your 12-digit Aadhaar number."
        nextStep = "AADHAAR"
        break

      case "AADHAAR":
        const aadhaarRegex = /^\d{12}$/
        if (!aadhaarRegex.test(input)) {
          response = "Invalid Aadhaar number. Please enter a valid 12-digit Aadhaar number."
          break
        }
        updatedProfile.aadhaar = input
        response = "OTP has been sent to your Aadhaar-linked mobile number. Please enter the OTP."
        nextStep = "OTP"
        break

      case "OTP":
        if (input !== "123456") {
          response = "Invalid OTP. Please try again. (Hint: Use 123456 for demo)"
          break
        }
        updatedFlags.kycVerified = true
        response = "Aadhaar eKYC completed successfully. Please upload your income proof document (salary slip, bank statement, or ITR)."
        nextStep = "DOCUMENT"
        setShowUpload(true)
        break

      case "CHOOSE_OPTION":
        const choice = parseInt(input.replace(/[^0-9]/g, ""))
        if (isNaN(choice) || choice < 1 || choice > loanOptions.length) {
          response = `Please select a valid option (1, 2, or ${loanOptions.length}).`
          break
        }
        const selectedOption = loanOptions[choice - 1]
        updatedProfile.selectedLoan = selectedOption
        response = `Your EMI will be Rs. ${selectedOption.emi.toLocaleString("en-IN")} per month for ${selectedOption.months} months. Do you accept this offer? (Yes / No)`
        nextStep = "CONFIRM_EMI"
        setShowLoanOptions(false)
        break

      case "CONFIRM_EMI":
        const confirm = input.toLowerCase()
        if (confirm === "no") {
          response = "Thank you for considering SanctionX. You can restart the application anytime."
          nextStep = "END"
          break
        }
        if (confirm !== "yes") {
          response = "Please enter Yes or No."
          break
        }
        response = `Congratulations! Your loan of Rs. ${updatedProfile.selectedLoan!.amount.toLocaleString("en-IN")} has been approved at ${updatedProfile.selectedLoan!.rate}% interest rate. Your sanction letter is ready. Please download it below.\n\nPlease visit your nearest bank branch for disbursement of the loan amount.`
        nextStep = "SANCTION"
        setShowDownload(true)
        break

      case "REJECTED":
      case "END":
      case "SANCTION":
        response = "Thank you for using SanctionX. Click the reset button to start a new application."
        break
    }

    // Add system response
    if (response) {
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, systemMessage])
    }

    setChatState(prev => ({
      ...prev,
      step: nextStep,
      profile: updatedProfile,
      flags: updatedFlags
    }))
  }

  const handleFileUpload = async (file: File) => {
    const uploadMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `Uploaded: ${file.name}`,
      timestamp: new Date(),
      isFile: true,
      fileName: file.name
    }
    setMessages(prev => [...prev, uploadMessage])
    setShowUpload(false)
    setIsLoading(true)

    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock OCR - extract income (in real app, this would call backend)
    const docIncome = chatState.profile.declaredIncome! * (0.9 + Math.random() * 0.2)
    const roundedDocIncome = Math.round(docIncome)
    
    const { profile, flags } = chatState
    const updatedProfile = { ...profile, docIncome: roundedDocIncome }
    const updatedFlags = { ...flags }

    // Fraud detection
    const declaredIncome = profile.declaredIncome!
    const incomeMatch = Math.abs(roundedDocIncome - declaredIncome) / declaredIncome

    if (incomeMatch > 0.25) {
      const fraudMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "Your application is flagged for data mismatch. The income in your document does not match your declared income. Please visit the nearest branch for assistance.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fraudMessage])
      setChatState(prev => ({ ...prev, step: "REJECTED", profile: updatedProfile }))
      setIsLoading(false)
      return
    }

    // Calculate eligibility
    const maxLoan = declaredIncome * 20
    const options = generateLoanOptions(declaredIncome, profile.gender)

    if (options.length === 0) {
      const ineligibleMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "Based on your income, we are unable to offer a loan at this time. Please try again when your income increases.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, ineligibleMessage])
      setChatState(prev => ({ ...prev, step: "REJECTED", profile: updatedProfile }))
      setIsLoading(false)
      return
    }

    const eligibleMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "system",
      content: `Income document verified. You are eligible for a loan up to Rs. ${maxLoan.toLocaleString("en-IN")}. Please select one of the following loan options:`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, eligibleMessage])
    setLoanOptions(options)
    setShowLoanOptions(true)
    setChatState(prev => ({ 
      ...prev, 
      step: "CHOOSE_OPTION", 
      profile: updatedProfile,
      flags: updatedFlags
    }))
    setIsLoading(false)
  }

  const generateLoanOptions = (income: number, gender?: string): LoanOption[] => {
    const maxEmi = income * 0.5
    let baseRate = 11

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

  const calculateEMI = (principal: number, rate: number, months: number): number => {
    const r = rate / (12 * 100)
    const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    return Math.round(emi)
  }

  const handleLoanSelect = (option: LoanOption, index: number) => {
    handleSendMessage(`Option ${index + 1}`)
  }

  const handleReset = () => {
    setMessages([])
    setIsLoading(false)
    setShowUpload(false)
    setShowLoanOptions(false)
    setLoanOptions([])
    setShowDownload(false)
    setChatState({
      step: "START",
      sessionId: `session-${Date.now()}`,
      profile: {},
      flags: {}
    })
    // Restart with greeting
    setTimeout(() => {
      const greeting: Message = {
        id: "1",
        type: "system",
        content: "Welcome to SanctionX. What type of loan do you want and for what purpose?",
        timestamp: new Date()
      }
      setMessages([greeting])
      setChatState(prev => ({ ...prev, step: "LOAN_PURPOSE" }))
    }, 100)
  }

  const handleDownloadSanction = () => {
    const { profile } = chatState
    generateSanctionPDF(profile)
  }

  const generateSanctionPDF = (profile: typeof chatState.profile) => {
    const loan = profile.selectedLoan!
    const today = new Date().toLocaleDateString("en-IN")
    
    const content = `
SANCTION LETTER
================

Date: ${today}

Dear ${profile.name},

We are pleased to inform you that your loan application has been approved.

LOAN DETAILS
------------
Loan Amount: Rs. ${loan.amount.toLocaleString("en-IN")}
Interest Rate: ${loan.rate}% per annum
Tenure: ${loan.months} months
EMI: Rs. ${loan.emi.toLocaleString("en-IN")} per month

Purpose: ${profile.loanPurpose}

IMPORTANT NOTICE
----------------
Please visit your nearest bank branch for disbursement of the loan amount.
This sanction is subject to verification of original documents.

Regards,
SanctionX Loan Processing System
    `.trim()

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sanction_letter_${profile.name?.replace(/\s+/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-dvh bg-background">
      <ChatHeader onReset={handleReset} />
      <ChatMessages 
        messages={messages} 
        isLoading={isLoading}
        showLoanOptions={showLoanOptions}
        loanOptions={loanOptions}
        onSelectLoan={handleLoanSelect}
        showDownload={showDownload}
        onDownload={handleDownloadSanction}
      />
      <ChatInput 
        onSendMessage={handleSendMessage}
        showUpload={showUpload}
        onFileUpload={handleFileUpload}
        disabled={isLoading || chatState.step === "REJECTED" || chatState.step === "END" || chatState.step === "SANCTION"}
      />
    </div>
  )
}
