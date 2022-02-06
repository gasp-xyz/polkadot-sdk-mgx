import { polkadot } from './dotSamaInstance'

describe('test', () => {
  it('test', async () => {
    const api = await polkadot.getApi()
    console.log(api.isConnected)
  })
})

afterAll(async () => {
  await polkadot.disconnect()
  await new Promise((resolve) => setTimeout(() => resolve(true), 10000))
})
