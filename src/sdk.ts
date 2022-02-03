import { Step, StatusResponse, Config, ConfigUpdate } from './types'
import { requestQuoteWrapper, requestStatusWrapper } from './helpers'
import { BigNumber, ethers, Signer } from 'ethers'
import { abi as ERC20ABI } from './erc20abi.json'

class SDK {
  private config: Config = {
    apiUrl: 'https://staging.li.quest',
  }

  /**
   * Get the current configuration of the SDK
   * @return {Config} - The config object
   */
  getConfig = (): Config => {
    return this.config
  }

  /**
   * Set a new confuration for the SDK
   * @param {ConfigUpdate} configUpdate - An object containing the configuration fields that should be updated.
   * @return {Config} The renewed config object
   */
  setConfig = (configUpdate: ConfigUpdate): Config => {
    this.config = Object.assign(this.config, configUpdate)
    return this.config
  }

  /**
   * Request a token transfer/swap quote
   * @param {string} fromToken - The token that should be transferred. Can be the address or the symbol
   * @param {string|number} fromChain - The receiving chain. Can be the chain id or chain key
   * @param {string} toToken - The token that should be transferred to. Can be the address or the symbol
   * @param {string|number} toChain - The receiving chain. Can be the chain id or chain key
   * @param {string} amount - The amount that should be sent in the smallest possible uint (e.g wei)
   * @param {string} userAddress - The sending and receiving wallet address
   * @return {Step | undefined} The found route or `undefined` if no route was found
   */
  async getQuote(
    fromToken: string,
    fromChain: string | number,
    toToken: string,
    toChain: string | number,
    amount: string,
    userAddress: string
  ): Promise<Step | undefined> {
    return requestQuoteWrapper(
      this.config.apiUrl,
      fromChain.toString(),
      toChain.toString(),
      fromToken,
      toToken,
      amount,
      userAddress
    )
  }

  /**
   * Request a token transfer/swap quote
   * @param {string} fromChain - The receiving chain. Can be the chain id or chain key
   * @param {string} toChain - The receiving chain. Can be the chain id or chain key
   * @param {string} txHash - The transaction hash of the submitted quote
   * @return {Step | undefined} The found route or `undefined` if no route was found
   */
  async getStatus(
    fromChain: string | number,
    toChain: string | number,
    txHash: string
  ): Promise<StatusResponse | undefined> {
    return requestStatusWrapper(
      this.config.apiUrl,
      fromChain.toString(),
      toChain.toString(),
      txHash
    )
  }

  //// Helpers

  async getAllowance(
    signer: Signer,
    tokenAddress: string,
    approvalAddress: string
  ): Promise<BigNumber> {
    if (tokenAddress === ethers.constants.AddressZero) {
      throw new Error('Native gas tokens do not have to be approved.')
    }
    const erc20 = new ethers.Contract(tokenAddress, ERC20ABI, signer)
    return erc20.allowance(await signer.getAddress(), approvalAddress)
  }

  async approveToken(
    signer: Signer,
    amount: string,
    tokenAddress: string,
    approvalAddress: string
  ): Promise<ethers.providers.TransactionResponse> {
    if (tokenAddress === ethers.constants.AddressZero) {
      throw new Error('Native gas tokens do not have to be approved.')
    }
    const erc20 = new ethers.Contract(tokenAddress, ERC20ABI, signer)
    return erc20.approve(approvalAddress, amount)
  }

  // async getBalance(
  //   userAddress: string,
  //   addressOrSymbol: string,
  //   chainId: number
  // ): Promise<TokenAmount> {
  //   const tokens = await this.getTokens()
  //   const token = tokens.find(
  //     (token) =>
  //       token.chainId === chainId &&
  //       (token.address === addressOrSymbol.toLowerCase() ||
  //         token.symbol.toLowerCase() === addressOrSymbol.toLowerCase())
  //   )
  //   if (!token) {
  //     throw new Error('Unknow token')
  //   }
  //   const balance = await this.lifiSdk.getTokenBalance(userAddress, token)
  //   if (!balance) {
  //     throw new Error('Unable to find token balance')
  //   }
  //   return balance
  // }

  // async getBalances(userAddress: string): Promise<TokenAmount[]> {
  //   const tokens = await this.getTokens()
  //   const balances = await this.lifiSdk.getTokenBalances(userAddress, tokens)
  //   return balances
  // }
}

export const ParaswapConnextSDK = SDK
