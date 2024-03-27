import { useWallet } from "contexts/walletContext";
import React from "react";
import { Redirect, Route } from "react-router";
import Manage2fa from "routes/2fa";
import Balance from "routes/balance/index";
import BuyTokens from "routes/buyToken";
import {
  BALANCES_ROUTE,
  BUY_TOKENS_ROUTE,
  MANAGE_2FA_ROUTE,
  RECEIVE_PAYMENT_ROUTE,
  SEND_PAYMENT_ROUTE,
  STAKING_ROUTE,
  TRANSACTIONS_ROUTE,
} from "routes/paths";
import Payment from "routes/payment";
import ReceivePayment from "routes/receive";
import Validators from "routes/staking";
import Transactions from "routes/transactions";
import { SignerType } from "signers/signerType";

export const WalletRoutes: React.FC = (): React.ReactElement => {
  const wallet = useWallet();
  return (
    <>
      <Route exact path={BALANCES_ROUTE} component={Balance} />
      <Route exact path={TRANSACTIONS_ROUTE} component={Transactions} />
      <Route exact path={SEND_PAYMENT_ROUTE} component={Payment} />
      <Route exact path={RECEIVE_PAYMENT_ROUTE} component={ReceivePayment} />
      <Route exact path={BUY_TOKENS_ROUTE} component={BuyTokens} />
      <Route exact path={STAKING_ROUTE} component={Validators} />
      {wallet.getSignerType() === SignerType.Google && (
        <Route exact path={MANAGE_2FA_ROUTE} component={Manage2fa} />
      )}
      <Redirect to={BALANCES_ROUTE} />
    </>
  );
};
