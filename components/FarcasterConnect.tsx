"use client"

import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"
import { useAccount, useConnect, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { config } from "./Web3Provider"
import { sdk } from "@farcaster/miniapp-sdk"
import type { Context } from "@farcaster/miniapp-sdk"

export function FarcasterConnect() {
  const { address, status, chain } = useAccount()
  const { connect } = useConnect()
  const { switchChain } = useSwitchChain()
  const [context, setContext] = useState<Context.MiniAppContext | null>(null)

  useEffect(() => {
    const fetchContext = async () => {
      const context = await sdk.context
      console.log(context, "context")
      setContext(context)
    }
    fetchContext()
  }, [])

  useEffect(() => {
    if (status === "disconnected") {
      connect({ connector: config.connectors[0] })
    }
  }, [connect, status])

  useEffect(() => {
    if (status === "connected") {
      switchChain({ chainId: base.id })
    }
  }, [switchChain, status])

  return (
    <div className="farcaster-connect">
      {status === "connected" && address ? (
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm border max-w-[140px]">
          <img src={context?.user.pfpUrl || "/placeholder.svg"} alt="avatar" className="w-4 h-4 rounded-full" />
          <span className="text-gray-800 font-medium text-sm truncate">{context?.user.username}</span>
        </div>
      ) : (
        <button
          onClick={() => connect({ connector: config.connectors[0] })}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm">Connect</span>
        </button>
      )}
    </div>
  )
}
