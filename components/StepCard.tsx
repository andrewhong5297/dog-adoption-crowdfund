"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"

interface StepCardProps {
  stepNumber: number
  title: string
  description: string
  status: "completed" | "current" | "pending" | "disabled"
  children?: React.ReactNode
  onExecute?: () => void
  isLoading?: boolean
  error?: string | null
}

export function StepCard({
  stepNumber,
  title,
  description,
  status,
  children,
  onExecute,
  isLoading = false,
  error,
}: StepCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "current":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "pending":
        return <Circle className="w-5 h-5 text-gray-400" />
      case "disabled":
        return <Circle className="w-5 h-5 text-gray-300" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50"
      case "current":
        return "border-blue-200 bg-blue-50"
      case "pending":
        return "border-gray-200 bg-gray-50"
      case "disabled":
        return "border-gray-100 bg-gray-25"
    }
  }

  return (
    <Card className={cn("transition-all duration-200", getStatusColor())}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-base">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Step {stepNumber}</span>
            </div>
            <div className="font-semibold">{title}</div>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600 ml-8">{description}</p>
      </CardHeader>

      {(status === "current" || status === "completed") && (
        <CardContent className="pt-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {children}

          {status === "current" && onExecute && (
            <Button onClick={onExecute} disabled={isLoading} className="w-full mt-4" size="lg">
              {isLoading ? "Processing..." : `Execute Step ${stepNumber}`}
            </Button>
          )}

          {status === "completed" && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Step completed successfully!</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
