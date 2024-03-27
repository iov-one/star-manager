import { OutlinedInput, Theme, Typography } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import { makeStyles } from "@material-ui/styles";
import { Block } from "components/block";
import config from "config";
import locales from "locales/strings";
import strings from "locales/strings";
import { DelegationStoreContext } from "mobx/stores/delegationStore";
import { observer } from "mobx-react";
import React from "react";
import { DelegationActions } from "types/delegationActions";
import { Validator } from "types/delegationValidator";

import RedelegationSelect from "./RedelegationSelect";

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  grid: {
    marginLeft: theme.spacing(4),
  },
  contentHeader: {
    fontWeight: "bold",
  },
  dialog: {
    margin: theme.spacing(1),
  },
  dialogActions: {
    marginTop: theme.spacing(2),
  },
  amountInput: {
    marginTop: theme.spacing(2),
  },
  adorment: {
    marginLeft: theme.spacing(1),
  },
  bottomContent: {
    marginTop: theme.spacing(2),
  },
  redelegationDetails: {
    marginTop: theme.spacing(2),
  },
  alert: {
    marginBottom: theme.spacing(2),
  },
}));

interface ContentProps {
  inputOnChange: (value: string) => void;
}

const Content = observer(({ inputOnChange }: ContentProps) => {
  const store = React.useContext(DelegationStoreContext);
  const classes = useStyles();

  const ValidatorDetails = (validator: Validator): React.ReactElement => {
    return (
      <>
        <Typography className={classes.contentHeader} display={"block"}>
          {locales.VALIDATOR_COMMISSION}
        </Typography>
        <Typography>
          {"Rate - " +
            parseFloat(validator.commission.commission_rates.rate) * 100 +
            "%"}
        </Typography>
        {validator.description.details.length > 0 ? (
          <>
            <br />
            <Typography className={classes.contentHeader} display={"block"}>
              {locales.DESCRIPTION}
            </Typography>
            <Typography>{validator.description.details}</Typography>
          </>
        ) : null}
      </>
    );
  };

  const TopContent = (): React.ReactElement => {
    switch (store.currentAction) {
      case DelegationActions.DELEGATE:
        return (
          <>
            <Alert
              className={classes.alert}
              variant={"outlined"}
              severity={"warning"}
            >
              <AlertTitle>{locales.DELEGATION_ALERT_WARNING_TITLE}</AlertTitle>
              {locales.DELEGATION_ALERT_WARNING}
            </Alert>
            {store.currentValidator && ValidatorDetails(store.currentValidator)}
          </>
        );
      case DelegationActions.UNDELEGATE:
        return (
          <>
            <Alert
              className={classes.alert}
              variant={"outlined"}
              severity={"warning"}
            >
              <AlertTitle>{locales.ATTENTION}</AlertTitle>
              {locales.UNDELEGATE_ALERT_WARNING}
            </Alert>
            <Alert
              className={classes.alert}
              variant={"outlined"}
              severity={"info"}
            >
              <AlertTitle>
                {locales.UNDELEGATE_ALERT_SUGGESTION_TITLE}
              </AlertTitle>
              {locales.UNDELEGATE_ALERT_SUGGESTION}
            </Alert>
            {store.currentValidator && ValidatorDetails(store.currentValidator)}
          </>
        );
      case DelegationActions.REDELEGATE:
        return (
          <>
            <Alert
              className={classes.alert}
              variant={"outlined"}
              severity={"info"}
            >
              <AlertTitle>{locales.ATTENTION}</AlertTitle>
              {locales.REDELEGATION_ALERT_CONTENT}
            </Alert>
            <RedelegationSelect />
            <div className={classes.redelegationDetails}>
              {store.destinationValidator
                ? ValidatorDetails(store.destinationValidator)
                : null}
            </div>
          </>
        );
    }
  };

  return store.currentValidator ? (
    <>
      {TopContent()}
      <div className={classes.bottomContent}>
        <Block
          display={"flex"}
          justifyContent={"space-between"}
          className={classes.bottomContent}
        >
          <Typography className={classes.contentHeader}>
            {store.delegationTypeMessage}
          </Typography>
          <Typography color={"primary"}>{store.currentDelegation}</Typography>
        </Block>
        <div className={classes.amountInput}>
          <OutlinedInput
            autoFocus={true}
            endAdornment={
              <Typography className={classes.adorment} color={"primary"}>
                {config.mainAsset.symbol}
              </Typography>
            }
            placeholder={"0.00"}
            type={"number"}
            error={!store.validateAmount}
            fullWidth={true}
            inputProps={{ style: { textAlign: "right" } }}
            value={store.amountString}
            required={true}
            onChange={(e) => inputOnChange(e.target.value)}
          />
          {store.currentAction === DelegationActions.DELEGATE && (
            <Block
              display={"flex"}
              justifyContent={"flex-end"}
              marginTop={"8px"}
            >
              <Typography color="textSecondary">
                {strings.AVAILABLE}: {store.userBalance.format(true)}
              </Typography>
            </Block>
          )}
        </div>
      </div>
    </>
  ) : (
    <React.Fragment />
  );
});

export default Content;
