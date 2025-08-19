"use client"

import { useState, useEffect } from "react"
import { StepCard } from "./StepCard"
import { TransactionStatus } from "./TransactionStatus"
import { useTrail } from "../hooks/use-trail"
import { useTrailTransaction } from "../hooks/use-transaction"
import { formatUSDC, TRAIL_STEPS } from "../lib/trail-api"
import { RefreshCw, AlertTriangle } from "lucide-react"

interface RefundStepProps {
  status: "completed" | "current" | "pending" | "disabled"
  onComplete?: () => void
}

export function RefundStep({ status, onComplete }: RefundStepProps) {
  const [userDonation, setUserDonation] = useState<string | null>(null)
  const [crowdfundEnded, setCrowdfundEnded] = useState(false)
  const [goalReached, setGoalReached] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTxStatus, setShowTxStatus] = useState(false)

  const { submitStep, saveTransaction, readNode, loading } = useTrail()
  const { submitTransaction, isPending, isConfirmed, txError, currentTxHash, clearTransaction } = useTrailTransaction()

  // Check if refund is available
  useEffect(() => {
    const checkRefundEligibility = async () => {
      try {
        // Get user's donation amount
        const donationResponse = await readNode("0198c2e0-a2e7-7c59-a3a2-76c43f6028e2")
        const donationValue = donationResponse.outputs.arg_0.value
        setUserDonation(formatUSDC(donationValue, 6))

        // Get crowdfund status
        const crowdfundResponse = await readNode("0198c2e0-a2e8-7a99-82e7-7515c48438b0")
        const crowdfundOutputs = crowdfundResponse.outputs.arg_0.value

        const goal = Number.parseFloat(formatUSDC(crowdfundOutputs[0].value, 6))
        const totalRaised = Number.parseFloat(formatUSDC(crowdfundOutputs[1].value, 6))
        const endTimestamp = Number.parseInt(crowdfundOutputs[2].value)
        const cancelled = crowdfundOutputs[6].value

        const isEnded = Date.now() / 1000 > endTimestamp || cancelled
        const isGoalReached = totalRaised >= goal

        setCrowdfundEnded(isEnded)
        setGoalReached(isGoalReached)
      } catch (error) {
        console.error("Failed to check refund eligibility:", error)
      }
    }

    if (status === "current") {
      checkRefundEligibility()
    }
  }, [readNode, status])

  useEffect(() => {
    if (isConfirmed && currentTxHash) {
      const handleConfirmation = async () => {
        try {
          await saveTransaction(3, TRAIL_STEPS[3].primaryNodeId, currentTxHash)
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
    if (!userDonation || Number.parseFloat(userDonation) <= 0) {
      setError("No donations to refund")
      return
    }

    if (!crowdfundEnded) {
      setError("Crowdfund is still active")
      return
    }

    if (goalReached) {
      setError("Crowdfund goal was reached, no refunds available")
      return
    }

    setError(null)
    setShowTxStatus(true)

    try {
      // No user inputs needed for refund step
      const userInputs = {}

      // Get evaluation data
      const evaluation = await submitStep(3, userInputs)

      // Submit transaction
      await submitTransaction(
        evaluation,
        (hash) => {
          console.log("Refund transaction submitted:", hash)
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

  const isRefundAvailable = userDonation && Number.parseFloat(userDonation) > 0 && crowdfundEnded && !goalReached

  return (
    <>
      <StepCard
        stepNumber={3}
        title="Claim Refund"
        description="Claim your refund if the crowdfund goal was not reached"
        status={status}
        onExecute={isRefundAvailable ? handleExecute : undefined}
        isLoading={loading || isPending}
        error={error}
      >
        <div className="space-y-4">
          {/* Refund Amount Display */}
          {userDonation && Number.parseFloat(userDonation) > 0 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <RefreshCw className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-orange-700">Available for Refund</p>
                <p className="font-semibold text-orange-800">${userDonation}</p>
              </div>
            </div>
          )}

          {/* Refund Status */}
          <div className="space-y-2">
            {!crowdfundEnded && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Crowdfund is still active. Refunds are only available after the campaign ends.
                </p>
              </div>
            )}

            {crowdfundEnded && goalReached && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  Congratulations! The crowdfund goal was reached. No refunds are needed.
                </p>
              </div>
            )}

            {crowdfundEnded && !goalReached && userDonation && Number.parseFloat(userDonation) > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  The crowdfund goal was not reached. You can claim a refund of your donation.
                </p>
              </div>
            )}

            {(!userDonation || Number.parseFloat(userDonation) <= 0) && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">You have no donations to refund.</p>
              </div>
            )}
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
