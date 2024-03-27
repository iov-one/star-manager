import {
  AminoSignResponse,
  Secp256k1HdWallet,
  StdSignDoc,
} from "@cosmjs/amino";
import { stringToPath } from "@cosmjs/crypto";
import {
  AccountData,
  DirectSecp256k1HdWallet,
  DirectSecp256k1HdWalletOptions,
  DirectSignResponse,
  OfflineSigner,
} from "@cosmjs/proto-signing";
import { hdPath } from "constants/hdPath";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { MismatchedAddressError, Signer } from "signers/signer";
import { SignerType } from "signers/signerType";
import { AddressGroup } from "types/addressGroup";
import { WalletChainConfig } from "types/walletChains";

export class SeedPhraseSigner implements Signer {
  readonly type = SignerType.SeedPhrase;
  private directSigner: DirectSecp256k1HdWallet | null = null;
  private aminoSigner: Secp256k1HdWallet | null = null;
  private phrase: string | null = null;

  public async getAddress(): Promise<string> {
    const { directSigner } = this;
    if (directSigner == null) {
      throw new Error("not initialized");
    }
    const accounts = await directSigner.getAccounts();
    if (accounts.length < 1) {
      throw new Error("cannot read signer accounts");
    }
    return accounts[0].address;
  }

  public async getExtraAccounts(
    options: Partial<DirectSecp256k1HdWalletOptions>,
  ): Promise<ReadonlyArray<AccountData>> {
    const { phrase } = this;
    if (phrase === null) {
      throw new Error("signer not initialized");
    }
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(phrase, options);

    return wallet.getAccounts();
  }

  public async getAddressGroup(
    chains: ReadonlyArray<WalletChainConfig>,
  ): Promise<AddressGroup> {
    const chainIds = chains.map(({ chainInfo }) => chainInfo.chainId);

    const resolvedAddressData = await Promise.all(
      chains.map(({ chainInfo }) => {
        return this.getExtraAccounts({
          prefix: chainInfo.bech32Config.bech32PrefixAccAddr,
          hdPaths: [`m/44'/${chainInfo.bip44.coinType}'/0'/0/0`].map(
            stringToPath,
          ),
        });
      }),
    );

    return chainIds.reduce((addressGroup, chainId, idx) => {
      return { ...addressGroup, [chainId]: resolvedAddressData[idx] };
    }, {});
  }

  public async getPublicKey(): Promise<string> {
    const { directSigner } = this;
    if (directSigner == null) {
      throw new Error("not initialized");
    }
    const accounts = await directSigner.getAccounts();
    if (accounts.length < 1) {
      throw new Error("cannot read signer accounts");
    }
    const pubKey = accounts[0].pubkey;
    return Buffer.from(pubKey).toString("base64");
  }

  public async initialize(phrase: string): Promise<boolean> {
    this.phrase = phrase;
    this.directSigner = await DirectSecp256k1HdWallet.fromMnemonic(phrase, {
      hdPaths: [hdPath],
      prefix: "star",
    });
    this.aminoSigner = await Secp256k1HdWallet.fromMnemonic(phrase, {
      hdPaths: [hdPath],
      prefix: "star",
    });
    return true;
  }

  public async signDirect(
    signerAddress: string,
    signDoc: SignDoc,
  ): Promise<DirectSignResponse> {
    const { directSigner } = this;
    if (directSigner == null) {
      throw new Error("not initialized");
    }
    const address: string = await this.getAddress();
    if (signerAddress !== address) {
      throw MismatchedAddressError;
    }
    return directSigner.signDirect(address, signDoc);
  }

  public getAccounts(): Promise<readonly AccountData[]> {
    const { directSigner } = this;
    if (directSigner == null) {
      throw new Error("not initialized");
    }
    return directSigner.getAccounts();
  }

  public signAlephMessage(
    address: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse> {
    const { aminoSigner } = this;
    if (aminoSigner === null) {
      throw new Error("not initialized");
    }
    return aminoSigner.signAmino(address, signDoc);
  }

  public getOfflineSigner(): OfflineSigner {
    return this;
  }
}
