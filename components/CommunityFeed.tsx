"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Users, TrendingUp, ExternalLink, RefreshCw } from "lucide-react"
import { TrailAPI, formatTimestamp, type ExecutionQueryResponse } from "../lib/trail-api"

export function CommunityFeed() {
  const [executions, setExecutions] = useState<ExecutionQueryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunityData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all executions (no wallet filter to see community activity)
      const response = await TrailAPI.queryExecutions({ walletAddresses: [] })
      setExecutions(response)
    } catch (error) {
      console.error("Failed to fetch community data:", error)
      setError(error instanceof Error ? error.message : "Failed to load community data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunityData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchCommunityData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!executions) return null

  // Get recent activity from all steps (excluding step 0)
  const recentActivity = Object.entries(executions.totals.stepStats || {})
    .filter(([stepNum]) => stepNum !== "0") // Filter out step 0
    .flatMap(([stepNum, stats]) =>
      stats.transactionHashes.map((tx) => ({
        ...tx,
        stepNumber: Number.parseInt(stepNum),
        stepName: stepNum === "1" ? "Approved USDC" : stepNum === "2" ? "Donated" : "Claimed Refund",
      })),
    )
    .sort((a, b) => b.blockTimestamp - a.blockTimestamp)
    .slice(0, 10) // Show last 10 activities

  const getAvatarFallback = (address: string) => {
    // Generate consistent color based on address
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
    const colorIndex = Number.parseInt(address.slice(-2), 16) % colors.length
    return colors[colorIndex]
  }

  const getHerdExplorerUrl = (hash: string) => `https://herd.eco/base/tx/${hash}`
  const getFarcasterProfileUrl = (username: string) => `https://farcaster.xyz/${username}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Community Activity
          </div>
          <Button onClick={fetchCommunityData} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{executions.totals.wallets}</div>
            <div className="text-xs text-blue-700">Total Participants</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{executions.totals.transactions}</div>
            <div className="text-xs text-green-700">Total Transactions</div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Activity
          </h4>

          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={`${activity.txHash}-${index}`} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    {activity.farcasterData?.pfp_url ? (
                      <AvatarImage
                        src={activity.farcasterData.pfp_url || "/placeholder.svg"}
                        alt={activity.farcasterData.username}
                      />
                    ) : null}
                    <AvatarFallback className={`text-white text-xs ${getAvatarFallback(activity.walletAddress)}`}>
                      {activity.farcasterData?.username?.[0]?.toUpperCase() ||
                        `${activity.walletAddress.slice(2, 4).toUpperCase()}`}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {activity.farcasterData ? (
                        <a
                          href={getFarcasterProfileUrl(activity.farcasterData.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 text-sm truncate"
                        >
                          {activity.farcasterData.display_name || activity.farcasterData.username}
                        </a>
                      ) : (
                        <span className="font-medium text-gray-900 text-sm">
                          {activity.walletAddress.slice(0, 6)}...{activity.walletAddress.slice(-4)}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {activity.stepName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatTimestamp(activity.blockTimestamp)}</span>
                      <a
                        href={getHerdExplorerUrl(activity.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
