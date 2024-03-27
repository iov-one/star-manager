import { WalletConnectAddressReader } from "utils/walletConnect/abstractAddressReader";
import { WalletConnectAddressItem } from "utils/walletConnect/walletConnectAddressItem";

export class StarnameWalletConnectAddressReader extends WalletConnectAddressReader {
  public readAddresses(
    accounts: string[],
  ): ReadonlyArray<WalletConnectAddressItem> {
    if (accounts.length === 0) {
      throw new Error("there is no usable payload");
    }
    return JSON.parse(accounts[0]).addresses;
  }

  public static isStarnamePayload(payload: string): boolean {
    try {
      const parsed: any = JSON.parse(payload);
      // Check that it's the starname payload
      return "type" in parsed && parsed.type === "starname";
    } catch {
      return false;
    }
  }
}
