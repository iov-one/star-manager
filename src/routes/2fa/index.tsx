import "./style.scss";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Link,
  OutlinedInput,
  Paper,
} from "@material-ui/core";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { LoadingButton } from "@mui/lab";
import { Button as MuiButton } from "@mui/material";
import { message } from "antd";
import copyToClipboard from "clipboard-copy";
import { Block } from "components/block";
import { LoadingView } from "components/LoadingView";
import toast, { ToastType } from "components/toast";
import { useErrorTimeout } from "hooks/useErrorTimeout";
import { useGoogle2FA } from "hooks/useGoogle2fa";
import {
  TwoFactorAuthenticationInitSteps,
  TwoFactorAuthInit,
  TwoFactorAuthRemoval,
} from "locales/componentStrings";
import strings from "locales/strings";
import qrcode from "qrcode";
import React from "react";
import { useHistory, withRouter } from "react-router";
import { Register2faData } from "types/twoFactorAuthGoogle";

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(1),
  },
}));

enum Steps {
  INTRO,
  SCAN_QR,
  VERIFY_TOKEN,
  SAVE_SECRET_NOTE,
}

const getSteps = (): ReadonlyArray<string> => {
  return TwoFactorAuthenticationInitSteps;
};

const Manage2fa = (): React.ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [hasEnabled2fa, setHasEnabled2fa] = React.useState<boolean | null>(
    null,
  );

  const [deactivate2faModal, setDeactivate2faModal] =
    React.useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [token, setToken] = React.useState<string>("");
  const [register2FAData, setRegister2FAData] = React.useState<Register2faData>(
    {} as Register2faData,
  );
  const [qrData, setQrData] = React.useState<string | null>(null);
  const steps = getSteps();

  const { check2faUser, register2faUser, verify2faUser, remove2faUser } =
    useGoogle2FA();
  const [invalidTokenError, setInvalidTokenError] = useErrorTimeout();

  const registerFor2FA = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await register2faUser();
      setLoading(false);
      if (response) {
        setRegister2FAData(response);
      }
      handleNext();
    } catch (error) {
      console.warn(error);
    }
  };

  const verifyFor2FA = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await verify2faUser(token);
      setLoading(false);
      if (response) {
        if (response.verified) {
          handleNext();
        } else setInvalidTokenError(strings.INVALID_TOKEN_TRY_AGAIN);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const handleTurnOff2fa = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await remove2faUser(token);
      setLoading(false);
      if (response) {
        if (response.removed) {
          toast.show(
            strings.TWO_FACTOR_AUTH_REMOVAL_SUCCESS,
            ToastType.Success,
          );
          goBack();
        } else if (response.error) {
          setInvalidTokenError(response.error);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinish = (): void => {
    toast.show(strings.TWO_FACTOR_AUTH_ENABLE_SUCCESS, ToastType.Success);
    goBack();
  };

  const handleNext = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const goBack = (): void => {
    history.goBack();
  };

  const onTokenChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    if (event.target.value.length > 6) return;
    setToken(event.target.value);
  };

  const stepActionHandler = async (): Promise<void> => {
    switch (activeStep) {
      case Steps.INTRO:
        return registerFor2FA();
      case Steps.SCAN_QR:
        return handleNext();
      case Steps.VERIFY_TOKEN:
        return verifyFor2FA();
      case Steps.SAVE_SECRET_NOTE:
        return handleFinish();
    }
  };

  React.useEffect(() => {
    if (initialized) return;
    check2faUser().then((response) => {
      if (response) {
        setInitialized(true);
        setHasEnabled2fa(response.result);
      }
    });
  }, [check2faUser, initialized]);

  React.useEffect(() => {
    if (activeStep !== Steps.SCAN_QR || !register2FAData.authurl) return;
    setLoading(true);
    qrcode
      .toDataURL(register2FAData.authurl)
      .then(setQrData)
      .catch(console.warn)
      .finally(() => {
        setLoading(false);
      });
  }, [activeStep, register2FAData.authurl]);

  const getStepContent = (): React.ReactNode => {
    switch (activeStep) {
      case Steps.INTRO:
        return (
          <Block>
            <Typography gutterBottom={true}>
              {TwoFactorAuthInit.INTRO.primary}
            </Typography>
            <Typography gutterBottom={true}>
              {TwoFactorAuthInit.INTRO.secondary}
            </Typography>
          </Block>
        );
      case Steps.SCAN_QR: {
        return (
          <Block className={"qr-content-container"}>
            <Typography>
              {TwoFactorAuthInit.QR.primary}{" "}
              <Link underline={"none"} href={"https://authy.com/download/"}>
                Authy
              </Link>
              ,{" "}
              <Link
                underline={"none"}
                href={"https://www.microsoft.com/en-us/account/authenticator/"}
              >
                Microsoft Authenticator
              </Link>
            </Typography>
            <Block>
              {qrData && register2FAData.secret ? (
                <Block>
                  <img src={qrData} alt={"qrcode"} width={256} height={256} />
                  <Block className={"secret-container"}>
                    <span>Secret: {register2FAData.secret}</span>
                    <img
                      src={"/assets/copy.svg"}
                      alt={"copy icon"}
                      onClick={(): void => {
                        copyToClipboard(register2FAData.secret)
                          .then((): void => {
                            void message.success("Copied to clipboard!");
                          })
                          .catch((): void => {
                            void message.error("Sorry, could not copy");
                          });
                      }}
                    />
                  </Block>
                </Block>
              ) : (
                <FormHelperText error={true}>
                  {strings.ERROR_GENERATING_QR}
                </FormHelperText>
              )}
            </Block>
          </Block>
        );
      }
      case Steps.VERIFY_TOKEN: {
        return (
          <Block className={"verify-token-container"}>
            <Typography gutterBottom={true}>
              {TwoFactorAuthInit.VERIFY.primary}
            </Typography>
            <Block className={"input-container"}>
              <OutlinedInput
                autoFocus={true}
                placeholder={"Enter token here"}
                fullWidth={true}
                type={"number"}
                value={token}
                onChange={onTokenChange}
              />
              <FormHelperText error={!!invalidTokenError}>
                {invalidTokenError}
              </FormHelperText>
            </Block>
          </Block>
        );
      }
      case Steps.SAVE_SECRET_NOTE:
        return (
          <Block className={"save-secret-note-container"}>
            <Typography gutterBottom={true}>
              {TwoFactorAuthInit.SAVE_SECRET.primary}
            </Typography>
            <Block className={"secret-container"}>
              <Typography>{register2FAData.secret}</Typography>
            </Block>
            <Typography style={{ fontStyle: "italic" }} align={"center"}>
              {TwoFactorAuthInit.SAVE_SECRET.secondary}
            </Typography>
          </Block>
        );
    }
    return <React.Fragment />;
  };

  return hasEnabled2fa === null ? (
    <LoadingView />
  ) : hasEnabled2fa === false ? (
    <Block className={"container"}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Block className={"outer-content-container"}>
        <Block className={"buttons-container"}>
          <Button
            disabled={
              activeStep === Steps.INTRO ||
              activeStep === Steps.SAVE_SECRET_NOTE
            }
            onClick={handleBack}
            className={classes.button}
          >
            {strings.BACK}
          </Button>

          <LoadingButton
            variant="contained"
            color="primary"
            loading={loading}
            loadingPosition={"center"}
            onClick={stepActionHandler}
            className={classes.button}
            disabled={
              activeStep === Steps.VERIFY_TOKEN && token.length === 0
                ? true
                : false
            }
          >
            {activeStep === steps.length - 1 ? strings.DONE : strings.NEXT}
          </LoadingButton>
        </Block>
        <Paper className={"content-container"}>{getStepContent()}</Paper>
      </Block>
    </Block>
  ) : (
    <Block className={"container"}>
      <Card>
        <CardContent>
          <Typography>{TwoFactorAuthRemoval.INTRO}</Typography>
        </CardContent>
        <CardActions>
          <MuiButton
            size={"large"}
            variant={"contained"}
            color={"error"}
            onClick={() => setDeactivate2faModal(true)}
          >
            {strings.TURN_OFF_2FA}
          </MuiButton>
          <MuiButton onClick={goBack}>{strings.GO_BACK}</MuiButton>
        </CardActions>
      </Card>
      <Dialog
        open={deactivate2faModal}
        onClose={() => setDeactivate2faModal(false)}
      >
        <DialogTitle>{strings.REMOVE_TWO_FACTOR_AUTH}</DialogTitle>
        <DialogContent>
          <Typography>{TwoFactorAuthRemoval.PROVIDE_TOKEN}</Typography>
          <Block marginTop={"2%"}>
            <OutlinedInput
              type={"number"}
              value={token}
              placeholder={"Token here"}
              onChange={onTokenChange}
            />
            <FormHelperText error={!!invalidTokenError}>
              {invalidTokenError}
            </FormHelperText>
          </Block>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            variant={"contained"}
            color={"error"}
            loading={loading}
            loadingPosition={"center"}
            onClick={handleTurnOff2fa}
          >
            {strings.DEACTIVATE_2FA}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Block>
  );
};

export default withRouter(Manage2fa);
