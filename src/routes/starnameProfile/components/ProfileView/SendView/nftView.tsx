import assets from "@iov/asset-directory";
import {
  createTheme,
  MenuItem,
  Select,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import { message } from "antd";
import copyToClipboard from "clipboard-copy";
import { Block } from "components/block";
import strings from "locales/strings";
import React from "react";
import QRGenerator from "react-qr-code";
import { useLocation } from "react-router";
import { AccountInfo } from "types/profile";
import { Resource } from "types/resourceInfo";

import {
  findUriBySymbol,
  getImage,
  getName,
  getSymbol,
} from "../../GetStarnameProfile/helper";
import { MiddleEllipsis } from "../../MiddleEllipsis";
import { AboutMeComponent } from "../AboutMe";
import { NameStarnameHeading } from "./nameStarnameHeading";
import ProfileWithNoInfo from "./profileWithNoInfo";

interface Props {
  readonly accountData: AccountInfo | null;
  starname: string;
}

const theme = createTheme({
  typography: {
    subtitle2: {
      fontFamily: "DIN, sans-serif",
      fontWeight: 500,
      fontSize: 20,
      // lineHeight: "36.4px",
    },
  },
  overrides: {
    MuiOutlinedInput: {
      root: {
        borderRadius: "8px",
      },
      input: {
        padding: "12px",
      },
    },
  },
});

const onlyValidUris = (resource: Resource): boolean => {
  const { uri } = resource;
  if (uri.startsWith("empty")) return true;
  // FIXME: this is a very basic validation, ideally we would want to make
  //        completely sure it's completely validated
  if (!uri.includes(":")) return false;
  return assets.map((asset) => asset["starname-uri"]).includes(uri);
};

const SendNftView = (props: Props): React.ReactElement => {
  const { accountData, starname } = props;
  const { search } = useLocation();

  const query = React.useMemo(() => {
    return new URLSearchParams(search);
  }, [search]);

  const ticker = query.get("ticker");

  const [currentCurrency, setCurrentCurrency] = React.useState<string>("");
  const [isValidTicker, setIsValidTicker] = React.useState<boolean>(false);
  const [qrExpanded, setQrExpanded] = React.useState<boolean>(false);

  const resource: Resource | undefined = React.useMemo(():
    | Resource
    | undefined => {
    if (accountData === null) return undefined;
    const { resources } = accountData;
    if (resources === null) return undefined;
    const uri: string | undefined = findUriBySymbol(currentCurrency);
    if (uri !== undefined) {
      // We should stop it from clicking the button
      return resources.find((each: Resource): boolean => uri === each.uri);
    } else {
      return undefined;
    }
  }, [currentCurrency, accountData]);

  const filtered = React.useMemo((): ReadonlyArray<Resource> | null => {
    if (accountData === null) return null;
    const { resources } = accountData;
    if (resources === null) return null;
    return resources.filter(onlyValidUris);
  }, [accountData]);

  React.useEffect(() => {
    // prefer url param ticker first
    if (!ticker || !filtered) return;
    const found = filtered.find(
      (res) => res.uri.split(":")[1].toUpperCase() === ticker.toUpperCase(),
    );
    if (found) {
      setIsValidTicker(true);
      setCurrentCurrency(ticker.toUpperCase());
    }
  }, [ticker, filtered]);

  const selectChangeHandler = (
    event: React.ChangeEvent<{ name?: string | undefined; value: any }>,
  ): void => {
    setCurrentCurrency(event.target.value as string);
  };

  return accountData === null ? (
    <ProfileWithNoInfo />
  ) : accountData.resources?.length === 0 ? (
    <ProfileWithNoInfo />
  ) : (
    <Block className="send-nft-view">
      <Block className="send-nft-heading">
        <NameStarnameHeading accountData={accountData} starname={starname} />
      </Block>
      <Block className="send-nft-description-container">
        {strings.SEND_NFT_TO} {accountData.name ?? starname}
      </Block>
      <ThemeProvider theme={theme}>
        <Select
          fullWidth
          variant="outlined"
          value={currentCurrency}
          className={"select-currency"}
          displayEmpty
          onChange={selectChangeHandler}
          readOnly={isValidTicker}
        >
          <MenuItem value="">
            <em style={{ marginLeft: 12 }}>{strings.SELECT_TARGET_CHAIN}</em>
          </MenuItem>
          {filtered === null
            ? null
            : [...filtered]
                .sort((a, b) => a.uri.localeCompare(b.uri))
                .map((item: Resource) => {
                  const { uri } = item;
                  const symbol: string = getSymbol(uri);
                  const icon: string = getImage(uri);
                  const name = getName(uri);
                  return (
                    <MenuItem value={symbol} key={uri}>
                      <div className={"enter-amount-view-currency-item"}>
                        <img
                          src={icon}
                          alt={symbol}
                          className={"select-thumbnail"}
                        />
                        <Typography variant={"subtitle2"} component={"div"}>
                          {symbol} ({name})
                        </Typography>
                      </div>
                    </MenuItem>
                  );
                })}
        </Select>
      </ThemeProvider>
      {resource && (
        <Block marginTop={"16px"}>
          <div className={"input-section"}>
            <div className={"input-section-heading"}>{"Address"}</div>
            <div className={"input-section-in"}>
              <MiddleEllipsis className={"copyable-text-view"}>
                {resource.resource}
              </MiddleEllipsis>
              <div className={"input-section-copy"}>
                <img
                  src={"/assets/copy.svg"}
                  alt={"copy icon"}
                  onClick={(): void => {
                    copyToClipboard(resource.resource)
                      .then((): void => {
                        void message.success("Copied to clipboard!");
                      })
                      .catch((): void => {
                        void message.error("Sorry, could not copy");
                      });
                  }}
                />
              </div>
            </div>
          </div>
          <div
            className={[
              "qr-code-container",
              qrExpanded ? "expanded" : "collapsed",
            ].join(" ")}
          >
            <div
              className={"label"}
              onClick={(): void => setQrExpanded(!qrExpanded)}
            >
              <span>{qrExpanded ? "Hide" : "Show"} QR Code</span>
              <div className={"icon"}>
                <span className={"fa fa-qrcode"} />
              </div>
            </div>
            <div className={"image"}>
              <QRGenerator value={resource.resource} size={200} />
            </div>
          </div>
        </Block>
      )}
      <Block marginTop={"24px"}>
        <AboutMeComponent accountData={accountData} />
      </Block>
    </Block>
  );
};

export default SendNftView;
