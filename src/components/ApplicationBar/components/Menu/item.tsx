import { MenuItem } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";
import { MenuItemDef } from "types/menuItemDef";

interface Props {
  readonly item: MenuItemDef;
}

export const Item: React.FC<Props> = (props: Props): React.ReactElement => {
  const { item } = props;
  const { icon: Icon } = item;
  if (typeof item.action !== "function")
    throw new Error("only function actions permitted");
  return (
    <MenuItem onClick={item.action} className={"application-bar-menu-item"}>
      {Icon !== null ? (
        <Block className={"application-bar-menu-item-icon"}>
          <Icon />
        </Block>
      ) : null}
      <Block className={"application-bar-menu-item-label"}>{item.label}</Block>
    </MenuItem>
  );
};
