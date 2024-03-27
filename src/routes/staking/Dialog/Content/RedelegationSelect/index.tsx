import {
  Avatar,
  Grid,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import locales from "locales/strings";
import { DelegationStoreContext } from "mobx/stores/delegationStore";
import { observer } from "mobx-react";
import React from "react";
import { Validator } from "types/delegationValidator";

const useStyles = makeStyles((theme: Theme) => ({
  name: {
    marginLeft: theme.spacing(2),
  },
  grid: {
    padding: theme.spacing(0.5),
  },
  noneItem: {
    padding: theme.spacing(1),
    fontStyle: "italic",
    opacity: 0.7,
  },
}));

const RedelegationSelect = observer((): React.ReactElement => {
  const store = React.useContext(DelegationStoreContext);
  const classes = useStyles();

  const handleSelectChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ): void => {
    store.setDestinationValidator(event.target.value as string);
  };

  return (
    <Select
      value={
        store.destinationValidator
          ? store.destinationValidator.operator_address
          : ""
      }
      onChange={handleSelectChange}
      displayEmpty
      fullWidth
    >
      <MenuItem value={""} disabled>
        <Typography className={classes.noneItem}>
          {locales.SELECT_NEW_VALIDATOR}
        </Typography>
      </MenuItem>
      {store.validators.map((validator: Validator) => {
        if (
          validator.operator_address ===
          store.currentValidator?.operator_address
        )
          return null;
        return (
          <MenuItem
            key={validator.description.identity}
            value={validator.operator_address}
          >
            <Grid
              className={classes.grid}
              container
              direction={"row"}
              alignItems={"center"}
            >
              <Grid item>
                <Avatar
                  src={store.validatorsLogos[validator.description.identity]}
                />
              </Grid>
              <Grid className={classes.name} item>
                <Typography>{validator.description.moniker}</Typography>
              </Grid>
            </Grid>
          </MenuItem>
        );
      })}
    </Select>
  );
});

export default RedelegationSelect;
