import { action } from "mobx";
import { AddressResolver } from "mobx/stores/addressResolver";
import React from "react";
import { Wallet } from "signers/wallet";
import { isDomain } from "types/domain";
import { NameItem } from "types/nameItem";
import { NameType } from "types/nameType";
import { PostTxResult } from "types/postTxResult";

export class TransferAccountStore extends AddressResolver {
  @action.bound
  public async transfer(
    item: NameItem,
    wallet: Wallet,
    flag?: 0 | 1 | 2,
  ): Promise<PostTxResult> {
    this.executing = true;
    const value = item.getValue();
    try {
      if (item.type === NameType.Domain) {
        if (isDomain(value)) {
          return wallet.transferDomain(
            value.name,
            this.address,
            value.type === "closed" ? flag : 2,
          );
        } else {
          const { domain } = value;
          return wallet.transferDomain(
            domain.name,
            this.address,
            domain.type === "closed" ? flag : 2,
          );
        }
      } else if (item.type === NameType.Account) {
        if (isDomain(value)) {
          return wallet.transferAccount(
            "",
            value.name,
            this.address,
            flag !== undefined ? Boolean(flag) : true,
          );
        } else {
          return wallet.transferAccount(
            value.name,
            value.domain.name,
            this.address,
            flag !== undefined ? Boolean(flag) : true,
          );
        }
      } else {
        throw new Error("unknown operation for unknown type of account");
      }
    } finally {
      this.executing = false;
    }
  }
}

export const TransferAccountStoreContext =
  React.createContext<TransferAccountStore>(new TransferAccountStore());
