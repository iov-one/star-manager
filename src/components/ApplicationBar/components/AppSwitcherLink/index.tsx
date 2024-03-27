import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { AccountBalanceWallet, Tune } from "@material-ui/icons";
import strings from "locales/strings";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import React from "react";
import { ApplicationName } from "types/applicationName";

export const AppSwitcherLink: React.FC = (): React.ReactElement => {
  const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
  const { application } = sessionStore;
  switch (application) {
    case ApplicationName.Manager:
      return (
        <ListItem
          button
          onClick={(): void =>
            sessionStore.setApplication(ApplicationName.Wallet)
          }
        >
          <ListItemIcon>
            <AccountBalanceWallet color="primary" />
          </ListItemIcon>
          <ListItemText primary={strings.GO_TO_WALLET} />
        </ListItem>
      );
    case ApplicationName.Wallet:
      return (
        <ListItem
          button
          onClick={(): void =>
            sessionStore.setApplication(ApplicationName.Manager)
          }
        >
          <ListItemIcon>
            <Tune color="primary" />
          </ListItemIcon>
          <ListItemText primary={strings.GO_TO_MANAGER} />
        </ListItem>
      );

    default:
      throw new Error("application not set");
  }
};
