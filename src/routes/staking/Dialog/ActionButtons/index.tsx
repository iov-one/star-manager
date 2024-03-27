import { Select, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/styles";
import locales from "locales/strings";
import { DelegationStoreContext } from "mobx/stores/delegationStore";
import { observer } from "mobx-react";
import React from "react";
import { DelegationActions } from "types/delegationActions";

const useStyles = makeStyles(() => ({
  select: {
    display: "flex",
    alignItems: "center",
    height: 45,
  },
}));

const actions = Array<DelegationActions>(
  DelegationActions.DELEGATE,
  DelegationActions.UNDELEGATE,
  DelegationActions.REDELEGATE,
);

interface ActionButtonsProps {
  onDelegate: () => void;
  onUnDelegate: () => void;
  onRedelegate: () => void;
  loading: boolean;
}

const ActionButtons = observer(
  ({
    onDelegate,
    onUnDelegate,
    onRedelegate,
    loading,
  }: ActionButtonsProps): React.ReactElement => {
    const store = React.useContext(DelegationStoreContext);
    const classes = useStyles();

    const hasDelegations = store.totalStaked.amount > 0;

    const handleActionChange = (
      event: React.ChangeEvent<{ value: unknown }>,
    ): void => {
      store.setCurrentAction(event.target.value as DelegationActions);
    };

    const handleContinue = (): void => {
      switch (store.currentAction) {
        case DelegationActions.DELEGATE:
          onDelegate();
          break;
        case DelegationActions.REDELEGATE:
          onRedelegate();
          break;
        case DelegationActions.UNDELEGATE:
          onUnDelegate();
          break;
        default:
          return;
      }
    };

    return (
      <>
        <Select
          fullWidth
          value={store.currentAction}
          onChange={handleActionChange}
          disabled={loading}
          classes={{ outlined: classes.select }}
        >
          {actions.map((action) => (
            <MenuItem
              key={action}
              value={action}
              disabled={
                action === DelegationActions.DELEGATE
                  ? store.currentValidator !== null
                    ? store.currentValidator.jailed
                    : false
                  : !hasDelegations
              }
            >
              {action === DelegationActions.DELEGATE &&
              store.currentValidator !== null &&
              store.currentValidator.jailed ? (
                <Typography
                  style={{ fontStyle: "italic" }}
                  color="textSecondary"
                >
                  Delegations disabled (Jailed validator)
                </Typography>
              ) : (
                action
              )}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant={"contained"}
          color={"primary"}
          disabled={!store.validateForm || loading}
          onClick={handleContinue}
        >
          {locales.CONTINUE}
        </Button>
      </>
    );
  },
);

export default ActionButtons;
