import "./style.scss";

import { Button, CircularProgress } from "@material-ui/core";
import { LoadingButton } from "@mui/lab";
import api from "api";
import toast, { ToastType } from "components/toast";
import TransactionDetails from "components/TransactionDetails";
import { TxResultToastContent } from "components/txResultToastContent";
import config from "config";
import { useFeeEstimator } from "hooks/useFeeEstimator";
import {
  TxHandlerStatus,
  useTxPromiseHandler,
} from "hooks/useTxPromiseHandler";
import strings from "locales/strings";
import React from "react";
import { GDriveCustodianContext } from "signers/gdrive/context";
import { GoogleSigner } from "signers/google";
import { Ledger } from "signers/ledger";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { Escrow } from "types/escrow";
import { handleTxError } from "utils/handleTxError";

import { getSimpleConversionPrice } from "../coinGeckoConversion";
import ConnectStarnameWallet from "../ConnectStarnameWallet";
import { simulateFn } from "./helpers";

interface Props {
  starname: string;
  escrow: Escrow;
}

const StarnameSaleView = (props: Props): React.ReactElement => {
  const { escrow, starname } = props;

  const apiFees = api.getFees();

  const [ready, setReady] = React.useState<boolean>(false);
  const [conversionLoading, setConversionLoading] =
    React.useState<boolean>(false);
  const [iovToUsdPrice, setIovToUsdPrice] = React.useState<number>(-1);
  const [showConnectWallet, setShowConnectWallet] =
    React.useState<boolean>(false);
  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const [bought, setBought] = React.useState<boolean>(false);

  const [handler, txStatus] = useTxPromiseHandler();
  const custodian = React.useContext(GDriveCustodianContext);
  const fee = useFeeEstimator(simulateFn);

  const amount = Amount.from(Math.ceil(parseFloat(escrow.price[0].amount)));

  React.useEffect((): (() => void) => {
    custodian
      .attach()
      .then(() => {
        setReady(true);
      })
      .catch((why: any): void => {
        console.warn(why);
      });
    return (): void => custodian.detach();
  }, [custodian]);

  React.useEffect(() => {
    const task = getSimpleConversionPrice("starname");
    setConversionLoading(true);
    task
      .execute()
      .then((conversionResult) => {
        if ("starname" in conversionResult) {
          if ("usd" in conversionResult.starname) {
            setIovToUsdPrice(conversionResult.starname.usd);
          }
        }
      })
      .finally(() => setConversionLoading(false));

    return () => task.abort();
  }, []);

  const walletSetter = (wallet: Wallet): void => {
    setWallet(wallet);
    setShowConnectWallet(false);
  };

  const handleDisconnect = (): void => {
    if (!wallet) return;
    if (wallet.getSignerType() === SignerType.Google) {
      const signer: GoogleSigner = custodian.getSigner();
      signer
        .signOut()
        .then((): void => {
          setWallet(null);
        })
        .catch(console.error);
    } else if (wallet.getSignerType() === SignerType.Ledger) {
      const ledger = wallet.signer as Ledger;
      ledger.disconnect();
      setWallet(null);
    } else {
      setWallet(null);
    }
  };

  const handleTransferToEscrow = (): void => {
    if (wallet === null) {
      toast.show("wallet not initialized", ToastType.Error);
      return;
    }
    handler(wallet.transferToEscrow(escrow.id, amount))
      .then((txId) => {
        setBought(true);
        toast.show(
          <TxResultToastContent
            txId={txId}
            text={`${strings.TRADE_SUCCESSFUL} ${starname}`}
          />,
          ToastType.Success,
        );
        setTimeout(() => {
          window.location.replace(config.managerUrl);
        }, 4000);
      })
      .catch(handleTxError);
  };

  return (
    <div className="starname-sale-container">
      {bought ? (
        <div className="starname-bought-note-container">
          <CircularProgress color="secondary" size={40} />
          <span>{strings.REDIRECTING_TO_MANAGER}</span>
        </div>
      ) : (
        <div>
          <div className="heading-container">
            <div className="starname-container">
              <span>{starname}</span>
            </div>
            <h4>is for sale!</h4>
          </div>
          <div className="escrow-price-container">
            <h1>{amount.format(true)}</h1>
            <h6>
              {conversionLoading
                ? "..."
                : iovToUsdPrice < 0
                ? ""
                : `≈ ${(iovToUsdPrice * amount.getFractionalValue()).toFixed(
                    2,
                  )} $`}
            </h6>
          </div>
          <TransactionDetails
            amount={amount}
            fee={{
              amount: Amount.from(
                apiFees.transferToEscrow / apiFees.feeCoinPrice,
              )
                .toCoins()
                .concat(fee.amount),
              gas: fee.gas,
            }}
            disabled={false}
          />
          {wallet === null ? (
            <div className="wallet-actions-container">
              <Button
                variant={"outlined"}
                color={"primary"}
                onClick={() => setShowConnectWallet(!showConnectWallet)}
              >
                {showConnectWallet ? strings.CANCEL : strings.CONNECT_WALLET}
              </Button>
            </div>
          ) : (
            <div className="wallet-actions-container">
              <LoadingButton
                loadingPosition={"center"}
                loading={txStatus === TxHandlerStatus.Handling}
                variant={"contained"}
                color={"primary"}
                onClick={handleTransferToEscrow}
              >
                {strings.BUY_STARNAME}
              </LoadingButton>
              <Button onClick={handleDisconnect}>{strings.DISCONNECT}</Button>
            </div>
          )}
          <ConnectStarnameWallet
            show={showConnectWallet}
            ready={ready}
            onSuccess={walletSetter}
          />
        </div>
      )}
    </div>
  );
};

export default StarnameSaleView;
