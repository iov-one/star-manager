import { Button, TextField, Theme, Typography } from "@material-ui/core";
import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import { makeStyles } from "@material-ui/styles";
import closeButtonIcon from "assets/close-button.svg";
import copyIcon from "assets/copy.svg";
import clipboardCopy from "clipboard-copy";
import { Block } from "components/block";
import { Spinner } from "components/Spinner";
import toast, { ToastType } from "components/toast";
import config from "config";
import { VERIFY_MYSELF } from "locales/componentStrings";
import locales from "locales/strings";
import React from "react";
import { InstagramVerifier, TwitterVerifier } from "socialVerifier";
import { SocialHandleVerification } from "types/socialHandleVerification";
import { AuthPopup } from "utils/AuthPopup";

interface Props {
  readonly starname: string;
  readonly handle: string;
  readonly onVerified: (verification: SocialHandleVerification) => void;
  readonly onClose: () => void;
}

const useStyle = makeStyles(({ palette }: Theme) => ({
  container: {
    position: "relative",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  list: {
    listStyle: "none",
    counterReset: "items-counter",
  },
  listItem: {
    counterIncrement: "items-counter",
    marginTop: 16,
    lineHeight: "22px",
    "&::before": {
      display: "inline-block",
      textAlign: "center",
      marginRight: 8,
      verticalAlign: "middle",
      content: "counter(items-counter)",
      color: palette.primary.main,
      fontWeight: "bold",
      fontSize: 18,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: "#f0f0f0",
    },
  },
  verificationStatus: ({
    verification,
  }: {
    verification: SocialHandleVerification;
  }) => ({
    textAlign: "center",
    color: verification.verified ? "seagreen" : "crimson",
  }),
  itemTitle: {
    display: "inline-block",
    verticalAlign: "middle",
  },
  itemContent: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 30,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputFieldInput: {
    fontSize: 15,
  },
  inputField: {
    width: "100%",
  },
  copyIcon: {
    display: "block",
    cursor: "pointer",
    marginLeft: 16,
    marginRight: 16,
  },
  modalTitle: {
    padding: 20,
    textAlign: "center",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    cursor: "pointer",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    "& img": {
      width: 32,
      height: 32,
    },
  },
  button: {
    width: 100,
  },
}));

export const TwitterVerificationModal: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const [input, setInput] = React.useState<HTMLInputElement | null>(null);
  const [verifying, setVerifying] = React.useState<boolean>(false);
  const [verification, setVerification] =
    React.useState<SocialHandleVerification>({
      verified: false,
      url: null,
      error: null,
    });
  const message: string =
    VERIFY_MYSELF.BEGIN + props.starname + VERIFY_MYSELF.END;
  const classes = useStyle({ verification });
  const { handle } = props;
  const copyMessageToClipboard = (): void => {
    if (input === null) return;
    clipboardCopy(input.value)
      .then((): void => {
        toast.show(locales.COPY_SUCCEEDED, ToastType.Success);
      })
      .catch((): void => {
        toast.show(locales.COPY_FAILED_TRY_MANUALLY, ToastType.Error);
      });
    input.select();
  };
  const onVerify = React.useCallback((): void => {
    const verifier: TwitterVerifier = new TwitterVerifier();
    // Start verifying
    setVerifying(true);
    verifier
      .verify(handle, props.starname, message)
      .then((verification: SocialHandleVerification): void => {
        setVerification(verification);
      })
      .catch((error: any): void => {
        console.warn(error);
      })
      .finally((): void => {
        setVerifying(false);
      });
  }, [handle, props.starname, message]);
  const { onVerified } = props;
  const onAccepted = React.useCallback((): void => {
    if (!verification.verified)
      throw new Error("the user should not be able to click this button");
    onVerified(verification);
  }, [verification, onVerified]);
  return (
    <Block width={"medium"} className={classes.container}>
      <Block className={classes.closeButton} onClick={props.onClose}>
        <img src={closeButtonIcon} alt={"close modal"} />
      </Block>
      <Block className={classes.modalTitle}>
        <TwitterIcon fontSize={"large"} color={"primary"} />
        <Typography className={classes.mainTitle}>
          {verification.verified
            ? locales.TWITTER_VERIFIED
            : locales.VERIFY_TWITTER}
        </Typography>
      </Block>
      <Block>
        {!verification.verified ? (
          <ol className={classes.list}>
            <li className={classes.listItem}>
              <Typography variant={"subtitle1"} className={classes.itemTitle}>
                {locales.COPY_TEXT_BELOW}
              </Typography>
              <Block className={classes.itemContent}>
                <TextField
                  inputProps={{ ref: setInput, style: { fontSize: 16 } }}
                  className={classes.inputField}
                  value={message}
                />
                <img
                  className={classes.copyIcon}
                  onClick={copyMessageToClipboard}
                  src={copyIcon}
                  alt={"copy text"}
                />
              </Block>
            </li>
            <li className={classes.listItem}>
              <Typography variant={"subtitle1"} className={classes.itemTitle}>
                {locales.VERIFY}
              </Typography>
              <Typography
                className={classes.itemContent}
                color={"textSecondary"}
              >
                {locales.TWEET_COPIED_TEXT_TO_CONFIRM}
              </Typography>
            </li>
          </ol>
        ) : null}
        <div className={classes.verificationStatus}>
          {verification.verified
            ? locales.TWITTER_VERIFICATION_SUCCESS
            : verification.error || locales.TWITTER_VERIFICATION_NOT_SUCCEESS}
        </div>
        <Block display={"flex"} justifyContent={"flex-end"} marginTop={32}>
          <Button
            className={classes.button}
            variant={"contained"}
            color={"primary"}
            disabled={verifying}
            onClick={verification.verified ? onAccepted : onVerify}
          >
            {verifying ? (
              <Spinner size={24} />
            ) : verification.verified ? (
              locales.OK
            ) : (
              locales.VERIFY
            )}
          </Button>
        </Block>
      </Block>
    </Block>
  );
};

export const InstagramVerificationModal: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const [verifying, setVerifying] = React.useState<boolean>(false);
  const [verification, setVerification] =
    React.useState<SocialHandleVerification>({
      verified: false,
      url: null,
      error: null,
    });
  const authReceived = React.useRef<boolean>(false);
  const { handle } = props;
  const classes = useStyle({ verification });

  const receiveMessage = React.useCallback(
    (event: MessageEvent): void => {
      if (event.origin === window.location.origin) {
        if (event.data.errorMessage) {
          setVerifying(false);
          console.warn(event.data.errorMessage);
        } else if (event.data.code && !authReceived.current) {
          // we are sure, we have auth code
          authReceived.current = true;
          const verifier: InstagramVerifier = new InstagramVerifier();
          verifier
            .verify(
              handle,
              props.starname,
              event.data.code,
              config.instagramConfig.redirectUri,
            )
            .then((verification: SocialHandleVerification): void => {
              setVerification(verification);
            })
            .catch((error: any): void => {
              console.warn(error);
            })
            .finally((): void => {
              setVerifying(false);
            });
        }
      }
    },
    [handle, props.starname],
  );

  const onVerify = React.useCallback((): void => {
    setVerifying(true);
    AuthPopup(
      "https://www.instagram.com/oauth/authorize",
      config.instagramConfig.clientId,
      config.instagramConfig.redirectUri,
    );
    window.removeEventListener("message", receiveMessage);
    window.addEventListener("message", receiveMessage);
  }, [receiveMessage]);
  const { onVerified } = props;
  const onAccepted = React.useCallback((): void => {
    if (!verification.verified)
      throw new Error("the user should not be able to click this button");
    onVerified(verification);
  }, [verification, onVerified]);
  return (
    <Block width={"medium"} className={classes.container}>
      <Block className={classes.closeButton} onClick={props.onClose}>
        <img src={closeButtonIcon} alt={"close modal"} />
      </Block>
      <Block className={classes.modalTitle}>
        <InstagramIcon fontSize={"large"} color={"primary"} />
        <Typography className={classes.mainTitle}>
          {verification.verified
            ? locales.INSTAGRAM_VERIFIED
            : locales.VERIFY_INSTAGRAM}
        </Typography>
      </Block>
      <Block>
        {!verification.verified ? (
          <>
            <Typography
              className={classes.itemContent}
              color={"textPrimary"}
              gutterBottom
            >
              {locales.INSTAGRAM_VERIFY_INSTRUCTIONS}
            </Typography>
            <Typography
              className={classes.itemContent}
              color={"textPrimary"}
              gutterBottom
            >
              {locales.INSTAGRAM_VERIFY_NOTE}
            </Typography>
          </>
        ) : null}
        <div className={classes.verificationStatus}>
          {verification.verified
            ? locales.INSTAGRAM_VERIFICATION_SUCCESS
            : verification.error || locales.INSTAGRAM_VERIFICATION_NOT_SUCCEESS}
        </div>
        <Block display={"flex"} justifyContent={"flex-end"} marginTop={32}>
          <Button
            className={classes.button}
            variant={"contained"}
            color={"primary"}
            disabled={verifying}
            onClick={verification.verified ? onAccepted : onVerify}
          >
            {verifying ? (
              <Spinner size={24} />
            ) : verification.verified ? (
              locales.OK
            ) : (
              locales.VERIFY
            )}
          </Button>
        </Block>
      </Block>
    </Block>
  );
};
