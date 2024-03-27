import { MsgsAndMemo } from "aleph-js";
import React from "react";
import { DummySigner } from "signers/dummy";
import { Wallet } from "signers/wallet";
import { PostTxResult } from "types/postTxResult";
import { estimateFee } from "utils/estimateFee";

export class GasEstimatorWallet extends Wallet {
  constructor() {
    super(new DummySigner());
  }

  protected signAndBroadcast(msgsAndMemo: MsgsAndMemo): Promise<PostTxResult> {
    return Promise.resolve(estimateFee(msgsAndMemo.messages));
  }
}

export const GasEstimatorContext: React.Context<Wallet> = React.createContext(
  new GasEstimatorWallet() as Wallet,
);
