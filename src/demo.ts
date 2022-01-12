import { providers, Wallet } from 'ethers'
import { exit } from 'process'
import SDK, { getRpcUrl, ExecutionSettings, Execution, ChainId } from './index'

const USE_AUTOMATIC_LIFI_EXECUTION = true

const demo = async () => {
  // setup wallet
  if (!process.env.MNEMONIC) {
    console.warn(
      'Please specify a MNEMONIC phrase in your environment variables: `export MNEMONIC="..."`'
    )
    return
  }
  let wallet = Wallet.fromMnemonic(<string>process.env.MNEMONIC)
  const provider = new providers.JsonRpcProvider(getRpcUrl(137))
  wallet = wallet.connect(provider)
  const userAddress = await wallet.getAddress()
  console.log('>> Wallet Setup')

  // setup Route
  const sdk = SDK
  const srcToken = await sdk.getBalance(
    await wallet.getAddress(),
    'USDC',
    ChainId.POL
  )
  const destToken = await sdk.getBalance(
    await wallet.getAddress(),
    'USDT',
    ChainId.DAI
  )
  console.log('> Current Balance POL', srcToken)
  console.log('> Current Balance DAI', destToken)

  // get Route
  console.log('... Requesting Route')
  const rates = await sdk.getRates(
    srcToken.address,
    srcToken.chainId,
    destToken.address,
    destToken.chainId,
    '1000000',
    userAddress
  )

  if (!rates || !rates.routes.length) {
    console.warn('Unable to find routes.')
    return
  }
  const route = rates.routes[0]
  console.log('> Got Route', route)

  // Execution
  console.log('>> Execute Route')
  if (USE_AUTOMATIC_LIFI_EXECUTION) {
    const settings: ExecutionSettings = {
      updateCallback: (updatedRoute) => {
        let lastExecution: Execution | undefined = undefined
        for (const step of updatedRoute.steps) {
          if (step.execution) {
            lastExecution = step.execution
          }
        }
        console.log(lastExecution)
      },
    }
    await sdk.executeRoute(wallet, route, settings)
  } else {
    const step = await sdk.buildTx(route)
    // approve token

    // start transfer
    console.log('... Sending Transaction')
    const response = await wallet.sendTransaction(step.transactionRequest!)
    await response.wait()
    console.log('> Transaction Sent')
    console.log('... Waiting for Receiving Chain')

    const event = await sdk.waitForTransactionPreparedEvent(wallet, step)
    console.log('> Receiving Chain Prepared')
    console.log('... Fulfilling')

    const { transactionHash } = await sdk.fulfillTransfer(wallet, step, event)
    console.log(`Fulfilled in Transaction ${transactionHash}`)
  }
  exit()
}

demo()
