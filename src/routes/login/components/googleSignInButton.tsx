import { GoogleAuthInfo, SignerState } from "@iov/gdrive-custodian";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  OutlinedInput,
  Typography,
} from "@material-ui/core";
import { VpnKey } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import { LoadingButton } from "@mui/lab";
import googleOffIcon from "assets/google-off.svg";
import googleOnIcon from "assets/google-on.svg";
import GoogleBillboardMessage from "components/BillboardMessage/google";
import modal from "components/modal";
import toast, { ToastType } from "components/toast";
import { useErrorTimeout } from "hooks/useErrorTimeout";
import locales from "locales/strings";
import React from "react";
import { SignInButton } from "routes/login/components/signInButton";
import { GDriveCustodianContext } from "signers/gdrive/context";
import { GDriveCustodian } from "signers/gdrive/custodian";
import { GoogleSigner } from "signers/google";
import { Wallet } from "signers/wallet";
import { SignerButtonProps } from "types/signInMethod";

import GoogleAuthFailedDialog from "./GoogleFailedAuthModal";
import PrePermissionsNotice from "./GooglePrePermissionsNotice";

const NOTICE_LOCALSTORAGE_KEY = "noticeUnderstood";

interface FailedModal {
  visible: boolean;
  content: string | null;
}

const useStyles = makeStyles(() => ({
  googleButton: {
    borderRadius: 20,
  },
}));

export const GoogleSignInButton: React.FC<SignerButtonProps<GoogleAuthInfo>> = (
  props: SignerButtonProps<GoogleAuthInfo>,
): React.ReactElement => {
  const styles = useStyles();
  const [failed2fa, setFailed2fa] = useErrorTimeout();
  const [signerConnected, setSignerConnected] = React.useState<boolean>(false);
  const [showAuthenticatingProgress, setShowAuthenticatingProgress] =
    React.useState<boolean>(false);
  const [showFailedModal, setShowFailedModal] = React.useState<FailedModal>({
    content: null,
    visible: false,
  });
  const [showNotice, setShowNotice] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [token, setToken] = React.useState<string>("");
  const [validatingToken, setValidatingToken] = React.useState<boolean>(false);
  const [show2FAModal, setShow2FAModal] = React.useState<boolean>(false);
  const [googleButton, setGoogleButton] =
    React.useState<HTMLButtonElement | null>(null);
  const [noticeButton, setNoticeButton] =
    React.useState<HTMLButtonElement | null>(null);
  const { ready } = props;
  const custodian: GDriveCustodian = React.useContext<GDriveCustodian>(
    GDriveCustodianContext,
  );

  const onTokenChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    if (event.target.value.length > 6) return;
    setToken(event.target.value);
  };

  const handleValidateClick = (): void => {
    if (token) {
      setValidatingToken(true);
      custodian.authenticateWith2fa(token).finally(() => {
        setValidatingToken(false);
      });
    }
  };
  React.useEffect((): (() => void) | void => {
    if (!showAuthenticatingProgress) return;
    return modal.show(
      <GoogleBillboardMessage
        text={locales.WAITING_FOR_GOOGLE_TO_AUTHENTICATE}
      />,
    );
  }, [showAuthenticatingProgress]);

  React.useEffect(() => {
    if (!showNotice) return;
    return modal.show(
      <PrePermissionsNotice ref={setNoticeButton} ready={ready} />,
    );
  }, [showNotice, ready]);

  React.useEffect(() => {
    if (!showFailedModal.visible || !showFailedModal.content) return;
    return modal.show(
      <GoogleAuthFailedDialog
        close={handleFailedModalClose}
        content={
          <Typography align={"center"} variant={"subtitle1"}>
            {showFailedModal.content}
          </Typography>
        }
      />,
    );
  }, [showFailedModal]);

  const handleFailedModalClose = (): void => {
    setShowFailedModal({ visible: false, content: null });
  };

  const removeNoticeModal = (): void => {
    // dont show notice anymore also update localStorage for future
    setShowNotice(false);
    localStorage.setItem(NOTICE_LOCALSTORAGE_KEY, "true");
  };

  const removeKeyFromLocalStorage = (): void => {
    localStorage.removeItem(NOTICE_LOCALSTORAGE_KEY);
  };

  const customClickHandler = (event: MouseEvent): void => {
    // if called it means the outer google googleButton's click is recieved here
    // now show notice as a intermediate screen
    event.preventDefault();
    event.stopImmediatePropagation();
    setShowNotice(true);
  };

  const noticeButtonListener = React.useCallback((): void => {
    // click on notice action googleButton will click the original outer google googleButton
    // this is done to make messages transmit via parent
    if (googleButton) {
      googleButton.click();
    }
  }, [googleButton]);

  const onSignInHandler = props.onSignIn;
  // Helper function
  const doSignIn = React.useCallback((): void => {
    setShowAuthenticatingProgress(false);
    // Authenticate and then create the signer
    onSignInHandler(new Wallet(new GoogleSigner(custodian.getSigner())));
  }, [custodian, onSignInHandler]);
  const onStateChange = React.useCallback(
    (state: SignerState, data?: any): void => {
      switch (state) {
        case SignerState.BrowserProbablyBlockingContent:
          removeKeyFromLocalStorage();
          setShowAuthenticatingProgress(false);
          toast.show(
            "Please check that your browser is not blocking trackers",
            ToastType.Error,
          );
          break;
        case SignerState.Authenticating:
          removeNoticeModal();
          setShowAuthenticatingProgress(true);
          break;
        case SignerState.Loading:
          break;
        case SignerState.Sandboxed:
          break;
        case SignerState.Authenticated:
          custodian.setAuthInfo(data);
          setShowAuthenticatingProgress(false);
          setLoading(true);
          break;
        case SignerState.Verifying2fa:
          setLoading(false);
          setShow2FAModal(true);
          break;
        case SignerState.Verified2fa:
          setFailed2fa("");
          setShow2FAModal(false);
          break;
        case SignerState.Verification2faFailed:
          setFailed2fa("Invalid token, please try again");
          break;
        case SignerState.Verification2faConfigFailure:
          setShow2FAModal(false);
          toast.show("Internal config failure", ToastType.Error);
          break;
        case SignerState.AuthenticationCompleted:
          setLoading(false);
          setShow2FAModal(false);
          break;
        case SignerState.PreparingSigner:
          break;
        case SignerState.SignedOut:
          removeKeyFromLocalStorage();
          break;
        case SignerState.Failed:
          removeKeyFromLocalStorage();
          setShowAuthenticatingProgress(false);
          setShowFailedModal({
            content: locales.AUTHENTICATION_FAILED,
            visible: true,
          });
          break;
        case SignerState.CancelledByUser:
          setShowAuthenticatingProgress(false);
          removeKeyFromLocalStorage();
          setShowFailedModal({
            content: locales.AUTHENTICATION_POPUP_CLOSED,
            visible: true,
          });
          break;
        case SignerState.PermissionRequestCancelled:
          removeKeyFromLocalStorage();
          setShowAuthenticatingProgress(false);
          setShowFailedModal({
            content: locales.AUTHENTICATION_PERMISSIONS_CANCELLED,
            visible: true,
          });
          break;
        case SignerState.PermissionRequestRejected:
          removeKeyFromLocalStorage();
          setShowAuthenticatingProgress(false);
          setShowFailedModal({
            content: locales.AUTHENTICATION_PERMISSION_REQUEST_REJECTED,
            visible: true,
          });
          break;
        case SignerState.SignerReady:
          doSignIn();
          break;
      }
    },
    [custodian, doSignIn, setFailed2fa],
  );

  React.useEffect((): (() => void) => {
    custodian.setStateChangeListener(onStateChange);
    return (): void => {
      custodian.removeStateChangeListener();
    };
  }, [custodian, onStateChange]);

  React.useEffect(() => {
    if (!noticeButton || !googleButton) return;
    // connect custodian again to original googleButton, so messages gets transmitted from parent
    custodian.connect(googleButton);
    noticeButton.addEventListener("click", noticeButtonListener, true);

    return () => {
      noticeButton.removeEventListener("click", noticeButtonListener, true);
    };
  }, [googleButton, custodian, noticeButtonListener, noticeButton]);

  React.useEffect((): (() => void) | void => {
    if (!ready || googleButton === null) return;
    // key is there which means user has seen the notice already
    if (localStorage.getItem(NOTICE_LOCALSTORAGE_KEY)) {
      const disconnect = custodian.connect(googleButton);
      setSignerConnected(true);
      return () => {
        disconnect();
      };
    } else {
      // do not add listener when notice is open as we will then..bind the googleButton to custodian
      if (!showNotice) {
        googleButton.addEventListener("click", customClickHandler, true);
      }
      setSignerConnected(true);
      return (): void => {
        googleButton.removeEventListener("click", customClickHandler, true);
      };
    }
  }, [googleButton, custodian, ready, showNotice, showFailedModal.visible]);
  return (
    <>
      <SignInButton
        onSignIn={() => {}}
        className={styles.googleButton}
        ref={setGoogleButton}
        ready={props.ready && signerConnected}
        icons={{
          on: googleOnIcon,
          off: googleOffIcon,
        }}
        label={locales.CONTINUE_WITH_GOOGLE}
        loading={loading}
      />
      <Dialog open={show2FAModal} onClose={() => setShow2FAModal(false)}>
        <DialogTitle>{locales.TWO_FACTOR_AUTH}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {locales.TWO_FACTOR_AUTH_DIALOG_NOTE}
          </Typography>
          <OutlinedInput
            fullWidth={true}
            style={{ marginTop: "2%" }}
            placeholder={"Code here"}
            type={"number"}
            value={token}
            onChange={onTokenChange}
          />
          <FormHelperText error={!!failed2fa}>{failed2fa}</FormHelperText>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loadingPosition={"start"}
            loading={validatingToken}
            startIcon={<VpnKey />}
            onClick={handleValidateClick}
          >
            {locales.VALIDATE}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
