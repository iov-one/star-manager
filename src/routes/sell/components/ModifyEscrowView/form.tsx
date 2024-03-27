import "./style.scss";

import {
  FormHelperText,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Restore } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { Chip } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Block } from "components/block";
import InputWithSelect from "components/InputWithSelect";
import { LoadingView } from "components/LoadingView";
import config from "config";
import { ERROR_HTML_COLOR } from "genericConstants";
import strings from "locales/strings";
import { CurrencyTypes, EscrowStoreContext } from "mobx/stores/escrowStore";
import { observer } from "mobx-react";
import { EscrowState } from "proto/iov/escrow/v1beta1/types";
import React from "react";

import EscrowFormContainer from "../EscrowFormContainer";

const ModifyEscrowForm = observer((): React.ReactElement => {
  const store = React.useContext(EscrowStoreContext);

  const [amountError, setAmountError] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (store.amountString === "") return;
    setAmountError(!store.isValidAmount);
  }, [store.amountString]);

  const onCurrencyChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ): void => {
    store.setCurrency(event.target.value as CurrencyTypes);
  };

  return store.escrow === null ? (
    // though it can be some error screen as well
    // but we are sure it will be there
    <LoadingView />
  ) : (
    <Block>
      <EscrowFormContainer
        title={
          <Block>
            <Block className="modify-escrow-title-container">
              <Block className="modify-escrow-heading">
                {store.escrowState === EscrowState.ESCROW_STATE_OPEN ? (
                  <Typography variant="h4">
                    {strings.MODIFY_ESCROW_HEADER}
                  </Typography>
                ) : (
                  <Chip
                    style={{
                      backgroundColor: ERROR_HTML_COLOR,
                      borderRadius: 4,
                      color: "white",
                      fontSize: "medium",
                    }}
                    label={strings.ESCROW_EXPIRED}
                  />
                )}
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  #{store.escrow.id.toUpperCase()}
                </Typography>
              </Block>
              <Tooltip title={strings.ESCROW_RESET}>
                <IconButton
                  disabled={store.escrowState !== EscrowState.ESCROW_STATE_OPEN}
                  onClick={() => store.resetEscrowState()}
                >
                  <Restore />
                </IconButton>
              </Tooltip>
            </Block>
            {store.currency !== "iov" && (
              <Alert severity="warning">
                {strings.PRICE_CONVERSION_WARNING}
              </Alert>
            )}
          </Block>
        }
      >
        <Block className="modify-escrow-seller-container">
          <Block marginBottom={6} width={"100%"}>
            <Typography variant={"subtitle2"}>
              {strings.STARNAME_SELLER}
            </Typography>
          </Block>
          <TextField
            disabled={store.escrowState !== EscrowState.ESCROW_STATE_OPEN}
            value={store.addressOrStarname}
            error={!!store.error}
            onChange={(e) => store.setAddressOrStarname(e.target.value)}
            placeholder={strings.STARNAME_OR_ADDRESS}
          />
          {store.error && (
            <FormHelperText error={true}>{store.error}</FormHelperText>
          )}
        </Block>
        <Block className="modify-escrow-amount-container">
          <Block marginBottom={6} width={"100%"}>
            <Typography variant={"subtitle2"}>{strings.SELL_PRICE}</Typography>
          </Block>
          <InputWithSelect
            disabled={store.escrowState !== EscrowState.ESCROW_STATE_OPEN}
            selectComponent={
              <Select
                disabled={
                  store.escrowState !== EscrowState.ESCROW_STATE_OPEN ||
                  store.priceConversionObject === null
                }
                onChange={onCurrencyChange}
                value={store.currency}
              >
                <MenuItem value={"iov"}>{config.mainAsset.symbol}</MenuItem>
                <MenuItem value={"usd"}>USD</MenuItem>
                <MenuItem value={"eur"}>EUR</MenuItem>
              </Select>
            }
            startAdornment={
              <InputAdornment position="start">{strings.AMOUNT}</InputAdornment>
            }
            error={amountError}
            type="number"
            value={store.amountString}
            onChange={(e) => store.setAmountString(e.target.value)}
            placeholder={"ex. 110"}
          />
          {store.amountValue > 0 && store.currency !== "iov" && (
            <FormHelperText>{`≈ ${store.amount.format(true)}`}</FormHelperText>
          )}
          {amountError && (
            <FormHelperText error={amountError}>
              {strings.INVALID_AMOUNT}
            </FormHelperText>
          )}
        </Block>
        <Block className="modify-escrow-deadline-container">
          <Block marginBottom={6} width={"100%"}>
            <Typography variant={"subtitle2"}>{strings.DEADLINE}</Typography>
          </Block>
          <DatePicker
            disabled={store.escrowState !== EscrowState.ESCROW_STATE_OPEN}
            value={store.deadline}
            onChange={(v) => store.setDeadline(v)}
            minDate={store.minDate}
            maxDate={store.maxDate}
            disablePast
            inputFormat="dd/MM/yyyy"
            renderInput={(props) => <TextField {...(props as any)} />}
          />
        </Block>
      </EscrowFormContainer>
    </Block>
  );
});

export default ModifyEscrowForm;
