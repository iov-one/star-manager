import "./style.scss";

import {
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Slide,
  Theme,
  Typography,
} from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions/transition";
import { makeStyles } from "@material-ui/styles";
import toast, { ToastType } from "components/toast";
import { TxResultToastContent } from "components/txResultToastContent";
import { useWallet } from "contexts/walletContext";
import { useTxPromiseHandler } from "hooks/useTxPromiseHandler";
import locales from "locales/strings";
import { DelegationStoreContext } from "mobx/stores/delegationStore";
import { observer } from "mobx-react";
import React from "react";
import { handleTxError } from "utils/handleTxError";

import ActionButtons from "./ActionButtons";
import Content from "./Content";

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  grid: {
    marginLeft: theme.spacing(4),
  },
  contentHeader: {
    fontWeight: "bold",
  },
  dialog: {
    margin: theme.spacing(1),
  },
  dialogActions: {
    marginTop: theme.spacing(2),
  },
  amountInput: {
    marginTop: theme.spacing(2),
  },
  adorment: {
    marginLeft: theme.spacing(1),
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DelegationDialog = observer(
  ({ open, onClose }: DialogProps): React.ReactElement => {
    const [loading, setLoading] = React.useState<boolean>(false);

    const [handler] = useTxPromiseHandler();
    const wallet = useWallet();
    const classes = useStyles();

    const store = React.useContext(DelegationStoreContext);

    const handleDelegation = (): void => {
      setLoading(true);
      handler(store.delegate(wallet))
        .then((txId) => {
          if (!store.currentValidator) throw new Error("no current validator");
          store.toggleRefresh();
          toast.show(
            <TxResultToastContent
              txId={txId}
              text={`${locales.DELEGATED_SUCCESSFULLY} ${store.amount.format(
                true,
              )} ${locales.TO.toLowerCase()} ${
                store.currentValidator.description.moniker
              }`}
            />,
            ToastType.Success,
          );
        })
        .catch(handleTxError)
        .finally(() => {
          setLoading(false);
          onClose();
          store.resetDialogState();
        });
    };

    const handleUnDelegation = (): void => {
      setLoading(true);
      handler(store.undelegate(wallet))
        .then((txId) => {
          if (!store.currentValidator) throw new Error("no current validator");
          store.toggleRefresh();
          toast.show(
            <TxResultToastContent
              txId={txId}
              text={`${
                locales.UNDELEGATED_SUCCESSFULLY
              } ${store.amount.format()} ${locales.FROM.toLowerCase()} ${
                store.currentValidator.description.moniker
              }`}
            />,
            ToastType.Success,
          );
        })
        .catch(handleTxError)
        .finally(() => {
          setLoading(false);
          store.resetDialogState();
          onClose();
        });
    };

    const handleRedelegation = (): void => {
      setLoading(true);
      handler(store.redelegate(wallet))
        .then((txId) => {
          if (!store.currentValidator || !store.destinationValidator)
            throw new Error("no current or destination validator");
          store.toggleRefresh();
          toast.show(
            <TxResultToastContent
              txId={txId}
              text={`${locales.REDELEGATED_SUCCESSFULLY} ${store.amount.format(
                true,
              )} ${locales.FROM.toLowerCase()} ${
                store.currentValidator.description.moniker
              } ${locales.TO.toLowerCase()} ${
                store.destinationValidator.description.moniker
              }`}
            />,
            ToastType.Success,
          );
        })
        .catch(handleTxError)
        .finally(() => {
          setLoading(false);
          store.resetDialogState();
          onClose();
        });
    };

    const handleAmount = (value: string): void => {
      store.setAmountString(value);
    };

    const handleClose = (): void => {
      onClose();
      store.resetDialogState();
    };

    return store.currentValidator ? (
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <div className={classes.dialog}>
          <DialogTitle>
            <Grid container direction="row" alignItems="center">
              <Grid item>
                <Avatar
                  className={classes.avatar}
                  src={
                    store.validatorsLogos[
                      store.currentValidator.description.identity
                    ]
                  }
                />
              </Grid>
              <Grid className={classes.grid} item>
                <Typography variant={"h5"} color={"primary"}>
                  {store.currentValidator.description.moniker}
                </Typography>
                <Typography color={"textSecondary"} variant={"subtitle1"}>
                  {store.currentValidator.description.website}
                </Typography>
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Content inputOnChange={handleAmount} />
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <ActionButtons
              onDelegate={handleDelegation}
              onUnDelegate={handleUnDelegation}
              onRedelegate={handleRedelegation}
              loading={loading}
            />
          </DialogActions>
        </div>
        {loading ? <LinearProgress /> : null}
      </Dialog>
    ) : (
      <React.Fragment />
    );
  },
);

export default DelegationDialog;
