import { MenuItem } from "@material-ui/core";
import { Item } from "components/ApplicationBar/components/Menu/item";
import { LoadingItem } from "components/ApplicationBar/components/Menu/loadingItem";
import React, { Children } from "react";
import { MenuItemDef } from "types/menuItemDef";

export interface MenuContentProps {
  readonly loading?: boolean;
  readonly items: ReadonlyArray<MenuItemDef>;
}

export const MenuContent: React.FC<React.PropsWithChildren<MenuContentProps>> =
  React.forwardRef(
    (props: React.PropsWithChildren<MenuContentProps>): React.ReactElement => {
      const { items } = props;
      if (props.loading) {
        return <LoadingItem />;
      } else {
        const children = Children.toArray(props.children);
        return (
          <>
            {items.map(
              (item: MenuItemDef): React.ReactElement => (
                <Item key={item.key} item={item} />
              ),
            )}
            {/* Wrap every child in a menu item */}
            {children.map(
              (child: any, index: number): React.ReactElement => (
                <MenuItem
                  key={index}
                  classes={{ root: "application-bar-menu-children" }}
                  style={{ backgroundColor: "transparent", cursor: "default" }}
                  disableGutters={true}
                  disableRipple={true}
                >
                  {child}
                </MenuItem>
              ),
            )}
          </>
        );
      }
    },
  );
