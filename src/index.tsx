import "@fortawesome/fontawesome-free/css/all.min.css";
import "./routes/starnameProfile/main.css";
import "antd/dist/antd.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/common.scss";

import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { ThemeProvider as NewThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { getChainOptions, WalletProvider } from "@terra-money/wallet-provider";
import React from "react";
import ReactDOM from "react-dom";
import TagManager from "react-gtm-module";
import Routes from "routes";
import { GDriveCustodianContext } from "signers/gdrive/context";
import { GDriveCustodian } from "signers/gdrive/custodian";
import theme from "theme";
import newMuiTheme from "theme/newMuiTheme";

declare global {
  interface Window {
    readonly getOfflineSigner: (chainId: string) => any;
    readonly keplr: any;
    readonly USB: any;
    readonly Intercom?: (action: string, options: any) => void;
  }
}

const render = (Component: React.ComponentType<any>): void => {
  const { pathname } = window.location;
  if (!pathname.startsWith("/google")) {
    TagManager.initialize({
      gtmId: "GTM-N63CNZN",
    });
  }

  getChainOptions().then((chainOptions) => {
    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <NewThemeProvider theme={newMuiTheme}>
          <CssBaseline />
          <GDriveCustodianContext.Provider value={GDriveCustodian.create()}>
            <WalletProvider {...chainOptions}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Component />
              </LocalizationProvider>
            </WalletProvider>
          </GDriveCustodianContext.Provider>
        </NewThemeProvider>
      </ThemeProvider>,
      document.getElementById("root"),
    );
  });
};

render(Routes);
