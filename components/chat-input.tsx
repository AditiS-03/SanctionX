"use client"

import { useState, useRef, type FormEvent, type ChangeEvent } from "react"
import { Send, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  showUpload: boolean
  onFileUpload: (file: File) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, showUpload, onFileUpload, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleFileUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="border-t bg-card px-4 py-3">
      <div className="max-w-2xl mx-auto">
        {selectedFile && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground truncate flex-1">
              {selectedFile.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearFile}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleFileUpload}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Upload
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {showUpload && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <Plus className="w-5 h-5" />
                <span className="sr-only">Upload document</span>
              </Button>
            </>
          )}

          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={showUpload ? "Upload document or type a message..." : "Type your response..."}
            disabled={disabled}
            className={cn(
              "flex-1 bg-background border-input",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || disabled}
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>

        {disabled && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Application complete. Click the reset button to start a new application.
          </p>
        )}
      </div>
    </div>
  )
}
