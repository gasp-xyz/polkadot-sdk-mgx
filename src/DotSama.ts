import { ApiPromise, WsProvider } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { blake2AsHex } from '@polkadot/util-crypto'
import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { u8aToHex, isHex, hexToBn } from '@polkadot/util'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { ISubmittableResult } from '@polkadot/types/types'
import Buffer from 'buffer'
import BN from 'bn.js'

import { DEFAULT_TOKEN_DECIMALS } from './constants/chain'
import { Options } from './types/options'
import signTx from './utils/signTx'
import { TCrowdloanFund } from './types/crowdloanFund'
import { TContribution } from './types/crowdloanContribution'
import { TCrowdloan } from './types/crowdloan'
import { fromBN } from './utils/fromBN'
import { toBN } from './utils/toBN'
/**
 * @class DotSama
 * @author Mangata Finance
 * The DotSama class defines the `getInstance` method that lets clients access the unique singleton instance.
 */
export class DotSama {
  private api: Promise<ApiPromise> | null
  private uri: string
  private decimals: number = DEFAULT_TOKEN_DECIMALS
  private static instanceMap: Map<string, DotSama> = new Map<string, DotSama>()

  /**
   * The Mangata's constructor is private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(uri: string) {
    this.api = null
    this.uri = uri
  }

  /**
   * Initialised via create method with proper types and rpc
   * for Mangata
   */
  private async connectToNode(uri: string) {
    const provider = new WsProvider(uri)
    const api = await ApiPromise.create({ provider, throwOnConnect: true })
    this.decimals = api.registry.chainDecimals[0]
    return api
  }

  /**
   * The static method that controls the access to the Mangata instance.
   */
  public static getInstance(uri: string): DotSama {
    if (!DotSama.instanceMap.has(uri)) {
      this.instanceMap.set(uri, new DotSama(uri))
      return this.instanceMap.get(uri)!
    } else {
      return this.instanceMap.get(uri)!
    }
  }

  /**
   * Api instance of the connected node
   */
  async getApi(): Promise<ApiPromise> {
    // Because we assign this.api synchronously, repeated calls to
    // method() are guaranteed to always reuse the same promise.
    if (!this.api) {
      this.api = this.connectToNode(this.uri)
    }

    return this.api
  }

  async disconnect(): Promise<void> {
    const api = await this.getApi()
    api.disconnect()
  }

  async getCrowdloanFunds(parachainId: string) {
    const api = await this.getApi()
    const parentHash = (await api.rpc.chain.getHeader()).parentHash

    const fund = (await api.query.crowdloan.funds(parachainId)).toJSON() as TCrowdloanFund
    let bytes = new TextEncoder().encode('crowdloan')
    let buf = Buffer.Buffer.allocUnsafe(4)
    buf.writeUInt32LE(fund.trieIndex)
    var array = Uint8Array.from(buf)
    var concatArray = new Uint8Array([...bytes, ...array])
    let childEncodedBytes = u8aToHex(new TextEncoder().encode(':child_storage:default:'))
    let crowdloanKey = childEncodedBytes + blake2AsHex(concatArray, 256).substring(2)
    let allKeys = (await api.rpc.childstate.getKeys(crowdloanKey, null, parentHash)) as any

    let crowdloan: TCrowdloan = {
      cap: isHex(fund.cap) ? fromBN(hexToBn(fund.cap)) : fromBN(new BN(fund.cap)),
      raised: isHex(fund.raised) ? fromBN(hexToBn(fund.raised)) : fromBN(new BN(fund.raised)),
      contributions: [] as TContribution[],
    }

    const storages = await api.rpc.childstate.getStorageEntries(
      crowdloanKey,
      allKeys.map((i: any) => i.toHex())
    )

    for (let i = 0; i < storages.length; i++) {
      const storage = storages[i]
      if (storage.isSome) {
        let storage_item = storage.unwrap()
        let balance = BigInt(u8aToHex(storage_item.slice(0, 16).reverse()))
        let memoLenght = storage.unwrap().slice(16, 17)
        let memo = ''
        if (u8aToHex(memoLenght) != '0x00') {
          const hexAddress = u8aToHex(storage_item.slice(17, storage_item.length))
          memo = encodeAddress(hexAddress, 42)
        }

        crowdloan.contributions.push({
          kusamaAccount: encodeAddress(allKeys[i].toHex(), 2),
          contribution: fromBN(new BN(balance.toString())),
          memo: memo,
        })
      }
    }

    return crowdloan
  }

  async contributeToCrowdloan(
    account: string | KeyringPair,
    parachainId: string,
    amount: string,
    options?: Options
  ) {
    const api = await this.getApi()
    const valueToContribute = toBN(amount, this.decimals)

    let extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>

    if (options?.memo) {
      const memoAddress = decodeAddress(options.memo)
      const memo = u8aToHex(memoAddress)
      const valueToContribute = toBN(amount, this.decimals)
      extrinsic = api.tx.utility.batchAll([
        api.tx.crowdloan.contribute(parachainId, valueToContribute, null),
        api.tx.crowdloan.addMemo(parachainId, memo),
      ])
    } else {
      extrinsic = api.tx.crowdloan.contribute(parachainId, valueToContribute, null)
    }
    // now we need to sign the transaction
    await signTx(api, account, extrinsic, options)
  }
}
