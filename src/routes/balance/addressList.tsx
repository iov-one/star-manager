import { Typography } from "@material-ui/core";
import copySvg from "assets/copy.svg";
import clipboardCopy from "clipboard-copy";
import { Block } from "components/block";
import { MiddleEllipsis } from "components/MiddleEllipsis";
import toast, { ToastType } from "components/toast";
import locales from "locales/strings";
import React from "react";
import { Balance } from "types/balance";
import { getAsset } from "utils/getAsset";

interface Props {
  readonly balances: ReadonlyArray<Balance>;
}

export const AddressList: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { balances } = props;

  const copyAddress = (address: string): void => {
    clipboardCopy(address)
      .then((): void => {
        toast.show(locales.ADDRESS_HAS_BEEN_COPIED, ToastType.Success);
      })
      .catch((): void => {
        toast.show(locales.CLIPBOARD_COPY_ERROR, ToastType.Error);
      });
  };

  return (
    <>
      <Block className={"balance-view-title"}>
        <Typography variant={"subtitle1"}>{locales.YOUR_ADDRESSES}</Typography>
      </Block>
      {balances.map((balance: Balance): React.ReactElement => {
        const { amount } = balance;
        const { token } = amount;
        const asset = getAsset(token.ticker);
        return (
          <Block key={asset.name} className={"balance-view-address-entry"}>
            <Block className={"balance-view-address-entry-asset-logo"}>
              <img src={asset.logo} alt={asset.name} />
            </Block>
            <Block className={"balance-view-address-entry-content"}>
              <Typography variant={"subtitle1"}>{asset.name}</Typography>
              <MiddleEllipsis
                variant={"subtitle2"}
                className={"balance-view-address-entry-content-address"}
              >
                {balance.address}
              </MiddleEllipsis>
            </Block>
            <Block
              className={"balance-view-address-entry-copy-button"}
              onClick={(): void => copyAddress(balance.address)}
            >
              <img src={copySvg} alt={"copy"} />
            </Block>
          </Block>
        );
      })}
    </>
  );
};
