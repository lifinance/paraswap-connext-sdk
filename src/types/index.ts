import { Step as LiFiStep } from '@lifinance/types'
import { providers } from 'ethers'

export * from '@lifinance/types'

export type Config = {
  apiUrl: string
}

export type ConfigUpdate = {
  apiUrl?: string
}

// the returned Steps always contain a transactionRequest
export type Step = LiFiStep & {
  transactionRequest: providers.TransactionRequest
}
