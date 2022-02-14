import BN from 'bn.js'
import Big from 'big.js'
import { BIG_DEFAULT_DECIMAL_MULTIPLIER, DEFAULT_TOKEN_DECIMALS } from '../constants/chain'

export const fromBN = (value: BN, exponent?: number): string => {
  if (!value) return '0'

  try {
    const inputNumber = Big(value.toString())
    const decimalMultiplier =
      !exponent || exponent === DEFAULT_TOKEN_DECIMALS
        ? BIG_DEFAULT_DECIMAL_MULTIPLIER
        : Big('10').pow(exponent)

    const res = inputNumber.div(decimalMultiplier)
    const resStr = res.toString()

    return resStr
  } catch (err) {
    console.error('Could not convert from BN:', err)

    return '0'
  }
}
