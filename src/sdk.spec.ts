import { ParaswapConnextSDK } from '.'

describe('sdk', () => {
  it('should update the config', () => {
    const sdk = new ParaswapConnextSDK()
    const myUrl = 'https://hello.world'
    sdk.setConfig({
      apiUrl: myUrl,
    })
    const updatedConfig = sdk.getConfig()
    expect(updatedConfig.apiUrl).toEqual(myUrl)
  })
})
