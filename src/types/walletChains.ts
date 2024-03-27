import { ChainInfo } from "@keplr-wallet/types";

export interface WalletChainConfig {
  native: boolean;
  txExplorer: string;
  chainInfo: ChainInfo;
}
