"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { TrailAPI, type ExecutionQueryResponse, type UserInputs } from "../lib/trail-api"

export interface TrailState {
  currentStep: number
  executions: ExecutionQueryResponse | null
  balance: number | null
  loading: boolean
  error: string | null
}

export function useTrail() {
  const { address } = useAccount()
  const [state, setState] = useState<TrailState>({
    currentStep: 1,
    executions: null,
    balance: null,
    loading: false,
    error: null,
  })

  // Fetch execution history
  const fetchExecutions = useCallback(async () => {
    if (!address) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const executions = await TrailAPI.queryExecutions({
        walletAddresses: [address.toLowerCase()],
      })

      setState((prev) => ({ ...prev, executions, loading: false }))

      // Determine current step based on execution history
      const userExecution = executions.walletExecutions.find(
        (exec) => exec.walletAddress.toLowerCase() === address.toLowerCase(),
      )

      if (userExecution && userExecution.executions.length > 0) {
        const latestExecution = userExecution.executions[userExecution.executions.length - 1]
        const completedSteps = latestExecution.steps.filter(
          (step) =>
            step.stepNumber > 0 && step.txHash !== "0x0000000000000000000000000000000000000000000000000000000000000000",
        )
        const nextStep = Math.min(completedSteps.length + 1, 3)
        setState((prev) => ({ ...prev, currentStep: nextStep }))
      }
    } catch (error) {
      console.error("Failed to fetch executions:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch executions",
      }))
    }
  }, [address])

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!address) {
      setState((prev) => ({ ...prev, balance: null }))
      return
    }

    try {
      const response = await fetch(
        `https://trails-api.herd.eco/v1/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/versions/0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7/nodes/0198c2e0-a2e8-7a99-82e7-75138a5f58ad/read`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Herd-Trail-App-Id": "0198c2df-d48c-7f25-aae1-873d55126415",
          },
          body: JSON.stringify({
            walletAddress: address,
            userInputs: {},
            execution: {
              type: "new",
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const balanceValue = Number.parseInt(data.outputs.arg_0.value) / 1000000 // Convert from wei to USDC (6 decimals)

      setState((prev) => ({ ...prev, balance: balanceValue }))
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      setState((prev) => ({ ...prev, balance: 0 }))
    }
  }, [address])

  // Fetch executions when address changes
  useEffect(() => {
    if (address) {
      fetchExecutions()
      fetchBalance()
    } else {
      setState({
        currentStep: 1,
        executions: null,
        balance: null,
        loading: false,
        error: null,
      })
    }
  }, [address, fetchExecutions, fetchBalance])

  // Submit a step transaction
  const submitStep = useCallback(
    async (stepNumber: number, userInputs: UserInputs, onTransactionHash?: (hash: string) => void) => {
      if (!address) throw new Error("Wallet not connected")

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        // Get evaluation data
        const evaluation = await TrailAPI.getEvaluation(stepNumber, {
          walletAddress: address,
          userInputs,
          execution: { type: "latest" },
        })

        // Return evaluation data for transaction submission
        setState((prev) => ({ ...prev, loading: false }))
        return evaluation
      } catch (error) {
        console.error("Failed to submit step:", error)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to submit step",
        }))
        throw error
      }
    },
    [address],
  )

  // Save transaction hash after successful submission
  const saveTransaction = useCallback(
    async (stepNumber: number, nodeId: string, transactionHash: string) => {
      if (!address) throw new Error("Wallet not connected")

      try {
        await TrailAPI.saveExecution({
          nodeId,
          transactionHash,
          walletAddress: address,
          execution: { type: "latest" },
        })

        // Refresh executions after saving
        await fetchExecutions()
      } catch (error) {
        console.error("Failed to save transaction:", error)
        throw error
      }
    },
    [address, fetchExecutions],
  )

  // Read data from a node
  const readNode = useCallback(
    async (nodeId: string, executionId?: string) => {
      if (!address) throw new Error("Wallet not connected")

      try {
        const execution = executionId ? { type: "manual" as const, executionId } : { type: "latest" as const }

        return await TrailAPI.readNode(nodeId, {
          walletAddress: address,
          execution,
        })
      } catch (error) {
        console.error("Failed to read node:", error)
        throw error
      }
    },
    [address],
  )

  return {
    ...state,
    submitStep,
    saveTransaction,
    readNode,
    refetch: fetchExecutions,
    refetchBalance: fetchBalance,
  }
}
