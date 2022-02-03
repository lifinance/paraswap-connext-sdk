# ParaSwap Connext SDK

```
Prerelase for local testing! The package will be available on package managers soon.
```

## Summary

This package allows to do bridge and swap calls via [ParaSwap](https://paraswap.io/) and [Connext](https://connext.network/). The [Li.Fi](https://li.fi/) API is used under the hood to find the best cross-chain quote. The quote can then be executed using any signer/wallet.


## Supported Chains and Tokens

Transfers of the defined tokens are possible between all combinations of chains supported by Connext. The combination with ParaSwap enables you to swap+bridge any token from chains supported by ParaSwap and receive any token on these chains aswell (bride+swap).

| Chain     | Chain Id | Chain Key | Tokens when sending chain    | Tokens when receiving chain |
|-----------|----------|-----------|------------------------------|-----------------------------|
| Ethereum  | 1        | ETH       | ✅ access to most tokens     | ✅ access to most tokens     |
| Optimism  | 10       | OPT       | ETH, USDC, USDT, DAI, WBTC   | ETH, USDC, USDT, DAI, WBTC  |
| Binance   | 56       | BSC       | ✅ access to most tokens     | ✅ access to most tokens     |
| Gnosis    | 100      | DAI       | ETH, USDC, USDT, DAI, WBTC   | ETH, USDC, USDT, DAI, WBTC  |
| Polygon   | 137      | POL       | ✅ access to most tokens     | ✅ access to most tokens     |
| Fantom    | 250      | FTM       | ETH, USDC, USDT, DAI, WBTC   | ETH, USDC, USDT, DAI, WBTC  |
| Moonriver | 1285     | MOR       | USDC, USDT                   | USDC, USDT                  |
| Arbitrum  | 42161    | ARB       | ETH, USDC, USDT, DAI, WBTC   | ETH, USDC, USDT, DAI, WBTC  |
| Avalanche | 43114    | AVA       | ✅ access to most tokens     | ✅ access to most tokens     |


## Usage

First you request a quote (`getQuote`) for the assets you want to transfer and swap.
The returned quote contains a `transactionRequest` which can be passed to your wallet to start the transfer.
Afterwards you want to use the `getStatus` function to check if the transfer has been been completed on the destination chain.

```js
import { providers, Wallet } from 'ethers'
import { ParaswapConnextSdk } from '../src'

const sdk = new ParaswapConnextSdk()

// get quote
const quote = await sdk.getQuote(
  'USDC',
  'POL',
  'USDT',
  'DAI',
  '1000000',
  await wallet.getAddress()
)

// start transfer
const sendTx = await wallet.sendTransaction(quote.transactionRequest)
await sendTx.wait()

// check status
console.log('>> Check status')
let result
do {
  result = await sdk.getStatus(quote.action.fromChainId, quote.action.toChainId, sendTx.hash)
  await new Promise((resolve) => {
    setTimeout(resolve, 10_000)
  })
} while (
  !result ||
  (result.status !== 'DONE' && result.status !== 'FAILED')
)
console.log('>> FINISHED', result)
```

Please check the demo script `./demo/demo.js` for a complete example.


## Extend the SDK

Install dependencies:

```bash
yarn
```

### Test

Test your code with Jest framework:

```bash
yarn test
```

### Build

Build production (distribution) files in your **dist** folder:

```bash
yarn build
```


### Publish

In order to update the package, commit all new changes first. Then run the following command:

```bash
yarn release
```

This will 
* bump the version number according to the types of the last commits (i.e. if it is a major, minor or bug fix release)
* create a new git tag
* update the CHANGELOG.md

Next you need to push both, the code and the new version tag:
```bash
git push && git push --tags
```
