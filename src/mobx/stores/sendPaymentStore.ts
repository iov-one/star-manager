import { TokenLike } from "config";
import { action, computed, observable } from "mobx";
import { AddressResolver } from "mobx/stores/addressResolver";
import React from "react";
import { Wallet } from "signers/wallet";
import { PostTxResult } from "types/postTxResult";

export class SendPaymentStore extends AddressResolver {
  @observable amount = NaN;
  @observable note = "";
  @observable token: TokenLike | undefined;

  @computed
  public get valid(): boolean {
    return this.address !== "" && !isNaN(this.amount);
  }

  @action.bound
  public setAmount(value: number): void {
    this.amount = value;
  }

  @action.bound
  public setNote(note: string): void {
    this.note = note;
  }

  @action.bound
  public setToken(token: TokenLike): void {
    this.token = token;
  }

  @action.bound
  public async send(wallet: Wallet): Promise<PostTxResult> {
    const { token, address, amount, note } = this;
    if (token === undefined) {
      throw new Error(
        "For some reason, no token was picked in the step before :(",
      );
    }
    this.executing = true;
    try {
      return await wallet.sendPayment(token, address, amount, note);
    } finally {
      this.executing = false;
    }
  }
}

export const SendPaymentStoreContext = React.createContext(
  new SendPaymentStore(),
);
