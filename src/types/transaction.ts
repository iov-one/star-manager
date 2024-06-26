import { AminoMsg } from "@cosmjs/amino";
import {
  isAminoMsgBeginRedelegate,
  isAminoMsgDelegate,
  isAminoMsgUndelegate,
} from "@cosmjs/stargate";
import { Log } from "@cosmjs/stargate/build/logs";
import api from "api";
import { AminoType } from "types/aminoTypes";
import { Amount } from "types/amount";
import { Validator } from "types/delegationValidator";
import { getValidator, reverseLookup } from "utils/getTransaction";

import { Starname as StarnameData } from "./resolveResponse";

export interface BaseTx {
  height: number;
  gas_used: string;
  gas_wanted: string;
  logs: ReadonlyArray<Log>;
  raw_log: string;
  timestamp: string;
  tx: AminoMsg;
  txhash: string;
}

export interface RedelegationData {
  readonly src: Validator;
  readonly dst: Validator;
}

export type DelegationData = Validator;

export interface ITransaction {
  readonly id: string;
  readonly type: any;
  readonly amount: ReadonlyArray<Amount>;
  readonly data: StarnameData | RedelegationData | DelegationData | string;
  readonly fee: ReadonlyArray<Amount>;
  readonly time: Date;
  readonly note?: string;
  readonly escrowId?: string;
  readonly sender?: string;
  readonly seller?: string;
  readonly buyer?: string;
  readonly updater?: string;
  readonly deadline?: Date;
}

export class Transaction {
  static async fromRedelegateBaseTx(baseTx: BaseTx): Promise<ITransaction> {
    const { value: stdTx } = baseTx.tx;
    const {
      fee,
      memo,
      msg: [message],
    } = stdTx;
    const { value } = message;
    if (!isAminoMsgBeginRedelegate(message)) {
      throw new Error("cannot parse transaction");
    }
    return {
      amount: api.toInternalCoins([value.amount]),
      fee: api.toInternalCoins(fee.amount),
      data: {
        src: await getValidator(value.validator_src_address),
        dst: await getValidator(value.validator_dst_address),
      },
      sender: await reverseLookup(value.delegator_address),
      id: baseTx.txhash,
      type: message.type as AminoType,
      time: new Date(baseTx.timestamp),
      note: memo,
    };
  }

  static async fromStakingBaseTx(baseTx: BaseTx): Promise<ITransaction> {
    const { value: stdTx } = baseTx.tx;
    const {
      fee,
      memo,
      msg: [message],
    } = stdTx;
    const { value } = message;
    if (!isAminoMsgDelegate(message) && !isAminoMsgUndelegate(message)) {
      throw new Error("cannot parse transaction");
    }
    return {
      amount: api.toInternalCoins([value.amount]),
      fee: api.toInternalCoins(fee.amount),
      data: await getValidator(value.validator_address),
      sender: await reverseLookup(value.delegator_address),
      id: baseTx.txhash,
      type: message.type as AminoType,
      time: new Date(baseTx.timestamp),
      note: memo,
    };
  }
}

export const isStarnameData = (
  data: StarnameData | any,
): data is StarnameData => {
  if (typeof data !== "object") return false;
  return "name" in data || "domain" in data;
};

export const isDelegationData = (
  data: DelegationData | any,
): data is DelegationData => {
  if (typeof data !== "object") return false;
  if (!("description" in data)) return false;
  return "moniker" in data.description;
};

export const isRedelegationData = (
  data: RedelegationData | any,
): data is RedelegationData => {
  if (typeof data !== "object") return false;
  return (
    "src" in data &&
    "dst" in data &&
    isDelegationData(data.src) &&
    isDelegationData(data.dst)
  );
};
