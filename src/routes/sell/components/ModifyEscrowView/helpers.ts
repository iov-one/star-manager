import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { PostTxResult } from "types/postTxResult";

export const simulateUpdateFn = (wallet: Wallet): Promise<PostTxResult> =>
  wallet.updateEscrow("", Amount.fromValue(0), new Date(), "");

export const simulateDeleteFn = (wallet: Wallet): Promise<PostTxResult> =>
  wallet.deleteEscrow("");
