"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Users, Target, Clock } from "lucide-react"
import { useTrail } from "../hooks/use-trail"
import { formatUSDC, formatTimestamp } from "../lib/trail-api"

interface CrowdfundData {
  goal: string
  totalRaised: string
  endTimestamp: number
  creator: string
  fundsClaimed: boolean
  cancelled: boolean
}

interface CrowdfundStats {
  donorsCount: string
  userDonation: string
}

export function CrowdfundProgress() {
  const { readNode } = useTrail()
  const [crowdfundData, setCrowdfundData] = useState<CrowdfundData | null>(null)
  const [stats, setStats] = useState<CrowdfundStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCrowdfundData = async () => {
      try {
        setLoading(true)

        // Read crowdfund details
        const crowdfundResponse = await readNode("0198c2e0-a2e8-7a99-82e7-7515c48438b0")
        const crowdfundOutputs = crowdfundResponse.outputs.arg_0.value

        const crowdfundData: CrowdfundData = {
          goal: crowdfundOutputs[0].value, // goal (uint128 with 6 decimals)
          totalRaised: crowdfundOutputs[1].value, // totalRaised (uint128 with 6 decimals)
          endTimestamp: Number.parseInt(crowdfundOutputs[2].value), // endTimestamp (uint64)
          creator: crowdfundOutputs[4].value, // creator (address)
          fundsClaimed: crowdfundOutputs[5].value, // fundsClaimed (bool)
          cancelled: crowdfundOutputs[6].value, // cancelled (bool)
        }

        setCrowdfundData(crowdfundData)

        // Read donors count
        const donorsResponse = await readNode("0198c2e0-a2e9-7497-8e7e-9e8feb56f554")
        const donorsCount = donorsResponse.outputs.arg_0.value

        setStats({
          donorsCount,
          userDonation: "0", // Will be updated when user connects wallet
        })
      } catch (error) {
        console.error("Failed to fetch crowdfund data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrowdfundData()
  }, [readNode])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!crowdfundData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">Failed to load crowdfund data</p>
        </CardContent>
      </Card>
    )
  }

  const goalAmount = Number.parseFloat(formatUSDC(crowdfundData.goal, 6))
  const raisedAmount = Number.parseFloat(formatUSDC(crowdfundData.totalRaised, 6))
  const progressPercentage = goalAmount > 0 ? (raisedAmount / goalAmount) * 100 : 0
  const isActive = Date.now() / 1000 < crowdfundData.endTimestamp && !crowdfundData.cancelled
  const isSuccessful = raisedAmount >= goalAmount && !crowdfundData.cancelled

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Brooklyn ACC Dog Crowdfund
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="font-medium">${raisedAmount.toLocaleString()}</span>
            <span className="text-gray-600">of ${goalAmount.toLocaleString()} goal</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Users className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Donors</p>
              <p className="font-semibold">{stats?.donorsCount || "0"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Clock className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Ends</p>
              <p className="font-semibold text-xs">{formatTimestamp(crowdfundData.endTimestamp)}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          {isSuccessful ? (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Goal Reached!</div>
          ) : isActive ? (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Active Campaign</div>
          ) : (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Campaign Ended</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
