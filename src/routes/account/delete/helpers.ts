import { Wallet } from "signers/wallet";
import { dummyItem, NameItem } from "types/nameItem";
import { NameType } from "types/nameType";
import { PostTxResult } from "types/postTxResult";

const deleteHelper = async (
  wallet: Wallet,
  item: NameItem,
): Promise<PostTxResult> => {
  if (item.type === NameType.Domain) {
    return wallet.deleteDomain(item.domain);
  } else if (item.type === NameType.Account) {
    return wallet.deleteAccount(item.name, item.domain);
  } else {
    throw new Error(
      "invalid account operation, cannot determine if this is an account or a domain",
    );
  }
};

export const deleteFn = async (
  wallet: Wallet,
  item: NameItem,
): Promise<PostTxResult> => {
  const result = await deleteHelper(wallet, item);
  // Ensure the starname is removed from it's place
  return result;
};

export const simulateFn = (wallet: Wallet): Promise<PostTxResult> =>
  deleteHelper(wallet, dummyItem);
