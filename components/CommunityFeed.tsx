"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Heart, DollarSign, ExternalLink, RefreshCw } from "lucide-react"
import { TrailAPI, formatTimestamp } from "../lib/trail-api"

interface DonationData {
  walletAddress: string
  amount: string
  txHash: string
  blockTimestamp: number
  farcasterData?: {
    username: string
    display_name: string
    pfp_url: string
  }
}

export function CommunityFeed({ onRefresh }: { onRefresh?: () => void }) {
  const [donations, setDonations] = useState<DonationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDonationData = async () => {
    try {
      setLoading(true)
      setError(null)

      const executionsResponse = await TrailAPI.queryExecutions({ walletAddresses: [] })

      // Get donation transactions from totals.stepStats[2]
      const donationTransactions = executionsResponse.totals?.stepStats?.[2]?.transactionHashes || []

      console.log("[v0] Found donate transactions from stepStats[2]:", donationTransactions.length)

      // Map the transactions to our donation format - amounts are already in evaluation.finalInputValues
      const donations: DonationData[] = donationTransactions
        .map((tx: any) => ({
          walletAddress: tx.walletAddress,
          amount: tx.evaluation?.finalInputValues?.amount || "0",
          txHash: tx.txHash,
          blockTimestamp: tx.blockTimestamp,
          farcasterData: tx.farcasterData,
        }))
        .filter((donation: DonationData) => donation.amount !== "0")
        .sort((a, b) => b.blockTimestamp - a.blockTimestamp)

      console.log("[v0] Valid donations with amounts:", donations.length)
      setDonations(donations)
    } catch (error) {
      console.error("Failed to fetch donation data:", error)
      setError(error instanceof Error ? error.message : "Failed to load donation data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonationData()

    const refreshInterval = setInterval(fetchDonationData, 60000) // 60 seconds

    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    if (onRefresh) {
      fetchDonationData()
    }
  }, [onRefresh])

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
            <Button onClick={fetchDonationData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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
            <Heart className="w-5 h-5 text-red-500" />
            Recent Donations
          </div>
          <Button onClick={fetchDonationData} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {donations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No donations yet</p>
          ) : (
            donations.map((donation, index) => (
              <div
                key={`${donation.txHash}-${index}`}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100"
              >
                <Avatar className="w-10 h-10">
                  {donation.farcasterData?.pfp_url ? (
                    <AvatarImage
                      src={donation.farcasterData.pfp_url || "/placeholder.svg"}
                      alt={donation.farcasterData.username}
                    />
                  ) : null}
                  <AvatarFallback className={`text-white text-xs ${getAvatarFallback(donation.walletAddress)}`}>
                    {donation.farcasterData?.username?.[0]?.toUpperCase() ||
                      `${donation.walletAddress.slice(2, 4).toUpperCase()}`}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {donation.farcasterData ? (
                      <a
                        href={getFarcasterProfileUrl(donation.farcasterData.username)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-blue-600 text-sm truncate"
                      >
                        {donation.farcasterData.display_name || donation.farcasterData.username}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900 text-sm">
                        {donation.walletAddress.slice(0, 6)}...{donation.walletAddress.slice(-4)}
                      </span>
                    )}
                    <Badge variant="secondary" className="bg-green-100 text-green-800 font-semibold">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {donation.amount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatTimestamp(donation.blockTimestamp)}</span>
                    <a
                      href={getHerdExplorerUrl(donation.txHash)}
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
