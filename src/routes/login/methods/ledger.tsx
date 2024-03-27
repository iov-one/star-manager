import ledgerOffIcon from "assets/ledger-off.svg";
import ledgerOnIcon from "assets/ledger-on.svg";
import LedgerBillboardMessage from "components/BillboardMessage/ledger";
import modal from "components/modal";
import locales from "locales/strings";
import React from "react";
import { Ledger } from "signers/ledger";
import { Wallet } from "signers/wallet";
import { SignInMethod } from "types/signInMethod";

const supportsWebUSB = "USB" in window;
const webUSBError = "Your browser is incompatible with WebUSB";

const signIn = async (): Promise<Wallet | null> => {
  if (!supportsWebUSB) {
    throw new Error(webUSBError);
  }
  const ledger = new Ledger();
  const closeModal = modal.show(
    <LedgerBillboardMessage text={ledger.authorizeGetIdentitiesMessage} />,
  );
  try {
    if (await ledger.initialize()) {
      return new Wallet(ledger);
    } else {
      return null;
    }
  } catch (error: any) {
    if ("name" in error) {
      if (error.name === "TransportOpenUserCancelled") {
        return null;
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  } finally {
    closeModal();
  }
};

export const ledger: SignInMethod = {
  label: locales.LOGIN_WITH_LEDGER,
  icons: {
    on: ledgerOnIcon,
    off: ledgerOffIcon,
  },
  isAvailable: (): boolean => "USB" in window,
  isMobileAllowed: (): boolean => false,
  signIn: signIn,
  key: "ledger",
};
