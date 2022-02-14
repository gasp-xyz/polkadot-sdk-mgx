import { localTestnetRelay } from './dotSamaInstance'

describe('test', () => {
  it('test', async () => {
    const api = await localTestnetRelay.getApi()
    console.log(api.isConnected)
  })
})

afterAll(async () => {
  await localTestnetRelay.disconnect()
})
