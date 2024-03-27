import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";
import { withRouter } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { MenuItemDef } from "types/menuItemDef";

interface Props extends RouteComponentProps {
  readonly items: ReadonlyArray<MenuItemDef>;
  readonly onChange?: (path: string) => void;
}

const basename = (name: string): string => {
  const fragments: string[] = name.split("/");
  return "/" + fragments[1];
};

const MenuItemsView: React.FC<Props> = (props: Props): React.ReactElement => {
  const { items, location, history, onChange } = props;
  const { pathname } = location;

  React.useEffect((): void => {
    if (onChange === undefined) return;
    onChange(basename(location.pathname));
  }, [onChange, location]);
  const value = React.useMemo((): string => basename(pathname), [pathname]);
  return (
    <Block className={"menu"}>
      {items.map((item: MenuItemDef): React.ReactElement => {
        const { key, action, label, icon } = item;
        const Icon = icon;
        if (typeof action === "string") {
          const classes = [
            "menu-item",
            ...[action.startsWith(value) ? "active" : ""],
          ];
          return (
            <Block
              className={classes.join(" ")}
              key={key}
              onClick={(): void => history.push(action)}
            >
              {Icon !== null ? (
                <Block className={"menu-item-icon"}>
                  <Icon />
                </Block>
              ) : null}
              <Typography className={"menu-item-label"}>{label}</Typography>
            </Block>
          );
        } else if (typeof action === "function") {
          return (
            <Block key={key} className={"menu-item"} onClick={action}>
              {Icon !== null ? (
                <Block className={"menu-item-icon"}>
                  <Icon />
                </Block>
              ) : null}
              <Typography className={"menu-item-label"} key={key}>
                {label}
              </Typography>
            </Block>
          );
        } else {
          return <Typography key={key}>Invalid item</Typography>;
        }
      })}
    </Block>
  );
};

export default withRouter(MenuItemsView);
