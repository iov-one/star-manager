import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import { ERROR_HTML_COLOR } from "genericConstants";
import locales from "locales/strings";
import React from "react";
import { LogoutEvent } from "routes";

const logout = (): void => {
  document.dispatchEvent(LogoutEvent);
};

export const SimpleLogoutButton: React.FC = (): React.ReactElement => {
  return (
    <ListItem button onClick={logout}>
      <ListItemIcon>
        <ExitToApp htmlColor={ERROR_HTML_COLOR} />
      </ListItemIcon>
      <ListItemText primary={locales.LOGOUT} />
    </ListItem>
  );
};
