import PageMenu from "components/PageMenu";
import WalletContext from "contexts/walletContext";
import React from "react";
import { Redirect } from "react-router";
import { Wallet } from "signers/wallet";

interface Props {
  readonly wallet: Wallet | null;
}

const RequireLogin: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  wallet,
}: React.PropsWithChildren<Props>): React.ReactElement => {
  if (wallet !== null) {
    return (
      <WalletContext.Provider value={wallet}>
        <PageMenu>{children}</PageMenu>
      </WalletContext.Provider>
    );
  }
  return <Redirect to={"/"} />;
};

export default RequireLogin;
