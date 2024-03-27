import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { LockOpen } from "@material-ui/icons";
import strings from "locales/strings";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import React from "react";
import { useHistory } from "react-router";
import { MANAGE_2FA_ROUTE } from "routes/paths";
import { ApplicationName } from "types/applicationName";

export const Manage2faLink: React.FC = (): React.ReactElement => {
  const history = useHistory();
  const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
  const { application } = sessionStore;
  const handleClick = (): void => {
    if (application !== ApplicationName.Wallet)
      sessionStore.setApplication(ApplicationName.Wallet);
    setTimeout(() => {
      history.push(MANAGE_2FA_ROUTE);
    }, 100);
  };
  return (
    <ListItem button onClick={handleClick}>
      <ListItemIcon>
        <LockOpen color={"primary"} />
      </ListItemIcon>
      <ListItemText primary={strings.MANAGE_2FA} />
    </ListItem>
  );
};
