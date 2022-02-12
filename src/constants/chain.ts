import Big from 'big.js'
import BN from 'bn.js'

export const BN_10 = new BN('10')

export const DEFAULT_TOKEN_DECIMALS = 12
export const BN_DEFAULT_DECIMAL_MULTIPLIER = BN_10.pow(new BN(DEFAULT_TOKEN_DECIMALS))
export const BIG_DEFAULT_DECIMAL_MULTIPLIER = Big('10').pow(DEFAULT_TOKEN_DECIMALS)
export const PARACHAIN_ID = '2000'
