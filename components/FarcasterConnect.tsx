"use client"

import { useEffect, useState } from "react"
import { Wallet, AlertCircle, CheckCircle } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { config } from "./Web3Provider"
import { sdk } from "@farcaster/miniapp-sdk"
import type { Context } from "@farcaster/miniapp-sdk"
import { Button } from "./ui/button"

export function FarcasterConnect() {
  const { address, status, chain } = useAccount()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [context, setContext] = useState<Context | null>(null)
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false)

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const context = await sdk.context
        console.log(context, "context")
        setContext(context)
      } catch (error) {
        console.error("Failed to fetch Farcaster context:", error)
      }
    }
    fetchContext()
  }, [])

  useEffect(() => {
    if (!autoConnectAttempted && status === "disconnected") {
      setAutoConnectAttempted(true)
      try {
        connect({ connector: config.connectors[0] })
      } catch (error) {
        console.error("Auto-connect failed:", error)
      }
    }
  }, [connect, status, autoConnectAttempted])

  useEffect(() => {
    if (status === "connected" && chain?.id !== base.id) {
      switchChain({ chainId: base.id })
    }
  }, [switchChain, status, chain?.id])

  const handleConnect = () => {
    try {
      connect({ connector: config.connectors[0] })
    } catch (error) {
      console.error("Manual connect failed:", error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (status === "connecting" || isConnecting) {
    return (
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-blue-800">Connecting...</span>
      </div>
    )
  }

  if (status === "connected" && address) {
    const isCorrectChain = chain?.id === base.id

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-green-800">
              {context?.user.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
            </div>
            <div className="text-xs text-green-600">
              {isCorrectChain ? "Base Network" : chain?.name || "Unknown Network"}
            </div>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-green-700 hover:text-green-800 hover:bg-green-100"
          >
            Disconnect
          </Button>
        </div>

        {!isCorrectChain && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <div className="flex-1">
              <p className="text-xs text-orange-800">
                {isSwitching ? "Switching to Base..." : "Please switch to Base network"}
              </p>
            </div>
            {!isSwitching && (
              <Button
                onClick={() => switchChain({ chainId: base.id })}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1"
              >
                Switch
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Farcaster"}
    </Button>
  )
}
