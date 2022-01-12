import Lifi, {
  Token,
  RoutesResponse,
  Route,
  Step,
  ChainId,
  TokenAmount,
  getRpcUrl,
} from './types'
import { Logger } from '@connext/nxtp-utils'
import {
  NxtpSdk,
  NxtpSdkEvents,
  ReceiverTransactionPreparedPayload,
} from '@connext/nxtp-sdk'
import { Signer } from 'ethers'

function setupLifi() {
  const lifi = Lifi
  lifi.setConfig({
    apiUrl: 'https://developkub.li.finance/', // staging
    defaultRouteOptions: {
      bridges: {
        allow: ['nxtp'],
      },
      exchanges: {
        allow: ['paraswap'],
      },
    },
  })
  return Lifi
}

class SDK {
  public lifiSdk: typeof Lifi = setupLifi()

  async getTokens(): Promise<Token[]> {
    return (await this.lifiSdk.getPossibilities()).tokens
  }

  async getRates(
    srcToken: string,
    srcChainId: number,
    destToken: string,
    destChainId: number,
    amount: string,
    userAddress?: string
  ): Promise<RoutesResponse> {
    const routesRequest = {
      fromChainId: srcChainId,
      fromAmount: amount,
      fromTokenAddress: srcToken,
      fromAddress: userAddress,
      toChainId: destChainId,
      toTokenAddress: destToken,
    }
    return this.lifiSdk.getRoutes(routesRequest)
  }

  async buildTx(priceRoute: Route): Promise<Step> {
    for (const step of priceRoute.steps) {
      if (!step.execution || step.execution.status !== 'DONE') {
        return this.lifiSdk.getStepTransaction(step)
      }
    }

    throw new Error(
      'Route has already been executed, requtest a new route first.'
    )
  }

  //// Execution helpers
  private getNxtpInstance(signer: Signer, step: Step) {
    const chainConfig = {
      [ChainId.ETH]: {
        providers: getRpcUrl(ChainId.ETH),
      },
      [step.action.fromChainId]: {
        providers: getRpcUrl(step.action.fromChainId),
      },
      [step.action.toChainId]: {
        providers: getRpcUrl(step.action.toChainId),
      },
    }

    const sdk = new NxtpSdk({
      signer,
      chainConfig,
      logger: new Logger({ name: 'NxtpSdkBase', level: 'error' }),
    })
    return sdk
  }

  async waitForTransactionPreparedEvent(
    signer: Signer,
    step: Step,
    timeout = 300_000
  ): Promise<ReceiverTransactionPreparedPayload> {
    const nxtpSdk = this.getNxtpInstance(signer, step)

    const prepared = await nxtpSdk.waitFor(
      NxtpSdkEvents.ReceiverTransactionPrepared,
      timeout,
      (data) => data.txData.transactionId === step.estimate.data.transactionId // filter function
    )

    nxtpSdk.removeAllListeners()
    return prepared
  }

  async fulfillTransfer(
    signer: Signer,
    step: Step,
    prepared: ReceiverTransactionPreparedPayload
  ): Promise<{ transactionHash: string }> {
    const nxtpSdk = this.getNxtpInstance(signer, step)

    const result = await nxtpSdk.fulfillTransfer(prepared)

    nxtpSdk.removeAllListeners()
    return result
  }

  // getEncryptionPublicKey(): Promise<string>
  // -> use nxtp internal methods

  // getDecryptedCallDate(event: TransactionPreparedEvent): Promise<string>
  // -> use nxtp internal methods

  //// Forward to LiFi SDK (helpers)

  // getAllowances(
  //   userAddress: Address,
  //   tokenAddresses: Address[]
  // ): Promise<Allowance[] | APIError>
  // -> forward to lifi sdk

  // getAllowance(
  //   userAddress: Address,
  //   tokenAddress: Address
  // ): Promise<Allowance | APIError>
  // -> forward to lifi sdk

  // approveTokenBulk(
  //   amount: PriceString,
  //   userAddress: Address,
  //   tokenAddresses: Address[],
  //   _provider?: any
  // ): Promise<string[]>
  // -> forward to lifi sdk

  // approveToken(
  //   amount: PriceString,
  //   userAddress: Address,
  //   tokenAddress: Address,
  //   _provider?: any,
  //   sendOptions?: Omit<SendOptions, 'from'>
  // ): Promise<string>
  // -> forward to lifi sdk

  async getBalance(
    userAddress: string,
    addressOrSymbol: string,
    chainId: number
  ): Promise<TokenAmount> {
    const tokens = await this.getTokens()
    const token = tokens.find(
      (token) =>
        token.chainId === chainId &&
        (token.address === addressOrSymbol.toLowerCase() ||
          token.symbol.toLowerCase() === addressOrSymbol.toLowerCase())
    )

    if (!token) {
      throw new Error('Unknow token')
    }

    const balance = await this.lifiSdk.getTokenBalance(userAddress, token)
    if (!balance) {
      throw new Error('Unable to find token balance')
    }

    return balance
  }

  async getBalances(userAddress: string): Promise<TokenAmount[]> {
    const tokens = await this.getTokens()
    const balances = await this.lifiSdk.getTokenBalances(userAddress, tokens)
    return balances
  }

  // expose other LiFi methods
  executeRoute = this.lifiSdk.executeRoute
}

export default new SDK()
