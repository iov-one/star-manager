import { useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import api from "api";
import {
  KEPLR_KEYSTORE_CHANGE_EVENT,
  SIGN_OUT_EVENT,
} from "applicationConstants";
import { DisplayMnemonic } from "components/GoogleSigner/DisplayMnemonic";
import RequestAuthorizationToSign from "components/GoogleSigner/RequestAuthorizationToSign";
import InstagramAuthPopup from "components/InstagramAuthPopup";
import { LoadingView } from "components/LoadingView";
import RequireLogin from "components/requireLogin";
import TokensCreditResult from "components/TokensCreditResult";
import {
  QUERY_BUY_TOKENS_WIDGET,
  QUERY_STARNAME,
  QUERY_VIEW_ONLY_MODE,
} from "genericConstants";
import { useLedgerSignAndPostModal } from "hooks/useLedgerSignAndPostModal";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import { SnackbarProvider } from "notistack";
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import SignInForm from "routes/login/components/SignInForm";
import {
  GOOGLE_DRIVE_DISPLAY_MNEMONIC,
  GOOGLE_DRIVE_REQUEST_AUTHORIZATION_TO_SIGN,
  INSTAGRAM_POPUP_ROUTE,
  IOV_TOKENS_PAYMENT_RESULT,
  STARNAME_PROFILE_MAIN,
  STARNAME_PROFILE_SEND,
  WELCOME,
} from "routes/paths";
import { RoutesSelector } from "routes/routesSelector";
import { WelcomeFlow } from "routes/welcome";
import { GDriveCustodianContext } from "signers/gdrive/context";
import { GDriveCustodian } from "signers/gdrive/custodian";
import { GoogleSigner } from "signers/google";
import { KeplrSigner } from "signers/keplr";
import { Ledger } from "signers/ledger";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import theme from "theme";
import { StarnameProfilePage } from "types/starnameProfile";

import StarnameProfile from "./starnameProfile";
import Maintenance from "./transactions/components/Maintenance";

const MAINTENANCE_MODE = false;

export const LogoutEvent = new CustomEvent(SIGN_OUT_EVENT);

const useStyles = makeStyles({
  error: {
    backgroundColor: "#FF5733",
  },
  info: {
    backgroundColor: "#5b72b7",
  },
});

const Routes: React.FC = observer((): React.ReactElement => {
  // Keep it simple and stupid: we keep the api bridge
  // in this component which is a top level and provide
  // it to any child component as a context object.
  //
  // The fact that this object is set, by itself means that
  // the user was authenticated successfully
  const classes = useStyles();
  const denseMargin = useMediaQuery(theme.breakpoints.down("md"));
  const [ready, setReady] = React.useState<boolean>(false);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const session: SessionStore =
    React.useContext<SessionStore>(SessionStoreContext);
  const custodian: GDriveCustodian = React.useContext<GDriveCustodian>(
    GDriveCustodianContext,
  );
  const wallet = session.wallet;

  const onKeplrKeystoreChange = (): void => {
    const signer = new KeplrSigner();
    signer.initialize().then((initialized) => {
      if (initialized) session.setWallet(new Wallet(signer));
    });
  };

  React.useEffect(() => {
    // We cannot wait for it!
    api.initialize().then(() => {
      setInitialized(true);
    });
  }, []);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    session.setQueriedStarname(urlParams.get(QUERY_STARNAME));
    if (urlParams.get(QUERY_BUY_TOKENS_WIDGET))
      session.setShowBuyTokenWidget(true);
    if (urlParams.get(QUERY_VIEW_ONLY_MODE)) session.setViewOnlyMode(true);
  }, [session]);

  // Save last wallet used
  React.useEffect((): (() => void) | void => {
    if (wallet !== null) {
      const onSignOut = (): void => {
        if (wallet.getSignerType() === SignerType.Google) {
          const signer: GoogleSigner = custodian.getSigner();
          signer
            .signOut()
            .then((): void => {
              session.setWallet(null);
              session.reset();
            })
            .catch(console.error);
        } else if (wallet.getSignerType() === SignerType.Ledger) {
          const ledger = wallet.signer as Ledger;
          ledger.disconnect();
          session.setWallet(null);
          session.reset();
        } else {
          session.setWallet(null);
          session.reset();
        }
      };
      document.addEventListener(SIGN_OUT_EVENT, onSignOut);
      return (): void =>
        document.removeEventListener(SIGN_OUT_EVENT, onSignOut);
    }
  }, [custodian, wallet, session]);
  // Ensure we are ready to go
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
    window.addEventListener(KEPLR_KEYSTORE_CHANGE_EVENT, onKeplrKeystoreChange);
    return () => {
      window.removeEventListener(
        KEPLR_KEYSTORE_CHANGE_EVENT,
        onKeplrKeystoreChange,
      );
    };
  }, []);

  // Ensure that when the ledger asks the user to approve
  // signing a given transaction the modal is shown with the
  // message requesting to do so
  useLedgerSignAndPostModal(wallet === null ? null : wallet.signer);
  const onSignIn = (wallet: Wallet | null): void => {
    session.setWallet(wallet);
  };

  const loginRenderer = (): React.ReactElement | null => {
    if (wallet === null) {
      return <SignInForm ready={ready} onSignIn={onSignIn} />;
    } else {
      return <Redirect to={session.rootRoute} />;
    }
  };
  return MAINTENANCE_MODE ? (
    <Maintenance />
  ) : initialized ? (
    <SessionStoreContext.Provider value={session}>
      <SnackbarProvider
        maxSnack={1}
        dense={denseMargin}
        autoHideDuration={4000}
        classes={{ variantError: classes.error, variantInfo: classes.info }}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        <BrowserRouter>
          <Switch>
            <Route exact path={"/"} render={loginRenderer} />
            <Route
              exact
              path={GOOGLE_DRIVE_REQUEST_AUTHORIZATION_TO_SIGN}
              component={RequestAuthorizationToSign}
            />
            <Route
              exact
              path={GOOGLE_DRIVE_DISPLAY_MNEMONIC}
              component={DisplayMnemonic}
            />
            <Route
              exact
              path={INSTAGRAM_POPUP_ROUTE}
              component={InstagramAuthPopup}
            />
            <Route
              exact
              path={IOV_TOKENS_PAYMENT_RESULT}
              component={TokensCreditResult}
            />
            <Route exact path={WELCOME} component={WelcomeFlow} />
            <Route path={STARNAME_PROFILE_SEND}>
              <StarnameProfile page={StarnameProfilePage.Send} />
            </Route>
            <Route path={STARNAME_PROFILE_MAIN}>
              <StarnameProfile page={StarnameProfilePage.Main} />
            </Route>
            {/* Routes that require authentication */}
            <RequireLogin wallet={wallet}>
              <RoutesSelector />
            </RequireLogin>
          </Switch>
        </BrowserRouter>
      </SnackbarProvider>
    </SessionStoreContext.Provider>
  ) : (
    <LoadingView />
  );
});

export default Routes;
