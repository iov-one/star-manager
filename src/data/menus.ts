import managerMenuItems from "menus/managerMenu";
import walletMenuItems from "menus/walletMenu";
import { ApplicationName } from "types/applicationName";
import { MenuItemDef } from "types/menuItemDef";

export const Menus: { [key in ApplicationName]: ReadonlyArray<MenuItemDef> } = {
  [ApplicationName.Manager]: managerMenuItems,
  [ApplicationName.Wallet]: walletMenuItems,
};
