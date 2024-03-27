import { ChainInfo } from "@keplr-wallet/types";
import { getAllSupportedChains, getChainSymbol } from "config/supportedChains";

export const cosmosTokens: {
  [name: string]: ChainInfo;
} = getAllSupportedChains().reduce((acc, chain) => {
  return { ...acc, [getChainSymbol(chain).toLowerCase()]: chain.chainInfo };
}, {});
