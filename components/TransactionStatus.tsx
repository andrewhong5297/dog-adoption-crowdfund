"use client"

import { useEffect } from "react"
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "./ui/button"

interface TransactionStatusProps {
  txHash: string | null
  isConfirming: boolean
  isConfirmed: boolean
  error: Error | null
  onClose: () => void
}

export function TransactionStatus({ txHash, isConfirming, isConfirmed, error, onClose }: TransactionStatusProps) {
  // Auto-close after successful confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConfirmed, txHash, onClose])

  if (!txHash && !error) return null

  const getHerdExplorerUrl = (hash: string) => `https://herd.eco/base/tx/${hash}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        {error ? (
          // Error State
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction Failed</h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : isConfirmed ? (
          // Success State
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction Confirmed!</h3>
            <p className="text-sm text-gray-600 mb-4">Your transaction has been successfully processed.</p>
            <div className="space-y-2">
              {txHash && (
                <Button
                  variant="outline"
                  onClick={() => window.open(getHerdExplorerUrl(txHash), "_blank")}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              )}
              <Button onClick={onClose} className="w-full">
                Continue
              </Button>
            </div>
          </div>
        ) : (
          // Pending State
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isConfirming ? "Confirming Transaction" : "Processing Transaction"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isConfirming
                ? "Waiting for blockchain confirmation..."
                : "Please confirm the transaction in your wallet."}
            </p>
            {txHash && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(getHerdExplorerUrl(txHash), "_blank")}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
                <p className="text-xs text-gray-500">
                  Transaction Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
