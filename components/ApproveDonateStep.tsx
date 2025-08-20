"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CheckCircle, Shield, Heart, DollarSign } from "lucide-react"
import { useUserStepFromLatestExecution } from "../hooks/use-user-step"
import { useTransaction } from "../hooks/use-transaction"
import { useToast } from "../hooks/use-toast"

export function ApproveDonateStep({ onComplete }: { onComplete: () => void }) {
  const { address } = useAccount()
  const { currentStep, refetch: refetchStep } = useUserStepFromLatestExecution()
  const { executeTransaction, isLoading, error } = useTransaction()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState<number | null>(null)

  const hasCompletedApproval = currentStep > 1
  const hasCompletedDonation = currentStep > 2

  const fetchBalance = useCallback(async () => {
    console.log("[v0] fetchBalance called, address:", address)
    if (!address) {
      console.log("[v0] No address, setting balance to null")
      setBalance(null)
      return
    }

    try {
      console.log("[v0] Fetching balance for address:", address)
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
              type: "latest",
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Balance API response:", data)
      const balanceValue = Number.parseInt(data.outputs.arg_0.value) / 1000000 // Convert from wei to USDC (6 decimals)
      console.log("[v0] Parsed balance value:", balanceValue)

      setBalance(balanceValue.toFixed(2))
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      setBalance(0)
    }
  }, [address])

  useEffect(() => {
    console.log("[v0] useEffect triggered, address:", address)
    if (address) {
      console.log("[v0] Address exists, fetching balance")
      fetchBalance()
    } else {
      console.log("[v0] No address, resetting balance")
      setBalance(null)
    }
  }, [address, fetchBalance])

  useEffect(() => {
    console.log("[v0] Rendering balance:", balance)
  }, [balance])

  const handleApprove = async () => {
    if (!amount || !address) return

    try {
      await executeTransaction({
        stepNumber: 1,
        userInputs: { amount: Number.parseFloat(amount) },
        walletAddress: address,
      })
      await fetchBalance()
      await refetchStep()
      onComplete()
    } catch (error) {
      console.error("Approve failed:", error)
    }
  }

  const handleDonate = async () => {
    if (!amount || !address) return

    try {
      await executeTransaction({
        stepNumber: 2,
        userInputs: { amount: Number.parseFloat(amount) },
        walletAddress: address,
      })
      toast({
        title: "Thanks for helping out the dogs of brooklyn!",
        description: `Your donation of ${amount} USDC will help save lives at Brooklyn ACC.`,
        duration: 5000,
      })
      await fetchBalance()
      await refetchStep()
      onComplete()
    } catch (error) {
      console.error("Donate failed:", error)
    }
  }

  const isReady = !isLoading && amount

  const enoughBalance = Number.parseFloat(amount) > 0 && Number.parseFloat(amount) <= (balance || 0)

  const isDonateDisabled = !isReady || !enoughBalance || (!hasCompletedApproval && !isLoading)

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
          <DollarSign className="w-5 h-5 text-orange-600" />
          Make a Donation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium text-orange-800">
            Donation Amount (USDC)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
            className="text-lg border-orange-200 focus:border-orange-400"
          />
          <p className="text-xs text-orange-700">Available: {balance || 0} USDC</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Approve Button */}
          <Button
            onClick={handleApprove}
            disabled={!isReady || !enoughBalance}
            className={`flex-1 text-white transition-all duration-200 ${
              hasCompletedApproval
                ? "bg-amber-400 hover:bg-amber-600 opacity-60 hover:opacity-100"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {hasCompletedApproval ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Re-approve
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {isLoading ? "Approving..." : "1. Approve"}
              </>
            )}
          </Button>

          {/* Donate Button */}
          <Button
            onClick={handleDonate}
            disabled={isDonateDisabled}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            {hasCompletedDonation ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Donated ❤️
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                {isLoading ? "Donating..." : "2. Donate"}
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!enoughBalance && isReady && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">Please enter a valid amount between 0 and your available balance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
