"use client"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { StepCard } from "./StepCard"
import { TransactionStatus } from "./TransactionStatus"
import { useTrail } from "../hooks/use-trail"
import { useTrailTransaction } from "../hooks/use-transaction"
import { formatUSDC, TRAIL_STEPS } from "../lib/trail-api"
import { DollarSign, Wallet } from "lucide-react"

interface ApproveStepProps {
  status: "completed" | "current" | "pending" | "disabled"
  onComplete?: () => void
}

export function ApproveStep({ status, onComplete }: ApproveStepProps) {
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTxStatus, setShowTxStatus] = useState(false)

  const { submitStep, saveTransaction, readNode, loading } = useTrail()
  const { submitTransaction, isPending, isConfirmed, txError, currentTxHash, clearTransaction } = useTrailTransaction()

  // Fetch user's USDC balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceResponse = await readNode("0198c2e0-a2e8-7a99-82e7-75138a5f58ad")
        const balanceValue = balanceResponse.outputs.arg_0.value
        setBalance(formatUSDC(balanceValue, 6))
      } catch (error) {
        console.error("Failed to fetch balance:", error)
      }
    }

    if (status === "current") {
      fetchBalance()
    }
  }, [readNode, status])

  useEffect(() => {
    if (isConfirmed && currentTxHash) {
      const handleConfirmation = async () => {
        try {
          await saveTransaction(1, TRAIL_STEPS[1].primaryNodeId, currentTxHash)
          onComplete?.()
        } catch (error) {
          console.error("Failed to save transaction:", error)
          setError("Transaction confirmed but failed to save. Please try again.")
        }
      }
      handleConfirmation()
    }
  }, [isConfirmed, currentTxHash, saveTransaction, onComplete])

  const handleExecute = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid donation amount")
      return
    }

    const amountNum = Number.parseFloat(amount)
    const balanceNum = balance ? Number.parseFloat(balance) : 0

    if (amountNum > balanceNum) {
      setError("Insufficient USDC balance")
      return
    }

    setError(null)
    setShowTxStatus(true)

    try {
      // Prepare user inputs for the approval step
      const userInputs = {
        [TRAIL_STEPS[1].primaryNodeId]: {
          "inputs.value": {
            value: amount, // Amount in USDC (decimals already applied by API)
          },
        },
      }

      // Get evaluation data
      const evaluation = await submitStep(1, userInputs)

      // Submit transaction
      await submitTransaction(
        evaluation,
        (hash) => {
          console.log("Approval transaction submitted:", hash)
        },
        (error) => {
          setError(error.message)
          setShowTxStatus(false)
        },
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : "Transaction failed")
      setShowTxStatus(false)
    }
  }

  const handleCloseTxStatus = () => {
    setShowTxStatus(false)
    clearTransaction()
  }

  return (
    <>
      <StepCard
        stepNumber={1}
        title="Approve USDC"
        description="Approve USDC spending for your donation to the Brooklyn ACC dog crowdfund"
        status={status}
        onExecute={handleExecute}
        isLoading={loading || isPending}
        error={error}
      >
        <div className="space-y-4">
          {/* Balance Display */}
          {balance && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
              <Wallet className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Your USDC Balance</p>
                <p className="font-semibold">${balance}</p>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="approve-amount">Donation Amount (USDC)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="approve-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-gray-600">
              This will approve the crowdfund contract to spend your USDC for the donation.
            </p>
          </div>
        </div>
      </StepCard>

      {showTxStatus && (
        <TransactionStatus
          txHash={currentTxHash}
          isConfirming={isPending}
          isConfirmed={isConfirmed}
          error={txError}
          onClose={handleCloseTxStatus}
        />
      )}
    </>
  )
}
