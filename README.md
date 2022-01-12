# ParaSwap Connext SDK

## Installation

```bash
yarn add @lifinance/paraswap-connext-sdk
```
or
```bash
npm install --save @lifinance/paraswap-connext-sdk
```

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