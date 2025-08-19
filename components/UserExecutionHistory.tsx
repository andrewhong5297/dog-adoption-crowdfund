"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { History, ExternalLink, Play, CheckCircle } from "lucide-react"
import { useAccount } from "wagmi"
import { useTrail } from "../hooks/use-trail"
import { formatTimestamp } from "../lib/trail-api"

interface UserExecutionHistoryProps {
  onSelectExecution?: (executionId: string) => void
}

export function UserExecutionHistory({ onSelectExecution }: UserExecutionHistoryProps) {
  const { address } = useAccount()
  const { executions, loading, refetch } = useTrail()
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)

  const userExecution = executions?.walletExecutions.find(
    (exec) => exec.walletAddress.toLowerCase() === address?.toLowerCase(),
  )

  if (!address) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userExecution || userExecution.executions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            Your History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm text-center py-4">No execution history yet</p>
        </CardContent>
      </Card>
    )
  }

  const getHerdExplorerUrl = (hash: string) => `https://herd.eco/base/tx/${hash}`

  const getStepName = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return "Approve USDC"
      case 2:
        return "Donate USDC"
      case 3:
        return "Claim Refund"
      default:
        return `Step ${stepNumber}`
    }
  }

  const getStepStatus = (step: any) => {
    if (step.txHash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      return "skipped"
    }
    return step.txBlockTimestamp ? "completed" : "pending"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Your Executions
          </div>
          <Button onClick={refetch} variant="ghost" size="sm">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userExecution.executions.map((execution, index) => (
          <div
            key={execution.id}
            className={`border rounded-lg p-4 transition-all ${
              selectedExecutionId === execution.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Execution #{userExecution.executions.length - index}</h4>
                <p className="text-xs text-gray-500">
                  Started {formatTimestamp(new Date(execution.createdAt).getTime() / 1000)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onSelectExecution && (
                  <Button
                    onClick={() => {
                      setSelectedExecutionId(execution.id)
                      onSelectExecution(execution.id)
                    }}
                    variant={selectedExecutionId === execution.id ? "default" : "outline"}
                    size="sm"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {selectedExecutionId === execution.id ? "Selected" : "Use"}
                  </Button>
                )}
              </div>
            </div>

            {/* Steps in this execution */}
            <div className="space-y-2">
              {execution.steps
                .filter((step) => step.stepNumber > 0) // Filter out step 0
                .map((step) => {
                  const status = getStepStatus(step)
                  return (
                    <div
                      key={`${execution.id}-${step.stepNumber}`}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex items-center gap-2">
                        {status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : status === "skipped" ? (
                          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
                        )}
                        <span className="text-sm font-medium">{getStepName(step.stepNumber)}</span>
                        <Badge
                          variant={status === "completed" ? "default" : status === "skipped" ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {status}
                        </Badge>
                      </div>

                      {step.txHash &&
                        step.txHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                          <a
                            href={getHerdExplorerUrl(step.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
