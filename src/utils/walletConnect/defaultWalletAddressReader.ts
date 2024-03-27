import { WalletConnectAddressReader } from "utils/walletConnect/abstractAddressReader";

import { WalletConnectAddressItem } from "./walletConnectAddressItem";

export class DefaultWalletConnectAddressReader extends WalletConnectAddressReader {
  public readAddresses(
    accounts: string[],
  ): ReadonlyArray<WalletConnectAddressItem> {
    return [{ ticker: "ETH", address: accounts[0], uri: "asset:eth" }];
  }
}
