import "./styles.scss";

import copy from "assets/copy.svg";
import clipboardCopy from "clipboard-copy";
import { Block } from "components/block";
import toast, { ToastType } from "components/toast";
import locales from "locales/strings";
import React from "react";
import { ResourceInfo } from "types/resourceInfo";

interface Props {
  readonly target: ResourceInfo;
}

export const AddressRow = (props: Props): React.ReactElement => {
  const { target } = props;
  const { asset } = target;

  const onAddressCopy = (): void => {
    clipboardCopy(target.address)
      .then(() => {
        toast.show(locales.ADDRESS_HAS_BEEN_COPIED, ToastType.Success);
      })
      .catch(() => {
        toast.show(locales.CLIPBOARD_COPY_ERROR, ToastType.Error);
      });
  };

  return (
    <Block className={"address-table-address-row"}>
      <Block className={"address-table-address-row-cell"}>{asset.name}</Block>
      <Block
        className={
          "address-table-address-row-cell address-table-address-row-cell-address"
        }
      >
        {target.address}
      </Block>
      <Block className={"address-table-address-row-cell copy"}>
        <Block
          onClick={onAddressCopy}
          className={"address-table-address-row-link"}
        >
          <img src={copy} alt={"copy"} width={16} />
        </Block>
      </Block>
    </Block>
  );
};
