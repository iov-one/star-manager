import { StdSignature, StdSignDoc } from "@cosmjs/amino";
import { Account, Message } from "aleph-js";
import { Wallet } from "signers/wallet";

export class AlephSigner {
  private wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  public signMessage = async (
    account: Account,
    message: Message,
    signDoc: StdSignDoc,
  ): Promise<string> => {
    const { wallet } = this;
    const stdSignature: StdSignature = await wallet.signAlephMessage(signDoc);

    return JSON.stringify({
      ...stdSignature,
      account_number: signDoc.account_number,
      sequence: signDoc.sequence,
    });
  };
}
