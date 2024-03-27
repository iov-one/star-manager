import "./styles.scss";

import { Block } from "components/block";
import { Tab1 } from "components/GoogleSigner/RequestAuthorizationToSign/tab1";
import { Tab2 } from "components/GoogleSigner/RequestAuthorizationToSign/tab2";
import { useRedirectIfNotPopup } from "hooks/useRedirectIfNotPopup";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";

const getTabClass = (
  baseClass: string,
  currentTab: string,
  thisTab: string,
): string => {
  if (currentTab !== thisTab) return baseClass;
  // This is the active tab then
  return [baseClass, "active"].join(" ");
};

const RequestAuthorizationToSign: React.FC<RouteComponentProps> = (
  props: RouteComponentProps,
): React.ReactElement => {
  const [currentTab, setCurrentTab] = React.useState<string>("1");
  useRedirectIfNotPopup(props.history);
  return (
    <Block className={"google-signer-request-authorization-to-sign"}>
      <Block
        className={getTabClass(
          "google-signer-request-authorization-tab",
          currentTab,
          "1",
        )}
      >
        <Tab1 onNext={(): void => setCurrentTab("2")} />
      </Block>
      <Block
        className={getTabClass(
          "google-signer-request-authorization-tab",
          currentTab,
          "2",
        )}
      >
        <Tab2 onBack={(): void => setCurrentTab("1")} />
      </Block>
    </Block>
  );
};

export default withRouter(RequestAuthorizationToSign);
