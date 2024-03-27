import "./styles.scss";

import { Menu as MaterialMenu } from "@material-ui/core";
import { MenuContent } from "components/ApplicationBar/components/MenuContent";
import React from "react";
import { MenuItemDef } from "types/menuItemDef";

interface Props {
  readonly open: boolean;
  readonly items: ReadonlyArray<MenuItemDef>;
  readonly loading?: boolean;
}

export const Menu: React.FC<React.PropsWithChildren<Props>> = React.forwardRef(
  (props: React.PropsWithChildren<Props>): React.ReactElement => {
    const { items } = props;
    const anchorRef: React.Ref<HTMLDivElement> =
      React.useRef<HTMLDivElement>(null);
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    React.useEffect((): void => {
      const { current } = anchorRef;
      if (current === null) return;
      const parent: HTMLElement | null = current.parentElement;
      setAnchor(parent);
    }, [anchorRef]);
    return (
      <>
        <div ref={anchorRef} />
        <MaterialMenu
          classes={{ paper: "application-bar-menu" }}
          open={props.open}
          getContentAnchorEl={null}
          anchorEl={anchor}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuContent items={items} loading={props.loading}>
            {props.children}
          </MenuContent>
        </MaterialMenu>
      </>
    );
  },
);
