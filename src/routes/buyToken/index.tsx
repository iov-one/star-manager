import { Button, IconButton, Paper } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CloseIcon from "@material-ui/icons/Close";
import { Block } from "components/block";
import { LoadingView } from "components/LoadingView";
import toast, { ToastType } from "components/toast";
import { useWallet } from "contexts/walletContext";
import React from "react";
import { useHistory } from "react-router";
import { Wallet } from "signers/wallet";
import * as Swap from "swap-sdk";

import { BALANCES_ROUTE } from "../paths";

const BuyToken = (): React.ReactElement => {
  const [thinking, setThinking] = React.useState<boolean>(true);
  const history = useHistory();
  const wallet: Wallet = useWallet();
  const [address, setAddress] = React.useState<string | null>(null);

  React.useEffect(() => {
    setThinking(true);
    if (address !== null) {
      const widget = new Swap.Widget({
        lang: "en",
        type: "embed",
        embedContainerId: "swap-container",
        config: {
          amount_editable: true,
          amount: 100,
          currency: "iov",
          delivery_address: address,
        },
      });
      widget.init();
      widget.on("ready", (): void => {
        setThinking(false);
      });
      widget.on("success", (): void => {
        toast.show("Your purchase is successful!", ToastType.Success);
      });
      widget.on("failure", (): void => {
        toast.show(
          "Something went wrong with the purchase! Please try again",
          ToastType.Error,
        );
      });
    }
  }, [wallet, address]);

  React.useEffect(() => {
    if (address === null) {
      wallet.getAddress().then((addr: string) => {
        setAddress(addr);
      });
    }
  }, [wallet, address]);

  const handleCancel = (): void => {
    // Savitar's widget is updating the history.
    history.push(BALANCES_ROUTE);
  };
  const handleGoBack = (): void => {
    history.goBack();
  };

  return (
    <Block
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      flex={1}
    >
      <Paper elevation={thinking ? 0 : 1}>
        <Block
          id={"swap-container"}
          display={"flex"}
          flexDirection={"column-reverse"}
          className={"savitar " + (thinking ? "thinking" : "ready")}
        >
          {thinking ? null : (
            <Block
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              marginLeft={15}
            >
              <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
                {"Back"}
              </Button>
              <IconButton onClick={handleCancel}>
                <CloseIcon />
              </IconButton>
            </Block>
          )}
          {thinking ? <LoadingView /> : null}
        </Block>
      </Paper>
    </Block>
  );
};

export default BuyToken;
