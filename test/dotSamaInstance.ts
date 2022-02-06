import {
  DotSama,
  POLKADOT_ENDPOINT,
  KUSAMA_ENDPOINT,
  WESTEND_ENDPOINT,
  ROCOCO_ENDPOINT,
} from '../src'

export const polkadot = DotSama.getInstance(POLKADOT_ENDPOINT)
export const kusama = DotSama.getInstance(KUSAMA_ENDPOINT)
export const westend = DotSama.getInstance(WESTEND_ENDPOINT)
export const rococo = DotSama.getInstance(ROCOCO_ENDPOINT)
