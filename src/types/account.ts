import { SinglePubkey } from "@cosmjs/amino";
import { Amount } from "types/amount";

export interface Account {
  readonly address: string;
  readonly balance: ReadonlyArray<Amount>;
  readonly pubkey: SinglePubkey | undefined;
  readonly accountNumber: string;
  readonly sequence: string;
  readonly owner: string;
}

export interface AccountResponse {
  readonly height: number;
  readonly result: {
    readonly type: string;
    readonly value: {
      readonly address: string;
      readonly balance: ReadonlyArray<Amount>;
      readonly pubkey: SinglePubkey | undefined;
      readonly account_number: string;
      readonly sequence: string;
      readonly owner: string;
    };
  };
}
