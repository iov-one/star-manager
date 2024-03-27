import starOn from "assets/starnameProfile/Icons/starname-new.png";
import starOff from "assets/starnameProfile/Icons/starname-new-off.png";
import modal from "components/modal";
import locales from "locales/strings";
import React from "react";
import { SeedPhraseModal } from "routes/login/components/seedPhraseModal";
import { SeedPhraseSigner } from "signers/seedPhrase";
import { Wallet } from "signers/wallet";
import { SignInMethod } from "types/signInMethod";

export const seedPhrase: SignInMethod = {
  label: locales.LOGIN_WITH_SEED_PHRASE,
  icons: {
    on: starOn,
    off: starOff,
  },
  isAvailable: (): boolean => true,
  isMobileAllowed: (): boolean => true,
  signIn: async (): Promise<Wallet | null> => {
    return new Promise((resolve: (wallet: Wallet | null) => void): void => {
      const onCancel = (): void => closeModal();
      const signIn = (phrase: string): void => {
        const signer = new SeedPhraseSigner();
        signer
          .initialize(phrase)
          .then((): void => resolve(new Wallet(signer)))
          .finally(closeModal);
      };
      const closeModal = modal.show(
        <SeedPhraseModal onSignIn={signIn} onCancel={onCancel} />,
      );
    });
  },
  key: "seed-phrase",
};
