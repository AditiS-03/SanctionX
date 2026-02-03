"use client"

import { RotateCcw, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  onReset: () => void
}

export function ChatHeader({ onReset }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">SanctionX</h1>
          <p className="text-xs text-muted-foreground">Digital Loan Application</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onReset}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Reset application"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>
    </header>
  )
}
