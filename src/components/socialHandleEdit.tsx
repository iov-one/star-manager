import {
  Button,
  CircularProgress,
  FormHelperText,
  OutlinedInput,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { ErrorOutline } from "@material-ui/icons";
import api from "api";
import { SocialLabels } from "applicationConstants";
import checkMarkIcon from "assets/green-tick.svg";
import { Block } from "components/block";
import modal from "components/modal";
import {
  InstagramVerificationModal,
  TwitterVerificationModal,
} from "components/socialVerificationModal";
import { ImageLoader } from "hooks/useImageLoader";
import locales from "locales/strings";
import {
  SocialHandleStore,
  useSocialHandleStore,
} from "mobx/stores/socialHandleStore";
import { observer } from "mobx-react";
import React from "react";
import useStyles from "theme/profileForm";
import { GenericSocialClaimVerificationResponse } from "types/genericSocialClaimVerificationResponse";
import { Resource } from "types/resourceInfo";
import { SocialHandleType } from "types/socialHandleType";
import { SocialHandleVerification } from "types/socialHandleVerification";
import instagramClaimVerifier from "utils/instagramClaimVerifier";
import twitterClaimVerifier from "utils/twitterClaimVerifier";

interface Props {
  readonly verifiable: boolean;
  readonly starname: string;
  readonly type: SocialHandleType;
  readonly disabled: boolean;
  readonly onUpdateResource: (
    type: SocialHandleType,
    verification: SocialHandleVerification,
    resources: Resource,
  ) => void;
  readonly onRemoveResource: (type: SocialHandleType) => void;
}

export const SocialHandleEdit: React.FC<Props> = observer(
  (props: Props): React.ReactElement => {
    const { starname, verifiable, type, disabled } = props;
    const { onUpdateResource, onRemoveResource } = props;

    const { validResource } = api.getSettings();
    const validResourceRegExp = RegExp(validResource);

    const store: SocialHandleStore = useSocialHandleStore();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>("");
    const [claimResult, setClaimResult] =
      React.useState<GenericSocialClaimVerificationResponse | null>(null);
    const startAdornment: string | null = React.useMemo<string | null>(():
      | string
      | null => {
      switch (type) {
        case SocialHandleType.Twitter:
        case SocialHandleType.Telegram:
        case SocialHandleType.Instagram:
          return "@";
        case SocialHandleType.Discord:
        case SocialHandleType.Website:
          return null;
      }
    }, [type]);

    const checkSocialClaim = React.useCallback(() => {
      if (!store.value) return;
      if (type === SocialHandleType.Instagram) {
        setLoading(true);
        instagramClaimVerifier(store.value, starname)
          .then(setClaimResult)
          .catch(console.warn)
          .finally(() => setLoading(false));
      } else if (type === SocialHandleType.Twitter) {
        setLoading(true);
        twitterClaimVerifier(store.value, starname)
          .then(setClaimResult)
          .catch(console.warn)
          .finally(() => setLoading(false));
      }
    }, [starname, store.value, type]);

    React.useEffect(() => {
      if (store.handleModified) {
        setClaimResult(null);
      } else {
        // if handle not modified
        // Triggered on init, also triggered when handle is updated but resetted back to original
        checkSocialClaim();
      }
    }, [checkSocialClaim, store.handleModified]);

    React.useEffect((): void => {
      if (store.value === "") {
        onRemoveResource(type);
        setClaimResult(null);
      }
    }, [store.value, onRemoveResource, type]);

    const classes = useStyles({} as ImageLoader);
    const verify = React.useCallback(
      (type: SocialHandleType): (() => void) => {
        return (): void => {
          if (type === SocialHandleType.Twitter) {
            const close = modal.show(
              <TwitterVerificationModal
                starname={starname}
                handle={store.value}
                onClose={(): void => close()}
                onVerified={(result: SocialHandleVerification): void => {
                  const resource: Resource = {
                    uri: "social:" + type,
                    resource: store.value,
                  };
                  if (result.url === null)
                    throw new Error("must have a verification url");
                  onUpdateResource(type, result, resource);
                  store.setVerified(result.verified);
                  checkSocialClaim();
                  close();
                }}
              />,
            );
          } else if (type === SocialHandleType.Instagram) {
            const close = modal.show(
              <InstagramVerificationModal
                starname={starname}
                handle={store.value}
                onClose={(): void => close()}
                onVerified={(result: SocialHandleVerification): void => {
                  const resource: Resource = {
                    uri: "social:" + type,
                    resource: store.value,
                  };
                  if (result.url === null)
                    throw new Error("must have a verification url");
                  onUpdateResource(type, result, resource);
                  store.setVerified(result.verified);
                  checkSocialClaim();
                  close();
                }}
              />,
            );
          }
        };
      },
      [starname, store, onUpdateResource, checkSocialClaim],
    );

    const checkForFeedback = React.useCallback(
      (value: string): void => {
        if (value !== "" && !validResourceRegExp.test(value)) {
          setError("Invalid Input");
        } else setError("");
      },
      [validResourceRegExp],
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { value } = event.target;
        // Update the state variable
        const cleanValue = value.replace(/@*/g, "").toLowerCase();
        // Update current value in the store
        store.setValue(cleanValue);
        // now lets validate value for feedback
        checkForFeedback(cleanValue);
        // If it's not verifiable then
        // we put it right away
        onUpdateResource(
          type,
          { verified: !verifiable, url: null },
          {
            uri: "social:" + type,
            resource: cleanValue,
          },
        );
      },
      [checkForFeedback, onUpdateResource, store, type, verifiable],
    );

    const shouldDisableVerify = (): boolean => {
      if (loading) return true;
      if (claimResult) {
        if (claimResult.err) return false;
        return claimResult.verified;
      }
      return !store.canBeVerified;
    };

    return (
      <Block key={type} className={classes.field}>
        <Typography className={classes.defaultInputLabel} variant={"subtitle1"}>
          {SocialLabels[type]}{" "}
          {type === SocialHandleType.Website ? "" : "Handle"}
        </Typography>
        <Block display={"flex"} alignItems={"center"}>
          <OutlinedInput
            startAdornment={startAdornment}
            endAdornment={
              loading ? (
                <CircularProgress size={16} />
              ) : claimResult && !claimResult.verified ? (
                <Tooltip
                  title={
                    claimResult.err
                      ? locales.CANT_FIND_CLAIM
                      : locales.CANT_VERIFY_REVERIFY_CLAIM
                  }
                >
                  <ErrorOutline color="error" />
                </Tooltip>
              ) : props.verifiable && store.verified ? (
                <img
                  src={checkMarkIcon}
                  width={20}
                  height={20}
                  alt={"verified icon"}
                />
              ) : undefined
            }
            classes={{ root: classes.defaultInput }}
            value={store.value}
            onChange={onChange}
            disabled={disabled}
          />
          {props.verifiable ? (
            <Button
              className={classes.verifyButton}
              color={"primary"}
              disabled={shouldDisableVerify()}
              onClick={verify(props.type)}
            >
              {store.verified ? locales.REVERIFY : locales.VERIFY}
            </Button>
          ) : null}
        </Block>
        {props.verifiable && !store.verified && !store.empty ? (
          <FormHelperText error={true}>
            {locales.YOU_MUST_VERIFY_YOUR_ACCOUNT}
          </FormHelperText>
        ) : null}
        <FormHelperText error={!!error}>{error}</FormHelperText>
      </Block>
    );
  },
);
