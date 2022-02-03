# ParaSwap Connext SDK

## Installation

```bash
yarn add @lifinance/paraswap-connext-sdk
```
or
```bash
npm install --save @lifinance/paraswap-connext-sdk
```


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
  userAddress
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


## Summary

This package allow to access to do bridge and swap calls via ParaSwap and Connext. LiFi API is used under the hood to  find the best cross-chain route. The route can then executed via the SDK.
Learn more about LiFi on (https://li.finance).


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
