import { SinglePubkey } from "@cosmjs/amino";

export interface StargateAccount {
  readonly address: string;
  readonly pubkey: SinglePubkey;
  readonly accountNumber: string;
  readonly sequence: string;
}

export interface StargateAccountResponse {
  readonly account: {
    readonly type: string;
    readonly address: string;
    readonly pub_key: SinglePubkey;
    readonly account_number: string;
    readonly sequence: string;
  };
}
