"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { TrailAPI } from "../lib/trail-api"

export function useUserStepFromLatestExecution() {
  const { address } = useAccount()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [latestExecutionId, setLatestExecutionId] = useState<string | null>(null)

  const fetchUserStep = useCallback(async () => {
    if (!address) {
      setCurrentStep(1)
      setLatestExecutionId(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Fetching executions for address:", address)
      const executions = await TrailAPI.queryExecutions({
        walletAddresses: [address.toLowerCase()],
      })

      const userExecution = executions.walletExecutions.find(
        (exec) => exec.walletAddress.toLowerCase() === address.toLowerCase(),
      )

      if (userExecution && userExecution.executions.length > 0) {
        const latestExecution = userExecution.executions[userExecution.executions.length - 1]

        // Filter out step 0 (trail start markers) and get completed steps
        const completedSteps = latestExecution.steps.filter(
          (step) =>
            step.stepNumber > 0 && step.txHash !== "0x0000000000000000000000000000000000000000000000000000000000000000",
        )

        // Get the max step number from completed steps
        const maxCompletedStep =
          completedSteps.length > 0 ? Math.max(...completedSteps.map((step) => step.stepNumber)) : 0

        // Current step is max completed step + 1
        const userCurrentStep = maxCompletedStep + 1

        console.log("[v0] Max completed step:", maxCompletedStep, "Current step:", userCurrentStep)

        setCurrentStep(userCurrentStep)
        setLatestExecutionId(latestExecution.id)
      } else {
        // No executions yet, user is on step 1
        console.log("[v0] No executions found, user on step 1")
        setCurrentStep(1)
        setLatestExecutionId(null)
      }
    } catch (error) {
      console.error("Failed to fetch user step:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch user step")
      setCurrentStep(1) // Default to step 1 on error
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchUserStep()
  }, [fetchUserStep])

  return {
    currentStep,
    loading,
    error,
    latestExecutionId,
    refetch: fetchUserStep,
  }
}
