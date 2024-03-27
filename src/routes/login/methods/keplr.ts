import keplrOffIcon from "assets/keplr-off.svg";
import keplrOnIcon from "assets/keplr-on.svg";
import locales from "locales/strings";
import { KeplrSigner } from "signers/keplr";
import { Wallet } from "signers/wallet";
import { SignInMethod } from "types/signInMethod";

export const keplr: SignInMethod = {
  label: locales.LOGIN_WITH_KEPLR,
  icons: {
    on: keplrOnIcon,
    off: keplrOffIcon,
  },
  isAvailable: (): boolean => {
    return (
      "getOfflineSigner" in window &&
      "keplr" in window &&
      "experimentalSuggestChain" in window.keplr
    );
  },
  isMobileAllowed: (): boolean => false,
  signIn: async (): Promise<Wallet | null> => {
    const signer: KeplrSigner = new KeplrSigner();
    if (await signer.initialize()) {
      return new Wallet(signer);
    } else {
      return null;
    }
  },
  key: "keplr",
};
