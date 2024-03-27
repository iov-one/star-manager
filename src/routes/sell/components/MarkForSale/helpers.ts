import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { NameItem } from "types/nameItem";
import { PostTxResult } from "types/postTxResult";

export const simulateFn = (wallet: Wallet): Promise<PostTxResult> => {
  return wallet.createEscrow(
    Amount.fromValue(0),
    new NameItem({
      kind: "domain",
      admin: "star1nrnx8mft8mks3l2akduxdjlf8rwqs8r9l36a78",
      name: "test",
      owner: "",
      type: "closed",
      broker: "",
      validUntil: 0,
    }),
    new Date(),
  );
};
