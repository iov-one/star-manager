import {
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Block } from "components/block";
import { TokenLike } from "config";
import { useNumericInput } from "hooks/useNumericInput";
import locales from "locales/strings";
import React from "react";
import { Amount } from "types/amount";

interface Props {
  readonly value: number | null;
  readonly balances: ReadonlyArray<Amount>;
  readonly disabled: boolean;
  readonly onTokenSelectionControl: (token: TokenLike) => Promise<void>;
  readonly onChange: (value: number) => void;
}

const useStyles = makeStyles({
  select: {
    width: 62,
    paddingRight: 0,
    // FIXME: Horrible temporary solution
    "& .MuiSelect-outlined": {
      paddingRight: 0,
    },
    // FIXME: Horrible temporary solution
    "& .MuiSelect-select": {
      paddingRight: 0,
    },
  },
});

export const AmountInput: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { value: defaultValue, balances } = props;
  const coins: Amount[] = [...balances].sort();
  const [selectedCoin, setSelectedCoin] = React.useState<Amount | undefined>();
  const format = React.useCallback((value: number | null): string => {
    if (value === null || isNaN(value)) return "";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }, []);
  const [value, setValue] = React.useState<number | null>(defaultValue);
  const token: TokenLike | null = React.useMemo<TokenLike | null>(
    () => (selectedCoin ? selectedCoin.token : null),
    [selectedCoin],
  );
  const inputRef = useNumericInput(
    token === null ? 0 : Math.log10(token.subunitsPerUnit),
    selectedCoin === undefined ? 0 : selectedCoin.getFractionalValue(),
    value,
    props.onChange,
  );
  const classes = useStyles();
  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);
  // When coins get populated make the first one in the
  // list selected
  React.useEffect(() => {
    if (coins.length === 0) return;
    setSelectedCoin(coins[0]);
  }, [coins]);
  const onSelectionChanged = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ): void => {
    const { value } = event.target;
    if (typeof value === "string") {
      setSelectedCoin(
        balances.find(({ token }: Amount): boolean => token.ticker === value),
      );
    }
  };
  const disabled = React.useMemo<boolean>(
    (): boolean => props.disabled || balances.length === 0,
    [props.disabled, balances],
  );

  return (
    <Block width={"100%"} display={"flex"} flexDirection={"column"}>
      <Block width={"100%"} marginBottom={8}>
        <Typography color={"textPrimary"} variant={"subtitle2"}>
          {locales.AMOUNT}
        </Typography>
      </Block>
      <Block display={"flex"} alignItems={"center"}>
        <Block flex={1}>
          <TextField
            placeholder={format(0)}
            inputRef={inputRef}
            disabled={disabled}
            fullWidth={true}
            margin={"none"}
          />
        </Block>
        <Block width={16} />
        <Block>
          <Select
            value={selectedCoin ? selectedCoin.token.ticker : ""}
            className={classes.select}
            onChange={onSelectionChanged}
            disabled={disabled}
          >
            {coins.map(({ token }: Amount): React.ReactElement => {
              return (
                <MenuItem key={token.ticker} value={token.ticker}>
                  {token.ticker}
                </MenuItem>
              );
            })}
          </Select>
        </Block>
      </Block>
      <FormHelperText>
        {selectedCoin
          ? locales.SHOW_BALANCE + selectedCoin.format()
          : locales.NO_BALANCE}
      </FormHelperText>
    </Block>
  );
};

export default AmountInput;
