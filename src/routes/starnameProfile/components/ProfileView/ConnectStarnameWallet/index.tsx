import "./style.scss";

import { Grow } from "@mui/material";
import React from "react";
import { SignInMethodItem } from "routes/login/components/signInMethodItem";
import methods from "routes/login/methods";
import { google } from "routes/login/methods/google";
import { Wallet } from "signers/wallet";

interface Props {
  ready: boolean;
  show: boolean;
  onSuccess: (wallet: Wallet) => void;
}

const ConnectStarnameWallet = (props: Props): React.ReactElement => {
  return (
    <Grow in={props.show} unmountOnExit>
      {/* dont try to use Block component here */}
      {/* div is used here on purpose, as transition doesnt work properly with custom components */}
      <div className="wallet-signers-container">
        {methods.map((method) => (
          <div key={`wallet-signer-${method.key}`} className="wallet-signer">
            <SignInMethodItem
              {...method}
              key={method.key}
              ready={method === google ? props.ready : true}
              onSignIn={props.onSuccess}
              inheritedKey={method.key}
            />
          </div>
        ))}
      </div>
    </Grow>
  );
};

export default ConnectStarnameWallet;
