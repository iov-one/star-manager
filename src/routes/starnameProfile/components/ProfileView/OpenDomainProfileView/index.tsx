import "./style.scss";

import {
  Button,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
} from "@material-ui/core";
import { LoadingButton } from "@mui/lab";
import toast, { ToastType } from "components/toast";
import TransactionDetails from "components/TransactionDetails";
import { TxResultToastContent } from "components/txResultToastContent";
import { FormStatus } from "forms";
import useStarnameValidator from "hooks/useStarnameValidator";
import {
  TxHandlerStatus,
  useTxPromiseHandler,
} from "hooks/useTxPromiseHandler";
import strings from "locales/strings";
import React from "react";
import { getPrice } from "routes/starnames/components/RegisterForm/helpers";
import { GasEstimatorContext } from "signers/gasEstimator";
import { GDriveCustodianContext } from "signers/gdrive/context";
import { GoogleSigner } from "signers/google";
import { Ledger } from "signers/ledger";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { DomainInfo } from "types/domain";
import { NameType } from "types/nameType";
import { isFee, PostTxResult } from "types/postTxResult";
import { AccountInfo } from "types/profile";
import { handleTxError } from "utils/handleTxError";
import { ZERO_FEE } from "utils/zeroFee";

import Avatar from "../../Avatar";
import { AboutMeComponent } from "../AboutMe";
import ConnectStarnameWallet from "../ConnectStarnameWallet";
import NextSteps from "./NextSteps";

interface Props {
  domainData: DomainInfo;
  accountData: AccountInfo | null;
}

const OpenDomainProfileView = (props: Props): React.ReactElement => {
  const {
    domainData: { name: domainName },
    accountData,
  } = props;
  const [proxyValue, setProxyValue] = React.useState<string>("");
  const [value, setValue] = React.useState<string>("");
  const [registered, setRegistered] = React.useState<{
    completed: boolean;
    starname: string | null;
  }>({ completed: false, starname: null });
  const [ready, setReady] = React.useState<boolean>(false);
  const [fee, setFee] = React.useState(ZERO_FEE);

  const [showConnectWallet, setShowConnectWallet] =
    React.useState<boolean>(false);

  const [wallet, setWallet] = React.useState<Wallet | null>(null);
  const estimator = React.useContext<Wallet>(GasEstimatorContext);
  const [handler, txStatus] = useTxPromiseHandler();
  const { status, error } = useStarnameValidator(
    value,
    domainName,
    NameType.Account,
  );

  const custodian = React.useContext(GDriveCustodianContext);

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
    const timeout = setTimeout(() => {
      handleActualValueChange(proxyValue);
    }, 400);
    return () => clearTimeout(timeout);
  }, [proxyValue]);

  const createSubmitFn =
    (wallet: Wallet) => async (): Promise<PostTxResult> => {
      return wallet.registerAccount(value, domainName);
    };

  const emulate = createSubmitFn(estimator);

  const walletSetter = (wallet: Wallet): void => {
    setWallet(wallet);
    setShowConnectWallet(false);
  };

  const handleActualValueChange = (actualValue: string): void => {
    setValue(actualValue);
    emulate().then((actualValue) => {
      if (isFee(actualValue)) {
        setFee(actualValue);
      }
    });
  };

  const price: Amount | undefined = React.useMemo(
    (): Amount | undefined => getPrice(value, NameType.Account, false),
    [value],
  );

  const handleRegister = (): void => {
    if (wallet === null) {
      toast.show("wallet not initialized", ToastType.Error);
      return;
    }
    handler(wallet.registerAccount(value, domainName))
      .then((txId) => {
        setProxyValue("");
        setRegistered({
          completed: true,
          starname: `${value}*${domainName}`,
        });
        toast.show(
          <TxResultToastContent
            txId={txId}
            text={`${strings.CREATED_SUCCESSFULLY} ${value}*${domainName}`}
          />,
          ToastType.Success,
        );
      })
      .catch(handleTxError);
  };

  const onProxyValueChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setProxyValue(event.target.value.toLowerCase());
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

  const handleRegisterAgain = (): void => {
    setRegistered({
      completed: false,
      starname: null,
    });
  };

  return !registered.completed ? (
    <div className="register-account-container">
      <div className={"avatar"}>
        <Avatar image={accountData ? accountData.photo : null} />
      </div>
      <div className="register-account-under-open-heading-container">
        <div className="register-account-under-open-heading-title">
          {strings.REGISTER_A} *{domainName} {strings.ACCOUNT.toLowerCase()}
        </div>
      </div>
      <OutlinedInput
        placeholder={strings.PLACEHOLDER_NAME_NEWSTARNAME}
        fullWidth
        error={!!error}
        endAdornment={
          <InputAdornment position="end">*{domainName}</InputAdornment>
        }
        value={proxyValue}
        onChange={onProxyValueChange}
      />
      <FormHelperText error={status === FormStatus.Invalid}>
        {error ? error : ""}
      </FormHelperText>
      <TransactionDetails
        amount={price}
        fee={fee}
        disabled={status !== FormStatus.Valid}
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
            onClick={handleRegister}
            disabled={status !== FormStatus.Valid}
          >
            {strings.REGISTER_ACCOUNT}
          </LoadingButton>
          <Button onClick={handleDisconnect}>{strings.DISCONNECT}</Button>
        </div>
      )}
      <ConnectStarnameWallet
        show={showConnectWallet}
        ready={ready}
        onSuccess={walletSetter}
      />
      {accountData && <AboutMeComponent accountData={accountData} />}
    </div>
  ) : (
    <NextSteps
      onRegister={handleRegisterAgain}
      starname={registered.starname}
    />
  );
};

export default OpenDomainProfileView;
