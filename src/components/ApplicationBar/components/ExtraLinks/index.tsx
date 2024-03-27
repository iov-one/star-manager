import { Button } from "@material-ui/core";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { LogoutEvent } from "routes";

const logout = (): void => {
  document.dispatchEvent(LogoutEvent);
};

export const ExtraLinks: React.FC = (): React.ReactElement => {
  return (
    <Block className={"application-bar-menu-footer-content"}>
      <Block className={"application-bar-account-menu-logout-link"}>
        <Button variant={"outlined"} onClick={logout}>
          {locales.LOGOUT}
        </Button>
      </Block>
    </Block>
  );
};
