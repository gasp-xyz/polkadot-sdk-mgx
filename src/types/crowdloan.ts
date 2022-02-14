import { TContribution } from './crowdloanContribution'

export type TCrowdloan = {
  cap: string
  raised: string
  contributions: TContribution[]
}
