import { Typography } from "@material-ui/core";
import locales from "locales/strings";
import React from "react";

export const EmptyAccountsView: React.FC = (): React.ReactElement | null => {
  return (
    <div className={"application-bar-menu-no-accounts-item"}>
      <Typography component={"span"} color={"textSecondary"}>
        {locales.YOU_HAVE_ZERO_ACCOUNTS}
      </Typography>
    </div>
  );
};
