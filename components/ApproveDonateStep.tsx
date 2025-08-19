"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CheckCircle, DollarSign, Shield } from "lucide-react"
import { useTrail } from "../hooks/use-trail"
import { useTransaction } from "../hooks/use-transaction"
import { formatUSDC } from "../lib/trail-api"

interface ApproveDonateStepProps {
  approveStatus: "disabled" | "current" | "completed" | "pending"
  donateStatus: "disabled" | "current" | "completed" | "pending"
  onComplete: () => void
}

export function ApproveDonateStep({ approveStatus, donateStatus, onComplete }: ApproveDonateStepProps) {
  const { address } = useAccount()
  const trail = useTrail()
  const { executeTransaction, isLoading, error } = useTransaction()
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState<number | null>(null)

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

      setBalance(balanceValue)
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
      await fetchBalance()
      onComplete()
    } catch (error) {
      console.error("Donate failed:", error)
    }
  }

  const isApproveDisabled = approveStatus === "disabled" || isLoading
  const isDonateDisabled = donateStatus === "disabled" || approveStatus !== "completed" || isLoading
  const isAmountValid = amount && Number.parseFloat(amount) > 0 && Number.parseFloat(amount) <= (balance || 0)

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Make a Donation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">
            Donation Amount (USDC)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isApproveDisabled}
            className="text-lg"
          />
          <p className="text-xs text-gray-600">Available: {balance} USDC</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Approve Button */}
          <Button
            onClick={handleApprove}
            disabled={isApproveDisabled || !isAmountValid}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {approveStatus === "completed" ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved
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
            disabled={isDonateDisabled || !isAmountValid}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {donateStatus === "completed" ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Donated
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                {isLoading ? "Donating..." : "2. Donate"}
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {approveStatus === "completed" && donateStatus !== "completed" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Approval complete! Now click "Donate" to send your contribution.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!isAmountValid && amount && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">Please enter a valid amount between 0 and your available balance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
