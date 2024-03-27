import { Coin } from "@cosmjs/stargate";
import { Asset } from "@iov/asset-directory";
import { CertifierV1 } from "@iov/certificate-parser";

import local from "./local.json";

interface GasMap {
  readonly "/starnamed.x.starname.v1beta1.MsgRenewDomain": number;
  readonly "/starnamed.x.starname.v1beta1.MsgReplaceAccountResources": number;
  readonly "/starnamed.x.starname.v1beta1.MsgTransferDomain": number;
  readonly "/cosmos.bank.v1beta1.MsgSend": number;
  readonly "/cosmos.staking.v1beta1.MsgBeginRedelegate": number;
  readonly default: number;
}

export interface TokenLike {
  ticker: string;
  subunitsPerUnit: number;
  subunitName: string;
}

export interface ApplicationAsset extends Asset {
  denom: string;
}

export interface AlephConfig {
  readonly apiServer: string;
  readonly channel: string;
}

export interface PinataConfig {
  readonly apiKey: string;
  readonly secretKey: string;
}

export interface WalletConnectConfig {
  bridge: string;
  clientMeta: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface KeplrConfig {
  readonly gasPriceStep: {
    readonly low: number;
    readonly average: number;
    readonly high: number;
  };
}

export interface InstagramConfig {
  readonly requestUrl: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scope: string;
  readonly responseType: string;
}

export interface RestConfig {
  apiUrl: string;
  rpcUrl: string;
  faucetUrl: string;
}

export interface DomainAssetAssociation {
  domain: string;
  symbol: string | null;
}

export interface BasicEditionDomains {
  readonly starname: ReadonlyArray<string>;
  readonly community: ReadonlyArray<DomainAssetAssociation>;
}

type Certifier = Partial<CertifierV1> &
  Required<Pick<CertifierV1, "id" | "public_key">>;

export interface Config {
  readonly websiteName: string;
  readonly apiUrl: string;
  readonly rpcUrl: string;
  readonly starnameProfileBaseUrl: string;
  readonly blockExplorerUrl: string;
  readonly mainAsset: ApplicationAsset;
  readonly tokens: { [key: string]: TokenLike };
  readonly gasPrice: Coin;
  readonly gasMap: GasMap;
  readonly broker?: string;
  readonly walletConnect: WalletConnectConfig;
  readonly alephConfig: AlephConfig;
  readonly pinataConfig: PinataConfig;
  readonly keplrConfig: KeplrConfig;
  readonly basicEditionDomains: BasicEditionDomains;
  readonly swapSmartContractAddress: string;
  readonly ethChainId: number;
  readonly etherscanAPIKey: string;
  readonly etherscanAPIUrl: string;
  readonly twitterVerifierUrl: string;
  readonly googleSignInNotifyUrl: string;
  readonly googleOAuthClientId: string;
  readonly freeStarnameApiUrl: string;
  readonly sendConfirmationUrl: string;
  readonly captureEventsUrl: string;
  readonly twoFactorAuthUrls: {
    check: string;
    register: string;
    verify: string;
    validate: string;
    remove: string;
  };
  readonly scoreChainApiUrl: string;
  readonly gdriveMnemonicLength: number;
  readonly instagramConfig: InstagramConfig;
  readonly validatorsImageLookupApiUrl: string;
  readonly faucetUrl: string;
  readonly managerUrl: string;
  readonly autoChains: ReadonlyArray<string>;
  readonly turstedCertifiers: ReadonlyArray<Certifier>;
  readonly certifierAppUrl: string;
}

export default ((): Config => {
  const { REACT_APP_ENV } = process.env;
  switch (REACT_APP_ENV) {
    case "local":
      return local;
    default:
      return local;
  }
})();
