import { Wallet } from "signers/wallet";
import { dummyItem, NameItem } from "types/nameItem";
import { NameType } from "types/nameType";
import { PostTxResult } from "types/postTxResult";

const renewHelper = (wallet: Wallet, item: NameItem): Promise<PostTxResult> => {
  if (item.type === NameType.Domain) {
    return wallet.renewDomain(item.domain);
  } else if (item.type === NameType.Account) {
    if (item.name === undefined) {
      throw new Error("cannot renew an account with undefined name");
    } else {
      return wallet.renewAccount(item.name, item.domain);
    }
  } else {
    throw new Error(
      "invalid account operation, cannot determine if this is an account or a domain",
    );
  }
};

export const renewFn = async (
  wallet: Wallet,
  item: NameItem,
): Promise<PostTxResult> => {
  return renewHelper(wallet, item);
};

export const simulateFn = async (wallet: Wallet): Promise<PostTxResult> => {
  return renewHelper(wallet, dummyItem);
};
