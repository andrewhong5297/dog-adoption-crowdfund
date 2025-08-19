"use client"

import { useCallback, useState } from "react"
import { useAccount, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from "wagmi"
import { base } from "wagmi/chains"
import type { EvaluationResponse } from "../lib/trail-api"
import { TrailAPI } from "../lib/trail-api"

export function useTrailTransaction() {
  const { address, status, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null)

  const {
    sendTransaction,
    isPending: isSending,
    error: txError,
    reset: resetTransaction,
  } = useSendTransaction({
    mutation: {
      onSuccess: async (hash: string) => {
        console.log("Transaction successfully sent:", hash)
        setCurrentTxHash(hash)
      },
      onError: (error: Error) => {
        console.error("Transaction failed:", error)
        setCurrentTxHash(null)
      },
    },
  })

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}`,
    enabled: !!currentTxHash,
  })

  // Switch to Base chain when connected
  const ensureCorrectChain = useCallback(async () => {
    if (status === "connected" && chain?.id !== base.id) {
      try {
        await switchChain({ chainId: base.id })
      } catch (error) {
        console.error("Failed to switch chain:", error)
        throw new Error("Please switch to Base network to continue")
      }
    }
  }, [switchChain, status, chain?.id])

  const submitTransaction = useCallback(
    async (evaluation: EvaluationResponse, onSuccess?: (hash: string) => void, onError?: (error: Error) => void) => {
      if (!address) {
        const error = new Error("Wallet not connected")
        onError?.(error)
        throw error
      }

      try {
        // Reset previous transaction state
        resetTransaction()
        setCurrentTxHash(null)

        // Ensure we're on the correct chain
        await ensureCorrectChain()

        const transactionRequest = {
          from: address as `0x${string}`,
          to: evaluation.contractAddress as `0x${string}`,
          data: evaluation.callData as `0x${string}`,
          value: BigInt(evaluation.payableAmount ?? "0"),
        }

        console.log("Submitting transaction:", transactionRequest)

        return new Promise<string>((resolve, reject) => {
          sendTransaction(transactionRequest, {
            onSuccess: (hash: string) => {
              console.log("Transaction hash received:", hash)
              onSuccess?.(hash)
              resolve(hash)
            },
            onError: (error: Error) => {
              console.error("Transaction submission failed:", error)
              const enhancedError = new Error(
                error.message.includes("User rejected")
                  ? "Transaction was cancelled by user"
                  : `Transaction failed: ${error.message}`,
              )
              onError?.(enhancedError)
              reject(enhancedError)
            },
          })
        })
      } catch (error) {
        const enhancedError = error instanceof Error ? error : new Error("Unknown transaction error")
        onError?.(enhancedError)
        throw enhancedError
      }
    },
    [address, ensureCorrectChain, sendTransaction, resetTransaction],
  )

  const clearTransaction = useCallback(() => {
    resetTransaction()
    setCurrentTxHash(null)
  }, [resetTransaction])

  return {
    submitTransaction,
    isPending: isSending || isConfirming,
    isSending,
    isConfirming,
    isConfirmed,
    txError: txError || confirmError,
    currentTxHash,
    ensureCorrectChain,
    clearTransaction,
  }
}

export function useTransaction() {
  const trailTransaction = useTrailTransaction()

  const executeTransaction = useCallback(
    async ({
      stepNumber,
      userInputs,
      walletAddress,
    }: {
      stepNumber: number
      userInputs: { amount: number }
      walletAddress: string
    }) => {
      try {
        console.log(`[v0] Executing step ${stepNumber} with inputs:`, userInputs)

        const evaluation = await TrailAPI.getEvaluation(stepNumber, {
          walletAddress,
          userInputs: {
            [stepNumber === 1 ? "0198c2e0-a2e8-7a99-82e7-7514211a187f" : "0198c2e0-a2e7-7c59-a3a2-76c5dfa3cc33"]: {
              [stepNumber === 1 ? "inputs.value" : "inputs.amount"]: {
                value: userInputs.amount.toString(),
              },
            },
          },
          execution: { type: "new" },
        })

        console.log(`[v0] Evaluation response:`, evaluation)

        // Submit the transaction using the evaluation response
        const txHash = await trailTransaction.submitTransaction(evaluation)

        console.log(`[v0] Transaction submitted with hash:`, txHash)

        await TrailAPI.saveExecution({
          nodeId: stepNumber === 1 ? "0198c2e0-a2e8-7a99-82e7-7514211a187f" : "0198c2e0-a2e7-7c59-a3a2-76c5dfa3cc33",
          transactionHash: txHash,
          walletAddress,
          execution: { type: "new" },
        })

        return txHash
      } catch (error) {
        console.error(`[v0] Transaction execution failed:`, error)
        throw error
      }
    },
    [trailTransaction],
  )

  return {
    executeTransaction,
    isLoading: trailTransaction.isPending,
    error: trailTransaction.txError?.message || null,
    ...trailTransaction,
  }
}
