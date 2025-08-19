"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Target, Clock, Users } from "lucide-react"
import { formatUSDC } from "../lib/trail-api"

// API documentation: https://trails-api.herd.eco/v1/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/versions/0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7/guidebook.txt?trailAppId=0198a42e-6183-745a-abca-cb89fd695d50

interface CrowdfundData {
  goal: string
  totalRaised: string
  endTimestamp: number
  creator: string
  fundsClaimed: boolean
  cancelled: boolean
}

export function CrowdfundProgress() {
  const [crowdfundData, setCrowdfundData] = useState<CrowdfundData | null>(null)
  const [donorCount, setDonorCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    const fetchCrowdfundData = async () => {
      try {
        setLoading(true)

        // Read crowdfund details using null address (works without wallet connection)
        const crowdfundResponse = await fetch(
          `https://trails-api.herd.eco/v1/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/versions/0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7/nodes/0198c2e0-a2e8-7a99-82e7-7515c48438b0/read`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Herd-Trail-App-Id": "0198c2df-d48c-7f25-aae1-873d55126415", // Required trail app id
            },
            body: JSON.stringify({
              walletAddress: "0x0000000000000000000000000000000000000000", // null address
              userInputs: {},
              execution: {
                type: "new",
              },
            }),
          },
        )

        // Read donor count using null address
        const donorResponse = await fetch(
          `https://trails-api.herd.eco/v1/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/versions/0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7/nodes/0198c2e0-a2e9-7497-8e7e-9e8feb56f554/read`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Herd-Trail-App-Id": "0198c2df-d48c-7f25-aae1-873d55126415", // Required trail app id
            },
            body: JSON.stringify({
              walletAddress: "0x0000000000000000000000000000000000000000", // null address
              userInputs: {},
              execution: {
                type: "new",
              },
            }),
          },
        )

        if (!crowdfundResponse.ok || !donorResponse.ok) {
          throw new Error(`HTTP error! status: ${crowdfundResponse.status} / ${donorResponse.status}`)
        }

        const crowdfundData = await crowdfundResponse.json()
        const donorData = await donorResponse.json()

        const processedCrowdfundData: CrowdfundData = {
          goal: crowdfundData.outputs.goal.value,
          totalRaised: crowdfundData.outputs.totalRaised.value,
          endTimestamp: Number.parseInt(crowdfundData.outputs.endTimestamp.value),
          creator: crowdfundData.outputs.creator.value,
          fundsClaimed: crowdfundData.outputs.fundsClaimed.value,
          cancelled: crowdfundData.outputs.cancelled.value,
        }

        setCrowdfundData(processedCrowdfundData)
        setDonorCount(Number.parseInt(donorData.outputs.arg_0.value))
      } catch (error) {
        console.error("Failed to fetch crowdfund data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrowdfundData()
  }, [])

  useEffect(() => {
    if (!crowdfundData) return

    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000)
      const timeRemaining = crowdfundData.endTimestamp - now

      if (timeRemaining <= 0) {
        setTimeLeft("Ended")
        return
      }

      const days = Math.floor(timeRemaining / (24 * 60 * 60))
      const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [crowdfundData])

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
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Users className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Donors</p>
              <p className="font-semibold">{donorCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Clock className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Time Left</p>
              <p className="font-semibold text-xs">{timeLeft}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          {isSuccessful ? (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Goal Reached!</div>
          ) : isActive ? (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Active Campaign</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
