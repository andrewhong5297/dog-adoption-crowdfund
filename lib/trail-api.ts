// Trail API integration for Herd Trails
// Trail details and debugging help: https://trails-api.herd.eco/v1/trails/0198c2e0-a2d8-76d3-bfe1-3c9191ebd378/versions/0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7/guidebook.txt?promptObject=farcaster_miniapp&trailAppId=0198c2df-d48c-7f25-aae1-873d55126415

const TRAIL_ID = "0198c2e0-a2d8-76d3-bfe1-3c9191ebd378"
const VERSION_ID = "0198c2e0-a2e1-79cb-9c8f-1ea675b21ce7"
const TRAIL_APP_ID = "0198c2df-d48c-7f25-aae1-873d55126415"
const BASE_URL = "https://trails-api.herd.eco/v1"

// Required headers for all API requests
const getHeaders = () => ({
  "Content-Type": "application/json",
  "Herd-Trail-App-Id": TRAIL_APP_ID,
})

// Types for API requests and responses
export interface UserInputs {
  [nodeId: string]: {
    [inputPath: string]: {
      value: string
    }
  }
}

export interface EvaluationRequest {
  walletAddress: string
  userInputs: UserInputs
  execution: { type: "latest" } | { type: "new" } | { type: "manual"; executionId: string }
}

export interface EvaluationResponse {
  finalInputValues: Record<string, string>
  payableAmount: string
  contractAddress: string
  callData: string
}

export interface ExecutionRequest {
  nodeId: string
  transactionHash: string
  walletAddress: string
  execution: { type: "latest" } | { type: "new" } | { type: "manual"; executionId: string }
}

export interface ExecutionQueryRequest {
  walletAddresses: string[]
}

export interface ExecutionQueryResponse {
  totals: {
    transactions: string
    wallets: string
    stepStats: {
      [stepNumber: string]: {
        wallets: string
        transactions: string
        transactionHashes: Array<{
          walletAddress: string
          txHash: string
          blockTimestamp: number
          blockNumber: number
          latestExecutionId: string
          farcasterData: {
            username: string
            pfp_url: string
            display_name: string
            fid: string
            bio: string
          } | null
        }>
      }
    }
  }
  walletExecutions: Array<{
    walletAddress: string
    executions: Array<{
      id: string
      createdAt: string
      updatedAt: string
      steps: Array<{
        stepNumber: number
        nodeId: string | null
        txHash: string
        txBlockTimestamp: number | null
        txBlockNumber: number | null
        createdAt: string
      }>
    }>
    farcasterData: {
      username: string
      pfp_url: string
      display_name: string
      fid: string
      bio: string
    } | null
    txnsPerStep: {
      [stepNumber: string]: Array<{
        txHash: string
        blockTimestamp: number
        blockNumber: number
        latestExecutionId: string
      }>
    }
  }>
}

export interface ReadRequest {
  walletAddress: string
  userInputs?: UserInputs
  execution: { type: "latest" } | { type: "new" } | { type: "manual"; executionId: string }
}

// API Functions
export class TrailAPI {
  /**
   * Get transaction calldata for a step
   */
  static async getEvaluation(stepNumber: number, request: EvaluationRequest): Promise<EvaluationResponse> {
    const url = `${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/steps/${stepNumber}/evaluations`

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Evaluation API failed: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Save transaction hash after submission
   */
  static async saveExecution(request: ExecutionRequest): Promise<void> {
    const url = `${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/executions`

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Execution API failed: ${response.status} - ${errorText}`)
    }
  }

  /**
   * Query execution history for the trail
   */
  static async queryExecutions(request: ExecutionQueryRequest): Promise<ExecutionQueryResponse> {
    const url = `${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/executions/query`

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Execution query API failed: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Get data outputs from any read node
   */
  static async readNode(nodeId: string, request: ReadRequest): Promise<any> {
    const url = `${BASE_URL}/trails/${TRAIL_ID}/versions/${VERSION_ID}/nodes/${nodeId}/read`

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Read API failed: ${response.status} - ${errorText}`)
    }

    return response.json()
  }
}

// Trail step configuration based on the guidebook
export const TRAIL_STEPS = {
  1: {
    stepNumber: 1,
    name: "Approve USDC",
    description: "Approve USDC spending for donation",
    primaryNodeId: "0198c2e0-a2e8-7a99-82e7-7514211a187f",
    requiredInputs: [
      {
        nodeId: "0198c2e0-a2e8-7a99-82e7-7514211a187f",
        inputName: "inputs.value",
        label: "Donation Amount (USDC)",
        type: "uint256",
        decimals: 6,
        intent: "the amount of USDC the user wants to donate in the next step",
      },
    ],
    readNodes: [
      {
        nodeId: "0198c2e0-a2e8-7a99-82e7-75138a5f58ad",
        name: "FiatTokenV2_2.balanceOf",
        intent: "check the user's USDC balance",
      },
    ],
  },
  2: {
    stepNumber: 2,
    name: "Donate USDC",
    description: "Donate USDC to the crowdfund",
    primaryNodeId: "0198c2e0-a2e7-7c59-a3a2-76c5dfa3cc33",
    requiredInputs: [
      {
        nodeId: "0198c2e0-a2e7-7c59-a3a2-76c5dfa3cc33",
        inputName: "inputs.amount",
        label: "Donation Amount (USDC)",
        type: "uint128",
        decimals: 6,
        intent: "usdc to donate",
      },
    ],
    readNodes: [
      {
        nodeId: "0198c2e0-a2e7-7c59-a3a2-76c5dfa3cc33",
        name: "FarcasterCrowdfund.donate",
        intent: "donate to a crowdfund with USDC",
        readAfterExecution: true,
      },
      {
        nodeId: "0198c2e0-a2e7-7c59-a3a2-76c43f6028e2",
        name: "FarcasterCrowdfund.donations",
        intent: "get the total donated amount from the user for this crowdfund",
      },
      {
        nodeId: "0198c2e0-a2e9-7497-8e7e-9e8feb56f554",
        name: "FarcasterCrowdfund.getDonorsCount",
        intent: "get total number of donors for the crowdfund",
      },
      {
        nodeId: "0198c2e0-a2e8-7a99-82e7-7515c48438b0",
        name: "FarcasterCrowdfund.crowdfunds",
        intent: "check on the progress of the crowdfund",
      },
    ],
  },
  3: {
    stepNumber: 3,
    name: "Claim Refund",
    description: "Claim refund if crowdfund fails",
    primaryNodeId: "0198c2e0-a2e9-7497-8e7e-9e90535b0ca6",
    requiredInputs: [],
    readNodes: [],
  },
} as const

// Utility functions
export const formatUSDC = (amount: string | number, decimals = 6): string => {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return (num / Math.pow(10, decimals)).toFixed(2)
}

export const parseUSDC = (amount: string, decimals = 6): string => {
  const num = Number.parseFloat(amount)
  return (num * Math.pow(10, decimals)).toString()
}

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString()
}
