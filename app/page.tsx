"use client"

import { useState, useEffect } from "react"
import { Web3Provider } from "../components/Web3Provider"
import { FarcasterConnect } from "../components/FarcasterConnect"
import { CrowdfundProgress } from "../components/CrowdfundProgress"
import { ApproveDonateStep } from "../components/ApproveDonateStep"
import { CommunityFeed } from "../components/CommunityFeed"
import { sdk } from "@farcaster/frame-sdk"
import { useAccount } from "wagmi"
import { useTrail } from "../hooks/use-trail"
import { PawPrintIcon } from "lucide-react"

const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const { address, status } = useAccount()
  const { currentStep, hasCompletedApproval, hasCompletedDonation, refetch } = useTrail()
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!isAppReady) {
      const markAppReady = async () => {
        try {
          await sdk.actions.ready()
          setIsAppReady(true)
          console.log("[v0] App marked as ready for Farcaster client!")
        } catch (error) {
          console.error("[v0] Failed to mark app as ready:", error)
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
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSelectExecution = (executionId: string) => {
    setSelectedExecutionId(executionId)
    console.log("[v0] Selected execution:", executionId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrintIcon className="w-6 h-6 text-amber-600" />
              <h1 className="text-lg font-bold text-amber-900">Save Brooklyn ACC Dogs</h1>
            </div>
            <FarcasterConnect />
          </div>
        </div>
      </div>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <CrowdfundProgress onRefresh={refreshTrigger} />
        </div>

        <div className="space-y-6">
          <ApproveDonateStep onComplete={handleStepComplete} />

          <CommunityFeed onRefresh={refreshTrigger} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-amber-900 text-amber-50 text-center py-2">
        <a href="https://herd.eco/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/overlook" target="_blank" className="flex items-center justify-center gap-1">
          <p className="text-xs">Powered by Herd</p>
        </a>
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
