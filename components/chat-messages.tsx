"use client"

import { useEffect, useRef } from "react"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoanOptionsCard } from "@/components/loan-options-card"
import type { Message, LoanOption } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  showLoanOptions: boolean
  loanOptions: LoanOption[]
  onSelectLoan: (option: LoanOption, index: number) => void
  showDownload: boolean
  onDownload: () => void
}

export function ChatMessages({
  messages,
  isLoading,
  showLoanOptions,
  loanOptions,
  onSelectLoan,
  showDownload,
  onDownload
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading, showLoanOptions])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 chat-scroll">
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {showLoanOptions && loanOptions.length > 0 && (
          <div className="space-y-3">
            {loanOptions.map((option, index) => (
              <LoanOptionsCard
                key={index}
                option={option}
                index={index}
                onSelect={() => onSelectLoan(option, index)}
              />
            ))}
          </div>
        )}

        {showDownload && (
          <div className="flex justify-start">
            <Button
              onClick={onDownload}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sanction Letter
            </Button>
          </div>
        )}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.type === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] px-4 py-3 rounded-2xl",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border text-card-foreground rounded-bl-md"
        )}
      >
        {message.isFile ? (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{message.fileName}</span>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}
        <p
          className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
        </div>
      </div>
    </div>
  )
}
