import { AminoSignResponse } from "@cosmjs/amino";
import {
  AccountData,
  DirectSignResponse,
  OfflineSigner,
} from "@cosmjs/proto-signing";
import { Signer } from "signers/signer";
import { SignerType } from "signers/signerType";
import { AddressGroup } from "types/addressGroup";

export class DummySigner implements Signer {
  readonly type: SignerType = SignerType.Generic;

  public getAddress(): Promise<string> {
    return Promise.resolve("");
  }

  public getAddressGroup(): Promise<AddressGroup> {
    return Promise.resolve({});
  }

  public getPublicKey(): Promise<string> {
    return Promise.resolve("");
  }

  public initialize(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public getAccounts(): Promise<readonly AccountData[]> {
    return Promise.resolve([]);
  }

  public signDirect(): Promise<DirectSignResponse> {
    return Promise.resolve({} as DirectSignResponse);
  }

  public signAlephMessage(): Promise<AminoSignResponse> {
    return Promise.resolve({} as AminoSignResponse);
  }

  public getOfflineSigner(): OfflineSigner {
    return {} as OfflineSigner;
  }
}
