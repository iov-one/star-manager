import { WalletConnectAddressItem } from "utils/walletConnect/walletConnectAddressItem";

export abstract class WalletConnectAddressReader {
  public abstract readAddresses(
    accounts: string[],
  ): ReadonlyArray<WalletConnectAddressItem>;
}
