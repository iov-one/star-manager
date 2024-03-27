import { message } from "antd";
import copyToClipboard from "clipboard-copy";
import React from "react";
import QRGenerator from "react-qr-code";
import { RouteComponentProps, withRouter } from "react-router";
import { MiddleEllipsis } from "routes/starnameProfile/components/MiddleEllipsis";
import isMobile from "routes/starnameProfile/isMobile";
import wallets from "routes/starnameProfile/wallets";
import { AccountInfo } from "types/profile";
import { Resource } from "types/resourceInfo";

import { findUriBySymbol } from "../../GetStarnameProfile/helper";
import { WalletButtons } from "./walletButtons";

interface Props
  extends RouteComponentProps<{ currency: string; amount: string }> {
  readonly accountData: AccountInfo | null;
  readonly starname: string;
}

const SendTokensView: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const { accountData, starname, match } = props;
  const { currency, amount } = match.params;
  const [qrExpanded, setQrExpanded] = React.useState<boolean>(false);
  const resource: Resource | undefined = React.useMemo(():
    | Resource
    | undefined => {
    if (accountData === null) return undefined;
    const { resources } = accountData;
    if (resources === null) return undefined;
    const uri: string | undefined = findUriBySymbol(currency);
    if (uri !== undefined) {
      // We should stop it from clicking the button
      return resources.find((each: Resource): boolean => uri === each.uri);
    } else {
      return undefined;
    }
  }, [currency, accountData]);
  if (resource === undefined) {
    return null;
  }
  return (
    <div className={"send-tokens-view"}>
      <div className={"heading"}>
        <h1>
          To make a payment to {starname}, send {currency.toUpperCase()} to the
          address below.
        </h1>
      </div>
      <div className={"input-section"}>
        <div className={"input-section-heading"}>{"Amount"}</div>
        <div className={"input-section-in"}>
          <input
            className={"copyable-text-view"}
            type="text"
            name="amount"
            disabled={true}
            value={Number(amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 18,
            })}
          />
          <div className={"input-section-copy"}>
            <img
              src={"/assets/copy.svg"}
              alt={"copy icon"}
              onClick={(): void => {
                copyToClipboard(amount)
                  .then((): void => {
                    void message.success("Copied to clipboard!");
                  })
                  .catch((): void => {
                    void message.error("Sorry, could not copy");
                  });
              }}
            />
          </div>
        </div>
      </div>
      <div className={"input-section"}>
        <div className={"input-section-heading"}>{"Address"}</div>
        <div className={"input-section-in"}>
          <MiddleEllipsis className={"copyable-text-view"}>
            {resource.resource}
          </MiddleEllipsis>
          <div className={"input-section-copy"}>
            <img
              src={"/assets/copy.svg"}
              alt={"copy icon"}
              onClick={(): void => {
                copyToClipboard(resource.resource)
                  .then((): void => {
                    void message.success("Copied to clipboard!");
                  })
                  .catch((): void => {
                    void message.error("Sorry, could not copy");
                  });
              }}
            />
          </div>
        </div>
      </div>
      <div
        className={[
          "qr-code-container",
          qrExpanded ? "expanded" : "collapsed",
        ].join(" ")}
      >
        <div
          className={"label"}
          onClick={(): void => setQrExpanded(!qrExpanded)}
        >
          <span>{qrExpanded ? "Hide" : "Show"} QR Code</span>
          <div className={"icon"}>
            <span className={"fa fa-qrcode"} />
          </div>
        </div>
        <div className={"image"}>
          <QRGenerator value={resource.resource} size={200} />
        </div>
      </div>
      <WalletButtons
        items={isMobile() ? wallets.mobile : wallets.desktop}
        asset={currency.toLowerCase()}
        starname={starname}
        address={resource.resource}
        amount={Number(amount)}
      />
    </div>
  );
};

export default withRouter(SendTokensView);
