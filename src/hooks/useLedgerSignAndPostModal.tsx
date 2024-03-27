import LedgerBillboardMessage from "components/BillboardMessage/ledger";
import modal from "components/modal";
import locales from "locales/strings";
import React from "react";
import { Signer } from "signers/signer";
import { SignerType } from "signers/signerType";

export const useLedgerSignAndPostModal = (signer: Signer | null): void => {
  const [visible, setVisible] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (signer === null) return;
    if (signer.type !== SignerType.Ledger) return;
    if (!visible) return;
    return modal.show(
      <LedgerBillboardMessage text={locales.SIGN_TRANSACTION_LEDGER_DEVICE} />,
    );
  }, [visible, signer]);
  React.useEffect(() => {
    const onFinished = (): void => {
      setVisible(false);
    };
    const onStarted = (): void => {
      setVisible(true);
    };
    document.addEventListener("ledger-sign-started", onStarted);
    document.addEventListener("ledger-sign-finished", onFinished);
    return () => {
      document.removeEventListener("ledger-sign-started", onStarted);
      document.removeEventListener("ledger-sign-finished", onFinished);
    };
  }, []);
};
