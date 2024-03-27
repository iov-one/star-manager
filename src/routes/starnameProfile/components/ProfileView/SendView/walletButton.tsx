import { Button } from "@material-ui/core";
import { getAllSupportedChains, getChainSymbol } from "config/supportedChains";
import { ERROR_IGNORED } from "genericConstants";
import locales from "locales/strings";
import { SnackbarKey, useSnackbar } from "notistack";
import React from "react";
import { ICONS } from "routes/starnameProfile/Assets";
import { WalletUri } from "routes/starnameProfile/wallets";
import { PaymentWallets } from "types/paymentWallets";
import { getTxError } from "utils/handleTxError";

import TerraModal from "../TerraModal";

interface Props {
  readonly item: WalletUri;
  readonly asset: string;
  readonly starname: string;
  readonly address: string;
  readonly amount: number;
}

export const WalletButton: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { name, link, label, icon } = props.item;
  const { asset } = props;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [showTerraModal, setShowTerraModal] = React.useState<boolean>(false);
  const amountNumber = Number(props.amount);
  const classes = React.useMemo(
    (): ReadonlyArray<string> => [
      "resource-view",
      ...(name === undefined ? ["stub"] : []),
    ],
    [name],
  );

  const handleViewTx = (key: SnackbarKey, txHash: string): void => {
    const chainLinkedToAsset = getAllSupportedChains().find(
      (chain) => getChainSymbol(chain) === asset.toUpperCase(),
    );
    if (chainLinkedToAsset) {
      window.open(
        chainLinkedToAsset.txExplorer.replace("{txHash}", txHash),
        "_blank",
      );
    }
    closeSnackbar(key);
  };

  const onClick = async (
    event: React.MouseEvent<HTMLElement>,
  ): Promise<void> => {
    event.preventDefault();
    switch (name) {
      case PaymentWallets.Keplr:
        enqueueSnackbar(locales.TRANSACTION_RUNNING, {
          variant: "info",
          persist: true,
        });
        break;
      case PaymentWallets.Terra: {
        setShowTerraModal(true);
        return;
      }
      default:
        break;
    }
    const response: string | Promise<void | string> = link(
      asset,
      props.address,
      amountNumber,
      props.starname,
    );
    if (typeof response === "string") {
      window.open(response, "_blank");
    } else {
      response
        .then((txHash) => {
          if (typeof txHash === "string") {
            const { starname } = props;
            enqueueSnackbar(
              `Successfully sent ${amountNumber} ${asset.toUpperCase()} to ${starname}`,
              {
                variant: "success",
                autoHideDuration: 5000,
                action: (key) => (
                  <Button
                    style={{ borderColor: "white", color: "white" }}
                    variant={"outlined"}
                    onClick={() => handleViewTx(key, txHash)}
                  >
                    {locales.VIEW}
                  </Button>
                ),
              },
            );
          } else {
            // less frequent case
            enqueueSnackbar(locales.SOMETHING_WENT_WRONG, {
              variant: "warning",
            });
          }
        })
        .catch((error: Error) => {
          const errMsg = getTxError(error);
          if (errMsg === ERROR_IGNORED) return;
          enqueueSnackbar(errMsg, {
            variant: "error",
          });
        });
    }
  };
  return (
    <>
      <div className={classes.join(" ")} onClick={onClick}>
        <div className={"icon"}>
          {name === undefined ? <div /> : <img src={icon} alt={name} />}
        </div>
        <div className={"name"}>{label}</div>
        <img src={ICONS.NEXT} className={"next-icon"} alt={"next"} />
      </div>
      <TerraModal
        open={showTerraModal}
        onClose={() => setShowTerraModal(false)}
        starname={props.starname}
        asset={props.asset}
        address={props.address}
        amount={props.amount}
      />
    </>
  );
};
