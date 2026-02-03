"use client"

import { IndianRupee, Calendar, Percent, Calculator } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LoanOption } from "@/lib/types"

interface LoanOptionsCardProps {
  option: LoanOption
  index: number
  onSelect: () => void
}

export function LoanOptionsCard({ option, index, onSelect }: LoanOptionsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className="flex items-center justify-center w-16 bg-primary/10 text-primary font-bold text-lg">
            {index + 1}
          </div>
          <div className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold text-foreground">{formatCurrency(option.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tenure</p>
                  <p className="font-semibold text-foreground">{option.months} months</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Interest Rate</p>
                  <p className="font-semibold text-foreground">{option.rate}% p.a.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">EMI</p>
                  <p className="font-semibold text-primary">{formatCurrency(option.emi)}/mo</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={onSelect}
              variant="outline"
              size="sm"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Select Option {index + 1}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
