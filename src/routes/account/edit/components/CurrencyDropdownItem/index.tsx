import { Asset } from "@iov/asset-directory";
import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";

export const CurrencyDropdownItem: React.FC<Asset> = (
  props: Asset,
): React.ReactElement => {
  const { name, logo } = props;
  return (
    <Block className={"resource-item-view-edit-box-asset-item"}>
      <Block className={"resource-item-view-edit-box-asset-item-logo"}>
        <img src={logo} alt={"asset"} />
      </Block>
      <Typography className={"resource-item-view-edit-box-asset-item-text"}>
        {name}
      </Typography>
    </Block>
  );
};
