import { providers, Wallet } from 'ethers'
import { ParaswapConnextSDK, StatusResponse } from '../src'

const demo = async () => {
  // setup wallet
  if (!process.env.MNEMONIC) {
    console.warn(
      'Please specify a MNEMONIC phrase in your environment variables: `export MNEMONIC="..."`'
    )
    return
  }

  let wallet = Wallet.fromMnemonic(<string>process.env.MNEMONIC)
  const provider = new providers.JsonRpcProvider('https://polygon-rpc.com/')
  wallet = wallet.connect(provider)
  const userAddress = await wallet.getAddress()
  console.log('>> Wallet is set up')

  // setup quote
  const sdk = new ParaswapConnextSDK()

  // get quote
  console.log('... Requesting quote')
  const amount = '1000000'
  const quote = await sdk.getQuote(
    'USDC',
    'POL',
    'USDT',
    'DAI',
    amount,
    userAddress
  )
  if (!quote) {
    console.warn('Unable to find quote')
    return
  }
  console.log('> Got quote', quote)

  // Allowance
  console.log('>> Check allowance')
  const allowance = await sdk.getAllowance(wallet, quote.action.fromToken.address, quote.estimate.approvalAddress)
  if (allowance.lt(amount)) {
    const approveTx = await sdk.approveToken(wallet, amount, quote.action.fromToken.address, quote.estimate.approvalAddress)
    await approveTx.wait()
  }

  // Execution
  console.log('>> Execute quote')
  const sendTx = await wallet.sendTransaction(quote.transactionRequest)
  await sendTx.wait()

  // check status
  console.log('>> Check status')
  let result: StatusResponse | undefined
  do {
    result = await sdk.getStatus(quote.action.fromChainId, quote.action.toChainId, sendTx.hash)
    await new Promise((resolve) => {
      setTimeout(resolve, 10_000)
    })
  } while (
    !result ||
    (result.status !== 'DONE' && result.status !== 'FAILED')
  )
  console.log('>> FINISCHED', result)
}

demo()
