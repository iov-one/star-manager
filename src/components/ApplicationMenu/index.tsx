import "./styles.scss";

import { Button } from "@material-ui/core";
import logo from "assets/logo.webp";
import MenuItems from "components/ApplicationMenu/components/menuItemsView";
import { Block } from "components/block";
import { MINIMUM_DESKTOP_WIDTH } from "dimensions";
import React from "react";
import { MenuItemDef } from "types/menuItemDef";

interface Props {
  readonly items: ReadonlyArray<MenuItemDef>;
}

const ApplicationMenu: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const [windowWidth, setWindowWidth] = React.useState<number>(
    window.innerWidth,
  );
  const { items } = props;

  React.useEffect((): (() => void) => {
    const onResize = (): void => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", onResize);
    return (): void => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /**
   * Because we need the space to display the menu at the bottom of
   * the screen, we need to hide the intercom launcher
   */
  React.useEffect((): (() => void) | void => {
    if (windowWidth >= MINIMUM_DESKTOP_WIDTH) return;
    if (items.length === 0) return;
    if (window.Intercom === undefined) return;
    window.Intercom("update", {
      hide_default_launcher: true,
    });
    return (): void => {
      if (window.Intercom === undefined) return;
      window.Intercom("update", {
        hide_default_launcher: false,
      });
    };
  }, [items, windowWidth]);

  if (items.length === 0) return null;
  return (
    <>
      <Block className={"main-application-menu-background"} />
      <Block className={"main-application-responsive-bar"}>
        <Button className={"header-button"}>
          <i className={"fa fa-bars "} />
        </Button>
        <img src={logo} alt={"logo"} />
        <Button className={"header-button"} />
      </Block>
      <Block className={"main-application-menu"}>
        <MenuItems items={items} />
      </Block>
    </>
  );
};

export default ApplicationMenu;
