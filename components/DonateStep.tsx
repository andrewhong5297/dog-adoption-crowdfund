"use client"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { StepCard } from "./StepCard"
import { TransactionStatus } from "./TransactionStatus"
import { useTrail } from "../hooks/use-trail"
import { useTrailTransaction } from "../hooks/use-transaction"
import { formatUSDC, TRAIL_STEPS } from "../lib/trail-api"
import { DollarSign, Heart } from "lucide-react"

interface DonateStepProps {
  status: "completed" | "current" | "pending" | "disabled"
  onComplete?: () => void
}

export function DonateStep({ status, onComplete }: DonateStepProps) {
  const [amount, setAmount] = useState("")
  const [userDonation, setUserDonation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTxStatus, setShowTxStatus] = useState(false)

  const { submitStep, saveTransaction, readNode, loading } = useTrail()
  const { submitTransaction, isPending, isConfirmed, txError, currentTxHash, clearTransaction } = useTrailTransaction()

  // Fetch user's existing donation amount
  useEffect(() => {
    const fetchUserDonation = async () => {
      try {
        const donationResponse = await readNode("0198c2e0-a2e7-7c59-a3a2-76c43f6028e2")
        const donationValue = donationResponse.outputs.arg_0.value
        setUserDonation(formatUSDC(donationValue, 6))
      } catch (error) {
        console.error("Failed to fetch user donation:", error)
      }
    }

    if (status === "current") {
      fetchUserDonation()
    }
  }, [readNode, status])

  useEffect(() => {
    if (isConfirmed && currentTxHash) {
      const handleConfirmation = async () => {
        try {
          await saveTransaction(2, TRAIL_STEPS[2].primaryNodeId, currentTxHash)
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

    setError(null)
    setShowTxStatus(true)

    try {
      // Prepare user inputs for the donation step
      const userInputs = {
        [TRAIL_STEPS[2].primaryNodeId]: {
          "inputs.amount": {
            value: amount, // Amount in USDC (decimals already applied by API)
          },
        },
      }

      // Get evaluation data
      const evaluation = await submitStep(2, userInputs)

      // Submit transaction
      await submitTransaction(
        evaluation,
        (hash) => {
          console.log("Donation transaction submitted:", hash)
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
        stepNumber={2}
        title="Donate USDC"
        description="Make your donation to help dogs at Brooklyn Animal Care Centers"
        status={status}
        onExecute={handleExecute}
        isLoading={loading || isPending}
        error={error}
      >
        <div className="space-y-4">
          {/* Previous Donation Display */}
          {userDonation && Number.parseFloat(userDonation) > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Heart className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-green-700">Your Previous Donations</p>
                <p className="font-semibold text-green-800">${userDonation}</p>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="donate-amount">Donation Amount (USDC)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="donate-amount"
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
              Your donation will help provide care, shelter, and medical treatment for dogs in need.
            </p>
          </div>

          {/* Impact Message */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <Heart className="w-4 h-4 inline mr-1" />
              Every dollar makes a difference in saving dogs' lives at Brooklyn ACC.
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
