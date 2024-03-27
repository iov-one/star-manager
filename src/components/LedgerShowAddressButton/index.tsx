import "./styles.scss";

import { Button } from "@material-ui/core";
import ledgerOnIcon from "assets/ledger-on.svg";
import LedgerBillboardMessage from "components/BillboardMessage/ledger";
import { Block } from "components/block";
import modal from "components/modal";
import { useWallet } from "contexts/walletContext";
import locales from "locales/strings";
import React from "react";
import { Ledger } from "signers/ledger";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";

export const LedgerShowAddressButton: React.FC =
  (): React.ReactElement | null => {
    const wallet: Wallet = useWallet();
    if (wallet.getSignerType() !== SignerType.Ledger) return null;
    const onClick = (): void => {
      const ledger: Ledger = new Ledger();
      const close = modal.show(
        <LedgerBillboardMessage text={ledger.viewAddressMessage} />,
      );
      ledger.initialize(true).finally(close);
    };
    return (
      <Block className={"ledger-show-address-button"}>
        <Button
          variant={"contained"}
          classes={{ contained: "ledger-show-address-button-contained" }}
          onClick={onClick}
          startIcon={<img src={ledgerOnIcon} alt={"ledger"} />}
        >
          {locales.LEDGER_SHOW_ADDRESS}
        </Button>
      </Block>
    );
  };
