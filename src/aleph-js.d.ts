import { EncodeObject } from "@cosmjs/proto-signing";
import { Signable } from "types/signable";

export interface MsgsAndMemo {
  readonly messages: ReadonlyArray<EncodeObject>;
  readonly memo: string;
}

export interface Account {
  name: string;
  type: string;
  address: string;
  source: "function";
  signer: Signer;
}

export type Signer = (
  account: Account,
  message: Message,
  signable: Signable,
) => Promise<string>;

export interface Options {
  readonly chain?: string;
  readonly channel?: string;
  readonly api_server?: string;
  readonly inline?: boolean;
  readonly storage_engine?: "storage" | "ipfs";
  account?: Account;
}

export type Message = {
  /* Intentionally opaque and just for type-checking */
};

export interface FromExternalSignerOptions {
  readonly public_key: string;
  readonly address: string;
  readonly name: string;
  readonly signer: Signer;
}

export interface StoreSubmitResultContent {
  address: string;
  item_type: string;
  item_hash: string;
  time: number;
}

export interface StoreSubmitResult {
  chain: string;
  channel: string;
  sender: string;
  type: string;
  time: number;
  item_type: string;
  item_content: string;
  item_hash: string;
  signature: string;
  content: StoreSubmitResultContent;
}

export interface StoreSubmitOptions {
  readonly fileobject: File;
  readonly account: Account;
  readonly channel: string;
  readonly api_server: string;
}

export interface ImportAccountOptions {
  readonly mnemonics: string;
  readonly path: string;
  readonly chain_id: string;
  readonly prefix: string;
}

declare namespace cosmos {
  export const from_external_signer: (
    options: FromExternalSignerOptions,
  ) => Promise<Account>;
  export const import_account: (
    options: ImportAccountOptions,
  ) => Promise<Account>;
}

export interface AggregateSubmitResult {
  chain: string;
  channel: string;
  item_content: string;
  item_hash: string;
  item_type: "inline";
  sender: string;
  signature: string;
  time: number;
  type: "AGGREGATE";
}

declare namespace store {
  export const submit: (
    address: string,
    options: StoreSubmitOptions,
  ) => Promise<StoreSubmitResult>;
}

declare namespace aggregates {
  export const submit: (
    address: string,
    key: string,
    content: { [key: string]: any },
    options: Options,
  ) => Promise<AggregateSubmitResult>;
  export const fetch_one: <T>(
    address: string,
    key: string,
    options?: { api_server: string },
  ) => Promise<T>;
}
