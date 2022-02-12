import BN from 'bn.js'
import Big from 'big.js'
import { BIG_DEFAULT_DECIMAL_MULTIPLIER, DEFAULT_TOKEN_DECIMALS } from '../constants/chain'

Big.PE = 256 // The positive exponent value at and above which toString returns exponential notation.
Big.DP = 40 // The maximum number of decimal places of the results of operations involving division.
Big.NE = -40 // The negative exponent value at and below which toString returns exponential notation.
Big.RM = 1 // Rounding mode: from half up

export default (value: string, exponent?: number): BN => {
  if (!value) return new BN('0')

  try {
    const inputNumber = Big(value)
    const decimalMultiplier =
      !exponent || exponent === DEFAULT_TOKEN_DECIMALS
        ? BIG_DEFAULT_DECIMAL_MULTIPLIER
        : Big('10').pow(exponent)

    const res = inputNumber.mul(decimalMultiplier)
    const resStr = res.round().toString()

    return new BN(resStr)
  } catch (err) {
    console.error('Could not convert to BN:', err)

    return new BN('0')
  }
}
