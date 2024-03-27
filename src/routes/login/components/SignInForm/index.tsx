import "./styles.scss";

import logo from "assets/logo.webp";
import { Block } from "components/block";
import locales from "locales/strings";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import React from "react";
import { SignInDecoration } from "routes/login/components/signInDecoration";
import { SignInMethodItem } from "routes/login/components/signInMethodItem";
import TitleSection from "routes/login/components/titleSection";
import { ViewOnlyButton } from "routes/login/components/viewOnlyButton";
import methods from "routes/login/methods";
import { google } from "routes/login/methods/google";
import { PRIVACY_POLICY_ROUTE, TERMS_AND_CONDITIONS_ROUTE } from "routes/paths";
import { ViewOnlySigner } from "signers/viewOnly";
import { Wallet } from "signers/wallet";
import {
  ImportedSignInMethod,
  SignInFormCompletedCallback,
  SignInMethod,
} from "types/signInMethod";

interface Props {
  readonly onSignIn: SignInFormCompletedCallback<any>;
  readonly ready: boolean;
}

const SignInForm: React.FC<Props> = observer(
  (props: Props): React.ReactElement => {
    const sessionStore = React.useContext<SessionStore>(SessionStoreContext);

    return (
      <Block className={"sign-in-form-view-container"}>
        <Block className={"sign-in-form-decoration-container"}>
          <SignInDecoration />
          <img src={logo} alt={"logo"} />
        </Block>
        <Block className={"sign-in-form-form-container"}>
          <Block className={"sign-in-form-form-border"}>
            <TitleSection
              primaryTitle={locales.WELCOME_PRIMARY}
              secondaryTitle={
                sessionStore.queriedStarname
                  ? `${locales.WELCOME_SECONDARY_IF_QUERIED_STARNAME} ${sessionStore.queriedStarname}`
                  : ""
              }
            />
            <Block className="sign-in-form-methods-container">
              {methods.map(
                (
                  method: SignInMethod | ImportedSignInMethod<any>,
                ): React.ReactElement => (
                  <SignInMethodItem
                    {...method}
                    onSignIn={props.onSignIn}
                    key={method.key}
                    inheritedKey={method.key}
                    ready={method === google ? props.ready : true}
                  />
                ),
              )}
            </Block>
            {sessionStore.viewOnlyMode && (
              <ViewOnlyButton
                disabled={false}
                onSignIn={(address: string): void => {
                  props.onSignIn(new Wallet(new ViewOnlySigner(address)));
                }}
              />
            )}
          </Block>
        </Block>
        <Block className={"sign-in-form-bottom-links"}>
          <a
            href={PRIVACY_POLICY_ROUTE}
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            {locales.PRIVACY_POLICY}
          </a>
          <Block className={"sign-in-form-bottom-links-separator"} />
          <a
            href={TERMS_AND_CONDITIONS_ROUTE}
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            {locales.TERMS_AND_CONDITIONS}
          </a>
        </Block>{" "}
      </Block>
    );
  },
);

export default SignInForm;
