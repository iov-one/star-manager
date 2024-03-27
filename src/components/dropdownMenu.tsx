import { Menu, MenuItem } from "@material-ui/core";
import { Block } from "components/block";
import { LocationDescriptor } from "history";
import React, { useRef } from "react";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { ItemRouteState } from "types/nameItem";

export interface DropdownMenuItem {
  readonly label: string;
  readonly path: LocationDescriptor<ItemRouteState>;
  readonly icon?: string;
}

interface Props extends RouteComponentProps {
  readonly items: ReadonlyArray<DropdownMenuItem>;
}

const DropDownMenu: React.FC<Props> = (props: Props) => {
  const { items, history } = props;
  const ref: React.Ref<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <Block className={"dropdown-menu"} onClick={() => setOpen(!open)} ref={ref}>
      <Block className={"dropdown-menu-dots"}>
        <Block className={"dropdown-menu-dots-dot"} />
        <Block className={"dropdown-menu-dots-dot"} />
        <Block className={"dropdown-menu-dots-dot"} />
      </Block>
      <Menu onClose={() => setOpen(false)} anchorEl={ref.current} open={open}>
        {items.map((item: DropdownMenuItem) => (
          <MenuItem
            onClick={(): void => history.push(item.path)}
            key={item.label}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Block>
  );
};

export default withRouter(DropDownMenu);
