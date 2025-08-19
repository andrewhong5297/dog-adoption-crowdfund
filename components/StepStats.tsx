"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { BarChart3, Users, Activity } from "lucide-react"
import { TrailAPI, type ExecutionQueryResponse } from "../lib/trail-api"

export function StepStats() {
  const [executions, setExecutions] = useState<ExecutionQueryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await TrailAPI.queryExecutions({ walletAddresses: [] })
        setExecutions(response)
      } catch (error) {
        console.error("Failed to fetch step stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!executions) return null

  const stepStats = executions.totals.stepStats || {}
  const steps = [
    { number: 1, name: "Approve USDC", color: "bg-blue-500" },
    { number: 2, name: "Donate USDC", color: "bg-green-500" },
    { number: 3, name: "Claim Refund", color: "bg-orange-500" },
  ]

  const maxTransactions = Math.max(
    ...Object.values(stepStats).map((stat) => Number.parseInt(stat.transactions) || 0),
    1,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Step Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => {
          const stats = stepStats[step.number.toString()]
          const transactions = Number.parseInt(stats?.transactions || "0")
          const wallets = Number.parseInt(stats?.wallets || "0")
          const percentage = maxTransactions > 0 ? (transactions / maxTransactions) * 100 : 0

          return (
            <div key={step.number} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${step.color}`}></div>
                  <span className="font-medium text-sm">{step.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {wallets}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {transactions}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${step.color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{executions.totals.wallets}</div>
              <div className="text-xs text-gray-600">Total Participants</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{executions.totals.transactions}</div>
              <div className="text-xs text-gray-600">Total Actions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
