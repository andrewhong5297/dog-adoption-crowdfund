"use client"

import { useState, useEffect } from "react"
import { Web3Provider } from "../components/Web3Provider"
import { FarcasterConnect } from "../components/FarcasterConnect"
import { CrowdfundProgress } from "../components/CrowdfundProgress"
import { ApproveDonateStep } from "../components/ApproveDonateStep"
import { CommunityFeed } from "../components/CommunityFeed"
import { sdk } from "@farcaster/miniapp-sdk"
import { useAccount } from "wagmi"
import { useTrail } from "../hooks/use-trail"
import { Heart } from "lucide-react"

const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const { address, status } = useAccount()
  const { currentStep, hasCompletedApproval, hasCompletedDonation, refetch } = useTrail()
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAppReady) {
      const markAppReady = async () => {
        try {
          await sdk.actions.ready()
          setIsAppReady(true)
          console.log("App marked as ready!")
        } catch (error) {
          console.error("Failed to mark app as ready:", error)
          setIsAppReady(true)
        }
      }

      const timer = setTimeout(() => {
        markAppReady()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isAppReady])

  const handleStepComplete = () => {
    refetch()
  }

  const handleSelectExecution = (executionId: string) => {
    setSelectedExecutionId(executionId)
    console.log("Selected execution:", executionId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="text-lg font-bold text-gray-900">Brooklyn ACC Dogs</h1>
            </div>
            <FarcasterConnect />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <CrowdfundProgress />
        </div>

        <div className="space-y-6">
          <ApproveDonateStep onComplete={handleStepComplete} />

          <CommunityFeed />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-center py-2">
        <p className="text-xs">Powered by Herd</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  )
}
