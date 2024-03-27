import { PleaseChooseYourApp } from "components/PleaseChooseYourApp";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import React from "react";
import { Redirect, Route, useHistory } from "react-router";
import { ManagerRoutes } from "routes/managerRoutes";
import { WalletRoutes } from "routes/walletRoutes";
import { ApplicationName } from "types/applicationName";


export const RoutesSelector: React.FC = observer((): React.ReactElement => {
  const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
  const history = useHistory();

  switch (sessionStore.application) {
    case ApplicationName.Manager:
      return <ManagerRoutes />;
    case ApplicationName.Wallet:
      return <WalletRoutes />;
    default:
      // Show a message requesting the user to pick the application
      return (
        <>
          <Route exact={true} path={"/"} component={PleaseChooseYourApp} />
          <Redirect to={"/"} />
        </>
      );
  }
});
