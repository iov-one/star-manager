import "./style.scss";

import {
  DialogTitle,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
} from "@material-ui/core";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  OutlinedInput,
} from "@material-ui/core";
import { CheckCircle, Close, Send } from "@material-ui/icons";
import { LoadingButton } from "@mui/lab";
import { AccAddress, Coins, Fee, MsgSend } from "@terra-money/terra.js";
import {
  ConnectType,
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  useConnectedWallet,
  useLCDClient,
  UserDenied,
  useWallet,
  WalletStatus,
} from "@terra-money/wallet-provider";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { isMobile } from "react-device-detect";

import TerraTxResult from "./TxResult";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly asset: string;
  readonly starname: string;
  readonly address: string;
  readonly amount: number;
}

const TerraModal = (props: Props): React.ReactElement => {
  const lcd = useLCDClient();
  const { availableInstallTypes, connect, disconnect, install } = useWallet();

  const connectedWallet = useConnectedWallet();
  const { address, amount, asset, onClose, open, starname } = props;

  const [loading, setLoading] = React.useState<boolean>(false);
  const [balance, setBalance] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string>("");
  const [txResult, setTxResult] = React.useState<TxResult | null>(null);
  const [txSuccess, setTxSuccess] = React.useState<boolean>(false);

  const assetDenom =
    asset.toUpperCase() === "UST" ? "uusd" : `u${asset.toLowerCase()}`;

  const terraStationNotInstalled = React.useMemo(() => {
    if (isMobile) return false;
    return (
      WalletStatus.WALLET_NOT_CONNECTED &&
      availableInstallTypes.includes(ConnectType.EXTENSION)
    );
  }, [availableInstallTypes]);

  React.useEffect(() => {
    if (!connectedWallet || !open) return;
    setLoading(true);
    lcd.bank
      .balance(connectedWallet.walletAddress)
      .then(([coins]) => {
        const coinsData = coins.toData();
        const foundCoin = coinsData.find((val) => val.denom === assetDenom);
        if (foundCoin)
          setBalance((parseFloat(foundCoin.amount) / 1e6).toString());
        else {
          setBalance((0).toString());
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asset, assetDenom, connectedWallet, lcd.bank, open]);

  React.useEffect(() => {
    if (!balance) return;
    if (amount > parseFloat(balance))
      setError(locales.TERRA_ERROR_NOT_ENOUGH_FUNDS);
  }, [amount, balance]);

  React.useEffect(() => {
    if (!AccAddress.validate(address))
      setError(locales.TERRA_ERROR_INVALID_ADDRESS);
  }, [address]);

  const handleSendMoney = React.useCallback((): void => {
    if (!connectedWallet) return;
    setLoading(true);
    connectedWallet
      .post({
        msgs: [
          new MsgSend(
            connectedWallet.walletAddress,
            address,
            Coins.fromString(`${amount * 1e6}${assetDenom}`),
          ),
        ],
        fee: new Fee(1000000, "200000uusd"),
      })
      .then((result) => {
        setTxResult(result);
        if (result.success) setTxSuccess(true);
      })
      .catch((err: unknown) => {
        if (err instanceof UserDenied) {
          setErrorTimeOut("User Denied");
        } else if (err instanceof CreateTxFailed) {
          setErrorTimeOut("Create Tx Failed: " + err.message);
        } else if (err instanceof TxFailed) {
          setErrorTimeOut("Tx Failed: " + err.message);
        } else if (err instanceof Timeout) {
          setErrorTimeOut("Timeout");
        } else if (err instanceof TxUnspecifiedError) {
          setErrorTimeOut("Unspecified Error: " + err.message);
        } else {
          setErrorTimeOut(
            "Unknown Error: " +
              (err instanceof Error ? err.message : String(err)),
          );
        }
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [address, amount, assetDenom, connectedWallet]);

  const reset = (): void => {
    setBalance(null);
    setTxResult(null);
    setTxSuccess(false);
    setError("");
    setLoading(false);
  };

  const handleResetClose = (): void => {
    reset();
    onClose();
  };

  const handleDisconnect = (): void => {
    reset();
    disconnect();
  };

  const setErrorTimeOut = (errMsg: string): void => {
    setError(errMsg);
    setTimeout(() => {
      setError("");
    }, 4000);
  };

  const handleViewTx = (): void => {
    if (!connectedWallet || !txResult) return;
    window.open(
      `https://finder.terra.money/${connectedWallet.network.chainID}/tx/${txResult.result.txhash}`,
      "_blank",
    );
  };

  return (
    <Dialog open={open} onClose={handleResetClose}>
      <DialogTitle>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {locales.PAY_WITH_TERRA_STATION}
          <IconButton aria-label="close" onClick={handleResetClose}>
            <Close />
          </IconButton>
        </Grid>
      </DialogTitle>
      <DialogContent>
        {terraStationNotInstalled ? (
          <React.Fragment>
            <Typography>{locales.INSTALL_TERRA_STATION_FIRST}</Typography>
            <Typography color={"error"} variant={"subtitle1"}>
              {locales.INSTALL_TERRA_STATION_NOTE}
            </Typography>
          </React.Fragment>
        ) : connectedWallet ? (
          txResult ? (
            txSuccess ? (
              <TerraTxResult
                starname={starname}
                amount={amount}
                asset={asset}
              />
            ) : (
              <Typography>{locales.TERRA_TX_STATUS_UNKNOWN}</Typography>
            )
          ) : (
            <Block className={"information-container"}>
              <Typography color={"textSecondary"} gutterBottom={true}>
                {locales.RECIPIENT_ADDRESS}
              </Typography>
              <OutlinedInput
                defaultValue={address}
                readOnly={true}
                fullWidth={true}
              />
              <Typography color={"textSecondary"} gutterBottom={true}>
                {locales.AMOUNT}
              </Typography>
              <OutlinedInput
                defaultValue={amount}
                endAdornment={
                  <InputAdornment position="end">
                    {asset.toUpperCase()}
                  </InputAdornment>
                }
                readOnly={true}
              />
              <FormHelperText>
                {locales.AVAILABLE}: {loading ? "..." : balance}
              </FormHelperText>
              <FormHelperText error={!!error}>{error}</FormHelperText>
            </Block>
          )
        ) : (
          <Typography>{locales.CONNECT_TERRA_STATION_FIRST}</Typography>
        )}
      </DialogContent>
      <DialogActions className={"terra-actions-container"}>
        {terraStationNotInstalled ? (
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={() => install(ConnectType.EXTENSION)}
          >
            {locales.INSTALL_TERRASTATION}
          </Button>
        ) : connectedWallet ? (
          txResult ? (
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={handleViewTx}
            >
              {locales.VIEW_IN_TERRA_FINDER}
            </Button>
          ) : (
            <>
              <Button onClick={handleDisconnect}>{locales.DISCONNECT}</Button>
              <LoadingButton
                variant={"contained"}
                color={"primary"}
                onClick={handleSendMoney}
                loading={loading}
                loadingPosition="start"
                startIcon={txSuccess ? <CheckCircle /> : <Send />}
                disabled={!!error || !balance}
              >
                {locales.SEND_MONEY}
              </LoadingButton>
            </>
          )
        ) : isMobile ? (
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={() => connect(ConnectType.WALLETCONNECT)}
          >
            {locales.TERRA_WALLET_CONNECT}
          </Button>
        ) : (
          <React.Fragment>
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={() => connect(ConnectType.EXTENSION)}
            >
              {locales.EXTENSION}
            </Button>
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={() => connect(ConnectType.WALLETCONNECT)}
            >
              {locales.WALLET_CONNECT}
            </Button>
          </React.Fragment>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TerraModal;
