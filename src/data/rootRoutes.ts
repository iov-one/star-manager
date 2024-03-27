import { BALANCES_ROUTE, MANAGER_BASE_ROUTE } from "routes/paths";
import { ApplicationName } from "types/applicationName";

export const RootRoutes: { [key in ApplicationName]: string } = {
  [ApplicationName.Manager]: MANAGER_BASE_ROUTE,
  [ApplicationName.Wallet]: BALANCES_ROUTE,
};
