import { Typography } from "@material-ui/core";
import { TRANSFERRING_HEADER } from "locales/componentStrings";
import React from "react";
import { NameItem } from "types/nameItem";
import { NameType } from "types/nameType";

interface Props {
  readonly item: NameItem;
}

export const Header: React.FC<Props> = (props: Props): React.ReactElement => {
  const { item } = props;
  const isDomain: boolean = React.useMemo((): boolean => {
    return item.type === NameType.Domain || item.name === "";
  }, [item]);
  return (
    <>
      <Typography variant={"h4"} component={"span"}>
        {TRANSFERRING_HEADER.ACTION}
      </Typography>
      {isDomain ? (
        <Typography variant={"h4"} component={"span"}>
          {TRANSFERRING_HEADER.WHAT}
        </Typography>
      ) : null}
      <Typography variant={"h4"} color={"primary"} component={"span"}>
        {item.toString()}{" "}
      </Typography>
      {isDomain ? (
        <Typography variant={"h4"} component={"span"}>
          {TRANSFERRING_HEADER.TO}
        </Typography>
      ) : (
        <Typography variant={"h4"} component={"span"}>
          {TRANSFERRING_HEADER.FROM}
        </Typography>
      )}
    </>
  );
};
