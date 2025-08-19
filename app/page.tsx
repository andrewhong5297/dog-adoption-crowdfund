"use client"

import { useState, useEffect } from "react"
import { Web3Provider } from "../components/Web3Provider"
import { FarcasterConnect } from "../components/FarcasterConnect"
import { CrowdfundProgress } from "../components/CrowdfundProgress"
import { ApproveDonateStep } from "../components/ApproveDonateStep"
import { CommunityFeed } from "../components/CommunityFeed"
import { UserExecutionHistory } from "../components/UserExecutionHistory"
import { StepStats } from "../components/StepStats"
import { sdk } from "@farcaster/miniapp-sdk"
import { useAccount } from "wagmi"
import { useTrail } from "../hooks/use-trail"
import { Heart, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

// AppContent must be inside Web3Provider to use wagmi hooks
const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const { address, status } = useAccount()
  const { currentStep, refetch } = useTrail()
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)

  // Call sdk.actions.ready() when app is ready
  useEffect(() => {
    if (!isAppReady) {
      const markAppReady = async () => {
        try {
          await sdk.actions.ready()
          setIsAppReady(true)
          console.log("App marked as ready!")
        } catch (error) {
          console.error("Failed to mark app as ready:", error)
          setIsAppReady(true) // Still mark as ready to prevent infinite loading
        }
      }

      // Small delay to ensure UI is rendered
      const timer = setTimeout(() => {
        markAppReady()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isAppReady])

  const getStepStatus = (stepNumber: number) => {
    if (!address) return "disabled"
    if (stepNumber < currentStep) return "completed"
    if (stepNumber === currentStep) return "current"
    return "pending"
  }

  const handleStepComplete = () => {
    // Refresh trail data when a step is completed
    refetch()
  }

  const handleSelectExecution = (executionId: string) => {
    setSelectedExecutionId(executionId)
    // You could use this executionId in the trail API calls if needed
    console.log("Selected execution:", executionId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
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

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Crowdfund Progress */}
        <div className="mb-6">
          <CrowdfundProgress />
        </div>

        <div className="space-y-6">
          {/* Donation Step */}
          <ApproveDonateStep
            approveStatus={address ? getStepStatus(1) : "disabled"}
            donateStatus={address ? getStepStatus(2) : "disabled"}
            onComplete={handleStepComplete}
          />

          {/* Community Donation Feed */}
          <CommunityFeed />

          {/* Show additional tabs only when wallet is connected */}
          {status === "connected" && (
            <Tabs defaultValue="history" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="text-xs">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  My History
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs">
                  <Heart className="w-4 h-4 mr-1" />
                  Stats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4">
                <UserExecutionHistory onSelectExecution={handleSelectExecution} />
                {selectedExecutionId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">Using execution: {selectedExecutionId.slice(0, 8)}...</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <StepStats />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-center py-2">
        <p className="text-xs">Powered by Herd</p>
      </div>

      {/* Reference comment as requested */}
      {/* Trail details and debugging help: https://trails-api.herd.eco/v1/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/versions/0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7/guidebook.txt?promptObject=farcaster_miniapp&trailAppId=0198c2df-d48c-7f25-aae1-873d55126415 */}
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
