import React from "react";
import { Redirect, Route } from "react-router";
import AccountDelete from "routes/account/delete";
import EditProfileView from "routes/account/edit";
import ManageAccountCertificates from "routes/account/manageCertificates";
import AccountRenew from "routes/account/renew";
import AccountTransfer from "routes/account/transfer";
import {
  MANAGER_BASE_ROUTE,
  MANAGER_DELETE_STARNAME_ROUTE,
  MANAGER_EDIT_STARNAME_ROUTE,
  MANAGER_MANAGE_CERTIFICATES,
  MANAGER_REGISTER_STARNAME_ROUTE,
  MANAGER_RENEW_STARNAME_ROUTE,
  MANAGER_SELL_STARNAME_ROUTE,
  MANAGER_SHOW_QR_ROUTE,
  MANAGER_TRANSFER_STARNAME_ROUTE,
} from "routes/paths";
import SellStarname from "routes/sell";
import GenericNameView from "routes/starnames/components/GenericNameView";
import RegisterForm from "routes/starnames/components/RegisterForm";

import ShowQrCode from "./account/showQR";

export const ManagerRoutes: React.FC = (): React.ReactElement => {
  return (
    <>
      <Route
        path={MANAGER_BASE_ROUTE}
        component={GenericNameView}
        exact={true}
      />
      <Route
        path={MANAGER_REGISTER_STARNAME_ROUTE}
        component={RegisterForm}
        exact={true}
      />

      <Route
        exact
        path={MANAGER_EDIT_STARNAME_ROUTE}
        component={EditProfileView}
      />
      <Route
        exact
        path={MANAGER_DELETE_STARNAME_ROUTE}
        component={AccountDelete}
      />
      <Route
        exact
        path={MANAGER_TRANSFER_STARNAME_ROUTE}
        component={AccountTransfer}
      />
      <Route
        exact
        path={MANAGER_RENEW_STARNAME_ROUTE}
        component={AccountRenew}
      />
      <Route exact path={MANAGER_SHOW_QR_ROUTE} component={ShowQrCode} />
      <Route
        exact
        path={MANAGER_MANAGE_CERTIFICATES}
        component={ManageAccountCertificates}
      />
      <Route
        exact
        path={MANAGER_SELL_STARNAME_ROUTE}
        component={SellStarname}
      />
      <Redirect to={MANAGER_BASE_ROUTE} />
    </>
  );
};
