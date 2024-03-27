import { Typography } from "@material-ui/core";
import strings from "locales/strings";
import React from "react";
import { NameItem } from "types/nameItem";

interface Props {
  readonly item: NameItem;
}

export const Header: React.FC<Props> = (props: Props): React.ReactElement => {
  const { item } = props;
  return (
    <React.Fragment>
      <Typography color={"textPrimary"} variant={"h4"} component={"span"}>
        {strings.ESCROW_MARK_NOTE}
      </Typography>
      <Typography color={"primary"} variant={"h4"} component={"span"}>
        {item.toString() + " "}
      </Typography>
      <Typography color={"textPrimary"} variant={"h4"} component={"span"}>
        {strings.FOR_SALE.toLowerCase()}
      </Typography>
    </React.Fragment>
  );
};
