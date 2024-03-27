import "./style.scss";

import {
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { DatePicker } from "@mui/x-date-pickers";
import { Block } from "components/block";
import InputWithSelect from "components/InputWithSelect";
import config from "config";
import strings from "locales/strings";
import { CurrencyTypes, EscrowStoreContext } from "mobx/stores/escrowStore";
import { observer } from "mobx-react";
import React from "react";

import EscrowFormContainer from "../EscrowFormContainer";

const CreateEscrowForm = observer((): React.ReactElement => {
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

  return (
    <EscrowFormContainer
      title={
        <Block>
          <Typography variant="h4" gutterBottom>
            {strings.STARNAME_ESCROW_SETUP}
          </Typography>
          {store.currency !== "iov" && (
            <Alert severity="warning">{strings.PRICE_CONVERSION_WARNING}</Alert>
          )}
        </Block>
      }
    >
      <Block className="create-escrow-amount-container">
        <Block marginBottom={6} width={"100%"}>
          <Typography variant={"subtitle2"}>
            {strings.SET_PRICE_FOR_STARNAME}
          </Typography>
        </Block>
        <Block>
          <InputWithSelect
            selectComponent={
              <Select
                disabled={store.priceConversionObject === null}
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
      </Block>
      <Block className="create-escrow-deadline-container">
        <Block marginBottom={6} width={"100%"}>
          <Typography variant={"subtitle2"}>{strings.SET_DEADLINE}</Typography>
        </Block>
        <DatePicker
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
  );
});

export default CreateEscrowForm;
