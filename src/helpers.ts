import { BridgeTool, ExchangeTool, StatusResponse, Step } from './types'
import axios from 'axios'

export const requestQuoteWrapper = async (
  apiBaseUrl: string,
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string
): Promise<Step | undefined> => {
  const bridges = [BridgeTool.connext]
  const exchanges = [ExchangeTool.paraswap]
  return requestQuote(
    apiBaseUrl,
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount,
    fromAddress,
    bridges,
    exchanges
  )
}
// Get a quote for your desired transfer
const requestQuote = async (
  apiBaseUrl: string,
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string,
  allowBridges?: string[],
  allowExchanges?: string[]
): Promise<Step | undefined> => {
  try {
    const result = await axios.get<Step>(`${apiBaseUrl}/v1/quote`, {
      params: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
        allowBridges,
        allowExchanges,
      },
    })
    return result.data
  } catch (e) {
    return undefined
  }
}

export const requestStatusWrapper = async (
  apiBaseUrl: string,
  fromChain: string,
  toChain: string,
  txHash: string
): Promise<StatusResponse | undefined> => {
  return requestStatus(
    apiBaseUrl,
    BridgeTool.connext,
    fromChain,
    toChain,
    txHash
  )
}

// Check the status of your transfer
export const requestStatus = async (
  apiBaseUrl: string,
  bridge: string,
  fromChain: string,
  toChain: string,
  txHash: string
): Promise<StatusResponse | undefined> => {
  try {
    const result = await axios.get<StatusResponse>(`${apiBaseUrl}/v1/status`, {
      params: {
        bridge,
        fromChain,
        toChain,
        txHash,
      },
    })
    return result.data
  } catch (e) {
    return undefined
  }
}
