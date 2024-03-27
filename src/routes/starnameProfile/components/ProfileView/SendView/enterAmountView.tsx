import assetsStarname from "@iov/asset-directory";
import {
  createTheme,
  Grid,
  Input,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Theme,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import api from "api";
import config from "config";
import React, { useCallback } from "react";
import { useHistory, useParams } from "react-router";
import { AccountInfo } from "types/profile";
import { Resource } from "types/resourceInfo";

import { getImage, getSymbol } from "../../GetStarnameProfile/helper";
import { AboutMeComponent } from "../AboutMe";
import {
  CoinGeckoCoin,
  getCoinsList,
  getConversionCoinGeckoPrice,
  Task,
} from "../coinGeckoConversion";
import { NameStarnameHeading } from "./nameStarnameHeading";
import ProfileWithNoInfo from "./profileWithNoInfo";
import { SUPPORTED_CURRENCIES } from "./supportedCurrencies";

interface Props {
  readonly accountData: AccountInfo | null;
  readonly starname: string;
}

enum CurrencyType {
  Crypto,
  Fiat,
}

enum RoundOperation {
  Multiply,
  Divide,
}

export const FAVORITE_ASSET_URI = "favorite:asset";

const theme: Theme = createTheme({
  typography: {
    subtitle2: {
      fontFamily: "DIN, sans-serif",
      fontWeight: 500,
      fontSize: 28,
      lineHeight: "36.4px",
    },
  },
  overrides: {
    MuiInputBase: {
      input: {
        fontFamily: "DIN, sans-serif",
        fontWeight: 500,
        fontSize: 15,
        lineHeight: "36.4px",
      },
    },
  },
});
const clamp = (number: number, min: number, max: number): number => {
  return Math.max(min, Math.min(number, max));
};

const validUris: ReadonlyArray<string> = assetsStarname.map(
  (assetStarname: any) => assetStarname["starname-uri"],
);

const onlyValidUris = (resource: Resource): boolean => {
  const { uri } = resource;
  if (uri.startsWith("empty")) return true;
  // FIXME: this is a very basic validation, ideally we would want to make
  //        completely sure it's completely validated
  if (!uri.includes(":")) return false;
  return validUris.includes(uri);
};

export const EnterAmountView: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { currency } = useParams<{ currency: string }>();
  const assets = api.getAssets();
  const conversionValueLoading = "Loading...";
  const conversionValueNotFound = "";
  const history = useHistory();
  const { accountData, starname } = props;
  const [amount, setAmount] = React.useState<string>("");
  const [fiatAmount, setFiatAmount] = React.useState<string>("");
  const [localeCurrency, setLocaleCurrency] = React.useState<string>("USD");
  const [currentEditingField, setCurrentEditingField] =
    React.useState<CurrencyType>(CurrencyType.Crypto);
  const [currentCurrency, setCurrentCurrency] = React.useState<string>("");
  const [conversionPrice, setConversionPrice] = React.useState<number>(-1);
  const [inputWidth, setInputWidth] = React.useState<number>(50);
  const [inputFontSize, setInputFontSize] = React.useState<number>(100);
  const [gettingConversionValue, setGettingConversionValue] =
    React.useState<boolean>(true);
  const [conversionValueStatus, setConversionValueStatus] =
    React.useState<string>(conversionValueLoading);
  const [coinList, setCoinList] = React.useState<ReadonlyArray<CoinGeckoCoin>>(
    [],
  );
  const [resources, setResources] =
    React.useState<ReadonlyArray<Resource> | null>(null);
  const [showableProfile, setShowableProfile] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (
      accountData &&
      accountData.resources &&
      accountData.resources.length > 0
    )
      setShowableProfile(true);
  }, [accountData]);

  const filtered = React.useMemo((): ReadonlyArray<Resource> | null => {
    if (resources === null) return null;
    return resources.filter(onlyValidUris);
  }, [resources]);

  const preferredAsset: string | null = React.useMemo((): string | null => {
    if (resources === null) return null;
    const found: Resource | undefined = resources.find(
      (resource: Resource): boolean => resource.uri === FAVORITE_ASSET_URI,
    );
    if (found) {
      return found.resource;
    } else if (resources.length > 0) {
      const first: Resource = resources[0];
      return first.resource;
    } else {
      return null;
    }
  }, [resources]);

  React.useEffect((): void => {
    if (filtered === null) return;
    const resource: Resource | undefined = filtered.find(
      (resource: Resource): boolean => {
        if (preferredAsset === null) {
          return true;
        }
        return resource.uri === preferredAsset;
      },
    );
    if (resource !== undefined) {
      setCurrentCurrency(getSymbol(resource.uri));
    } else {
      const fallback: Resource | undefined = filtered.find((): boolean => true);
      if (fallback !== undefined) {
        setCurrentCurrency(getSymbol(fallback.uri));
      }
    }
  }, [currency, filtered, preferredAsset]);

  // this should be at the end
  // in order to make changes at very end if currency is in url param
  React.useEffect(() => {
    // prefer url param currency first
    if (!currency || !filtered) return;
    const found = filtered.find(
      (res) => getSymbol(res.uri).toUpperCase() === currency.toUpperCase(),
    );
    if (found) {
      setCurrentCurrency(getSymbol(found.uri));
    }
  }, [currency, filtered]);

  React.useEffect((): (() => void) => {
    const task: Task<ReadonlyArray<CoinGeckoCoin>> = getCoinsList();
    // FIXME: show initialization thing
    task
      .execute()
      .then(setCoinList)
      .catch((error: any): void => {
        if (error instanceof DOMException) {
          if (error.name !== "AbortError") {
            console.warn(error);
          }
        } else {
          console.warn(error);
        }
      });
    return task.abort;
  }, [showableProfile]);

  React.useEffect((): (() => void) | void => {
    if (currentCurrency === "" || assets.length === 0) return;
    setGettingConversionValue(true);
    setConversionValueStatus(conversionValueLoading);
    const task: Task<number> = getConversionCoinGeckoPrice(
      coinList,
      currentCurrency,
      localeCurrency,
    );
    task
      .execute()
      .then((price: number): void => {
        if (price !== -1) {
          setConversionPrice(price);
        }
      })
      .catch((error: any): void => {
        if (error instanceof DOMException) {
          if (error.name !== "AbortError") {
            // setError("Could not download the price");
            console.warn("getting exchange rate: fetch error");
          }
        } else {
          // setError("Could not download the price");
          console.warn("No Matching Coin Found");
        }
        setConversionPrice(-1);
        setConversionValueStatus(conversionValueNotFound);
      })
      .finally((): void => {
        setGettingConversionValue(false);
      });
    return task.abort;
  }, [
    coinList,
    currentCurrency,
    conversionValueNotFound,
    conversionValueLoading,
    localeCurrency,
    assets.length,
  ]);

  const selectChangeHandler = (
    event: React.ChangeEvent<{ name?: string | undefined; value: any }>,
  ): void => {
    const { value } = event.target;
    if (value && typeof value === "string") {
      setCurrentCurrency(value);
    }
  };

  const updateInputDisplay = (length: number): void => {
    if (length < 6) {
      setInputWidth(50);
      setInputFontSize(100);
    } else if (length < 7) {
      setInputWidth(60);
      setInputFontSize(85);
    } else {
      setInputWidth(70);
      setInputFontSize(58);
    }
  };

  const continueHandler = (): void => {
    if (+amount <= 0) return;
    const currentLocation = history.location.pathname;
    const cleanedLocation = currentLocation.endsWith("/")
      ? currentLocation.slice(0, currentLocation.length - 1)
      : currentLocation;
    if (currency) {
      history.push(
        cleanedLocation.replace(currency, `${currentCurrency}/${amount}`),
      );
    } else history.push(`${cleanedLocation}/${currentCurrency}/${amount}`);
  };
  const isValidContinue = (): boolean => {
    return currentCurrency !== "" && amount !== "";
  };

  const getRoundAmount = useCallback(
    (num: number, conversionPrice: number, operation: RoundOperation) => {
      switch (operation) {
        case RoundOperation.Multiply: {
          const result = num * conversionPrice;
          return result.toFixed(2);
        }
        case RoundOperation.Divide: {
          const beforeDecimal = num.toString().split(".")[0].length;
          const result = num / conversionPrice;
          return result.toFixed(clamp(7 - beforeDecimal, 2, 7));
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    updateInputDisplay(amount.length);
  }, [amount]);

  React.useEffect(() => {
    if (currentEditingField === CurrencyType.Crypto) {
      if (amount === "") return;
      setFiatAmount(
        getRoundAmount(
          Number(amount),
          conversionPrice,
          RoundOperation.Multiply,
        ),
      );
    } else {
      if (fiatAmount === "") return;
      setAmount(
        getRoundAmount(
          Number(fiatAmount),
          conversionPrice,
          RoundOperation.Divide,
        ),
      );
    }
  }, [
    amount,
    conversionPrice,
    currentEditingField,
    fiatAmount,
    getRoundAmount,
  ]);

  const amountChangeHandler =
    (code: CurrencyType) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const valueNumber = Number(value);
      if (!isNaN(valueNumber)) {
        if (code === CurrencyType.Crypto) {
          setAmount(value);
          setFiatAmount(
            getRoundAmount(
              valueNumber,
              conversionPrice,
              RoundOperation.Multiply,
            ),
          );
        } else if (code === CurrencyType.Fiat) {
          setAmount(
            getRoundAmount(valueNumber, conversionPrice, RoundOperation.Divide),
          );
          setFiatAmount(value);
        }
      }
    };

  const onLocaleChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: any }>,
  ): void => {
    const { value } = e.target;
    if (value && typeof value === "string") setLocaleCurrency(value);
  };

  return (
    <>
      <NameStarnameHeading accountData={accountData} starname={starname} />
      {showableProfile ? (
        <div className={"enter-amount-section"}>
          <div className={"enter-amount-section-heading"}>
            {"Send money to " +
              (accountData !== null ? accountData.name : starname)}
          </div>
          <div className={"enter-amount-input"}>
            <input
              style={{ width: inputWidth + "%", fontSize: inputFontSize }}
              type="text"
              value={amount}
              onFocus={() => setCurrentEditingField(CurrencyType.Crypto)}
              placeholder={(0).toFixed(2)}
              onChange={amountChangeHandler(CurrencyType.Crypto)}
            />
            <ThemeProvider theme={theme}>
              <Select
                disableUnderline={true}
                value={currentCurrency}
                className={"select-currency"}
                onChange={selectChangeHandler}
              >
                {filtered === null
                  ? null
                  : [...filtered]
                      .sort((a, b) => a.uri.localeCompare(b.uri))
                      .map((item: Resource) => {
                        const { uri } = item;
                        const symbol: string = getSymbol(uri);
                        const icon: string = getImage(uri);
                        return (
                          <MenuItem value={symbol} key={uri}>
                            <div className={"enter-amount-view-currency-item"}>
                              <img
                                src={icon}
                                alt={symbol}
                                className={"select-thumbnail"}
                              />
                              <Typography
                                variant={"subtitle2"}
                                component={"div"}
                              >
                                {symbol}
                              </Typography>
                            </div>
                          </MenuItem>
                        );
                      })}
              </Select>
            </ThemeProvider>
          </div>
          <div className={"enter-amount-localcurrency"}>
            <div className={"loader"}>
              {conversionPrice !== -1 &&
              !gettingConversionValue ? null : conversionValueStatus ===
                "Loading..." ? (
                <LinearProgress />
              ) : (
                // display the error in loading div
                conversionValueStatus
              )}
            </div>
            <Grid
              container
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
              className={"localcurrency-grid"}
            >
              <Grid className={"getting-conversion-symbol"} item>
                {conversionPrice !== -1 && !gettingConversionValue ? "≈" : null}
              </Grid>
              <Grid item>
                <Input
                  disableUnderline={true}
                  startAdornment={
                    <InputLabel
                      className={"input-label"}
                      id="locale-currency-select-label"
                    >
                      <Typography color="primary">{localeCurrency}</Typography>
                    </InputLabel>
                  }
                  onFocus={() => setCurrentEditingField(CurrencyType.Fiat)}
                  type="text"
                  value={fiatAmount}
                  placeholder={(0).toFixed(2)}
                  onChange={amountChangeHandler(CurrencyType.Fiat)}
                />
              </Grid>
              <Grid item>
                <ThemeProvider theme={theme}>
                  <Select
                    labelId={"locale-currency-select-label"}
                    value={localeCurrency}
                    onChange={onLocaleChange}
                    disableUnderline={true}
                  >
                    {SUPPORTED_CURRENCIES.map((item) => (
                      <MenuItem value={item.value} key={item.value}>
                        <Typography color={"textSecondary"}>
                          {item.symbol}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </ThemeProvider>
              </Grid>
            </Grid>
          </div>

          <div className={"enter-amount-continue"}>
            <button disabled={!isValidContinue} onClick={continueHandler}>
              {"Continue"}
            </button>
          </div>
        </div>
      ) : !accountData || !accountData.resources ? (
        <div className="profile-loading-container">
          <LinearProgress />
        </div>
      ) : (
        accountData &&
        accountData.resources.length === 0 && <ProfileWithNoInfo />
      )}
      {accountData && <AboutMeComponent accountData={accountData} />}
    </>
  );
};
