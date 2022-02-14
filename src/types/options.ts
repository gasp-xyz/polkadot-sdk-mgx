import BN from 'bn.js'
import { Signer } from '@polkadot/api/types'
import { ISubmittableResult } from '@polkadot/types/types'

export type Options = Partial<{
  nonce: BN
  signer: Signer
  memo: string
  statusCallback: (result: ISubmittableResult, unsub: () => void) => void
}>
