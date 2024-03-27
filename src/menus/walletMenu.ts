import { ReactComponent as RewardsIcon } from "assets/hand.svg";
import { ReactComponent as HomeIcon } from "assets/home.svg";
import { ReactComponent as TransactionsIcon } from "assets/transactions.svg";
import locales from "locales/strings";
import {
  BALANCES_ROUTE,
  STAKING_ROUTE,
  TRANSACTIONS_ROUTE,
} from "routes/paths";
import { MenuItemDef } from "types/menuItemDef";

const items: MenuItemDef[] = [
  {
    key: "balances",
    label: locales.BALANCES_TAB_TITLE,
    action: BALANCES_ROUTE,
    icon: HomeIcon,
  },
  {
    key: "transactions",
    label: locales.TRANSACTIONS_TAB_TITLE,
    action: TRANSACTIONS_ROUTE,
    icon: TransactionsIcon,
  },
  {
    key: "staking",
    label: locales.STAKING_TAB_TITLE,
    action: STAKING_ROUTE,
    icon: RewardsIcon,
  },
];

export default items;
