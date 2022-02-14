import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { ISubmittableResult } from '@polkadot/types/types'

import { Options } from '../types/options'

export default async (
  api: ApiPromise,
  account: string | KeyringPair,
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  options?: Options
) => {
  let unsub: () => void = () => {}
  try {
    unsub = await tx.signAndSend(
      account,
      {
        nonce: options?.nonce,
        signer: options?.signer,
      },
      (result) => options?.statusCallback?.(result, unsub)
    )
  } catch (error) {
    console.error(error)
  }
}
