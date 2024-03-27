import "./style.scss";

import { Button, Typography } from "@material-ui/core";
import walletSvg from "assets/wallet.svg";
import clipboardCopy from "clipboard-copy";
import { Block } from "components/block";
import { MiddleEllipsis } from "components/MiddleEllipsis";
import PageContent from "components/PageContent";
import toast, { ToastType } from "components/toast";
import { useWallet } from "contexts/walletContext";
import locales from "locales/strings";
import strings from "locales/strings";
import React from "react";
import QrCode from "react-qr-code";
import { withRouter } from "react-router";
import { RouteComponentProps } from "react-router-dom";

const ReceivePayment: React.FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps): React.ReactElement => {
  const wallet = useWallet();
  const [address, setAddress] = React.useState<string>("");
  React.useEffect((): void => {
    wallet.getAddress().then(setAddress).catch(console.warn);
  }, [wallet]);

  const copyAddress = (): void => {
    clipboardCopy(address)
      .then((): void => {
        toast.show(locales.ADDRESS_HAS_BEEN_COPIED, ToastType.Success);
      })
      .catch((): void => {
        toast.show(locales.CLIPBOARD_COPY_ERROR, ToastType.Error);
      });
  };

  return (
    <PageContent
      icon={<img src={walletSvg} alt={"wallet icon"} />}
      avatarColor={"accent"}
      width={"normal"}
      buttons={
        <Block>
          <Button
            type={"submit"}
            color={"primary"}
            fullWidth={true}
            onClick={(): void => history.goBack()}
          >
            {strings.CLOSE}
          </Button>
        </Block>
      }
    >
      <Block className={"receive-payment-view"}>
        <Block
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          marginBottom={32}
        >
          <Typography color={"textPrimary"} variant={"subtitle2"}>
            {locales.RECEIVE_TOKENS}
          </Typography>
        </Block>
        <Block className={"receive-payment-view-qr-code"}>
          <QrCode value={address} />
        </Block>
        <Block className={"receive-payment-view-address"}>
          <MiddleEllipsis variant={"h5"} color={"primary"}>
            {address}
          </MiddleEllipsis>
          <Button variant={"text"} onClick={copyAddress}>
            <i className={"fa fa-copy"} />
          </Button>
        </Block>
      </Block>
    </PageContent>
  );
};

export default withRouter(ReceivePayment);
