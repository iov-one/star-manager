import strings from "locales/strings";
import { TransferAccountStore } from "mobx/stores/transferStore";
import { Wallet } from "signers/wallet";
import { NameItem } from "types/nameItem";
import { PostTxResult } from "types/postTxResult";

export const DomainTransferFlagOptions = [
  {
    value: 0,
    label: strings.TRANSFER_FLAG_0,
  },
  {
    value: 1,
    label: strings.TRANSFER_FLAG_1,
  },
  {
    value: 2,
    label: strings.TRANSFER_FLAG_2,
  },
];

export const AccountTransferFlagOptions = [
  {
    value: 0,
    label: strings.NO,
  },
  {
    value: 1,
    label: strings.YES,
  },
];

export const transferFn =
  (store: TransferAccountStore, flag: 0 | 1 | 2) =>
  async (wallet: Wallet, item: NameItem): Promise<PostTxResult> => {
    const result = await store.transfer(item, wallet, flag);
    return result;
  };

export const simulateFn = (wallet: Wallet): Promise<PostTxResult> => {
  return wallet.transferDomain("", "");
};
