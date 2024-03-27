import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { PostTxResult } from "types/postTxResult";

export const simulateFn = (wallet: Wallet): Promise<PostTxResult> =>
  wallet.transferToEscrow("", Amount.fromValue(0));
