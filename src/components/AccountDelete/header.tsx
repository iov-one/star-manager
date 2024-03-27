import { Typography } from "@material-ui/core";
import locales from "locales/strings";
import React from "react";
import { NameItem } from "types/nameItem";

interface Props {
  item: NameItem;
}

export const Header: React.FC<Props> = (props: Props): React.ReactElement => {
  const { item } = props;
  return (
    <>
      <Typography color={"textPrimary"} variant={"h4"} component={"span"}>
        {locales.ACCOUNT_DELETE_HEADER}
      </Typography>
      <Typography color={"primary"} variant={"h4"} component={"span"}>
        {item.toString()}
      </Typography>
    </>
  );
};
