import { Asset } from "@iov/asset-directory";
import { Checkbox, MenuItem, Typography } from "@material-ui/core";
import api from "api";
import { Block } from "components/block";
import React from "react";

interface Props {
  readonly address: string;
  readonly uri: string;
  readonly asset: string;
  readonly selected: boolean;
  readonly onClick: (selected: boolean) => void;
}

const getIcon = (assetName: string): string => {
  const allAssets: ReadonlyArray<Asset> = api.getAssets();
  const found: Asset | undefined = allAssets.find((asset: Asset): boolean => {
    const { symbol } = asset;
    return symbol.toLowerCase() === assetName.toLowerCase();
  });
  if (found !== undefined) {
    return found.logo;
  } else {
    return "";
  }
};

export const WalletConnectAsset: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { asset, address } = props;
  return (
    <MenuItem onClick={() => props.onClick(!props.selected)}>
      <Block
        display={"flex"}
        alignItems={"center"}
        paddingLeft={16}
        paddingRight={16}
      >
        <Block marginRight={12}>
          <Checkbox color={"primary"} checked={props.selected} />
        </Block>
        <Block height={24} marginRight={12}>
          <img
            src={getIcon(asset)}
            alt={asset + " Icon"}
            height={24}
            width={24}
          />
        </Block>
        <Block>
          <Block marginBottom={3}>
            <Typography variant={"subtitle1"}>
              {asset} (<span>{asset.toUpperCase()}</span>)
            </Typography>
          </Block>
          <Block marginTop={3}>
            <Typography variant={"subtitle2"} color={"textSecondary"}>
              {address}
            </Typography>
          </Block>
        </Block>
      </Block>
    </MenuItem>
  );
};
