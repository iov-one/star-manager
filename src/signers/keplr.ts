import {
  Algo,
  AminoSignResponse,
  SinglePubkey,
  StdSignDoc,
} from "@cosmjs/amino";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { AccountData, OfflineSigner } from "@cosmjs/proto-signing";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Keplr, Key } from "@keplr-wallet/types";
import api from "api";
import config, { ApplicationAsset } from "config";
import { MismatchedAddressError, Signer } from "signers/signer";
import { SignerType } from "signers/signerType";
import { AddressGroup } from "types/addressGroup";
import { WalletChainConfig } from "types/walletChains";

export class KeplrSigner implements Signer {
  public readonly type: SignerType = SignerType.Keplr;
  private publicKey: SinglePubkey | null = null;
  private address: string | null = null;
  private keplr: Keplr | null = null;
  private offlineSigner: OfflineSigner | null = null;

  public async getPublicKey(): Promise<string> {
    const { publicKey } = this;
    if (publicKey === null) return "";
    return publicKey.value;
  }

  public async getAddress(): Promise<string> {
    const { address } = this;
    if (address === null) return "";
    return address;
  }

  public async getAddressGroup(
    chains: ReadonlyArray<WalletChainConfig>,
  ): Promise<AddressGroup> {
    const { keplr } = this;
    // enable these chains first
    if (keplr === null) throw new Error("Keplr extension not initialized");
    // get all experimental chains first
    const experimentalChains = chains.reduce((accArr, chain) => {
      if (!chain.native) accArr.push(chain);
      return accArr;
    }, Array<WalletChainConfig>());

    // first only support native chain IDs
    // further we will add to this array when user allows permissions for beta support chain
    const readableChainIds = chains
      .filter((_chain) => !experimentalChains.includes(_chain))
      .map((chain) => chain.chainInfo.chainId);
    // use keplr's experimentalSuggestChain for these chains
    for (const { chainInfo } of experimentalChains) {
      try {
        // wait for user to approve the permission
        await keplr.experimentalSuggestChain(chainInfo);
        // now push to readableChainIds
        readableChainIds.push(chainInfo.chainId);
      } catch (e) {
        console.error(e);
      }
    }
    // now we are sure that keplr will surely provide data related to these readableChainIds
    try {
      await keplr.enable(readableChainIds);
      const resolvedAddressData = await Promise.all(
        readableChainIds.map(async (chainId) => {
          const { bech32Address, algo, pubKey } = await keplr.getKey(chainId);
          return [
            { address: bech32Address, algo: algo as Algo, pubkey: pubKey },
          ];
        }),
      );
      return readableChainIds.reduce((addressGroup, chainId, idx) => {
        return { ...addressGroup, [chainId]: resolvedAddressData[idx] };
      }, {});
    } catch (error) {
      console.warn(error);
      throw new Error("Request for chain permissions rejected");
    }
  }

  private static getKeplr(): Promise<Keplr> {
    if (window.keplr !== undefined) {
      return window.keplr;
    }
    return new Promise<Keplr>((resolve: (keplr: Keplr) => void): void => {
      const timer = setInterval((): void => {
        if (window.keplr !== undefined) {
          resolve(window.keplr);
          clearInterval(timer);
        }
      }, 400);
    });
  }

  public async initialize(): Promise<boolean> {
    const keplr = await KeplrSigner.getKeplr();
    const chainId: string = api.getChainId();
    const defaultAsset: ApplicationAsset = config.mainAsset;
    const coin = {
      coinDenom: defaultAsset.symbol,
      coinMinimalDenom: defaultAsset.denom,
      coinDecimals: 6,
    };
    const bech32Config = Bech32Address.defaultBech32Config("star");
    const { keplrConfig } = config;
    await keplr.experimentalSuggestChain({
      chainId: chainId,
      chainName: chainId,
      rpc: config.rpcUrl,
      rest: config.apiUrl,
      stakeCurrency: {
        ...coin,
        coinDenom: "stake",
        coinMinimalDenom: "ustake",
      },
      bip44: {
        coinType: 234,
      },
      bech32Config: bech32Config,
      currencies: [coin],
      feeCurrencies: [
        {
          ...coin,
          gasPriceStep: keplrConfig.gasPriceStep,
        },
      ],
      coinType: 234,
    });
    // Now that we suggested the chain let's initialize it
    await keplr.enable(chainId);
    // Create the wallet
    // Extract accounts
    const key: Key = await keplr.getKey(chainId);
    // Export the exportable stuff
    this.publicKey = encodeSecp256k1Pubkey(key.pubKey);
    this.address = key.bech32Address;
    this.keplr = keplr;
    this.offlineSigner = await keplr.getOfflineSignerAuto(chainId);

    return true;
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        address: await this.getAddress(),
        algo: "secp256k1",
        pubkey: fromBase64(await this.getPublicKey()),
      },
    ];
  }

  public async signAlephMessage(
    signerAddress: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse> {
    const { address, keplr } = this;
    const alephChainId = signDoc.chain_id;
    if (address !== signerAddress) {
      throw MismatchedAddressError;
    } else if (keplr === null) {
      throw new Error("keplr extension not initialized correctly");
    }
    const defaultAsset: ApplicationAsset = config.mainAsset;
    const coin = {
      coinDenom: defaultAsset.symbol,
      coinMinimalDenom: defaultAsset.denom,
      coinDecimals: 6,
    };
    // this is just a mock chain for IOV chain itself
    // just to bypass keplr's restriction of having chainId same for signDoc msg, signature request
    await keplr.experimentalSuggestChain({
      chainId: alephChainId,
      chainName: "starname-aleph-store",
      rpc: config.rpcUrl,
      rest: config.apiUrl,
      stakeCurrency: {
        ...coin,
        coinDenom: "stake",
        coinMinimalDenom: "ustake",
      },
      bip44: {
        coinType: 234,
      },
      bech32Config: Bech32Address.defaultBech32Config("star"),
      currencies: [coin],
      feeCurrencies: [coin],
      coinType: 234,
    });
    // need to stay this way else tx will fail (in background on aleph)
    // https://github.com/aleph-im/aleph-js/issues/48#issuecomment-1206404831
    return keplr.signAmino(alephChainId, signerAddress, signDoc, {
      preferNoSetFee: true,
      preferNoSetMemo: true,
      disableBalanceCheck: true,
    });
  }

  public getOfflineSigner(): OfflineSigner {
    const { offlineSigner } = this;
    if (offlineSigner === null) {
      throw new Error("offline signer not initialized");
    }

    return offlineSigner;
  }
}
