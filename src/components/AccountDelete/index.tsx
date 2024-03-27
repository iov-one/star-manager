import { StdFee } from "@cosmjs/stargate";
import { Header } from "components/AccountDelete/header";
import AccountOperationView from "components/AccountOperationView";
import React from "react";
import { NameItem } from "types/nameItem";
import { OperationType } from "types/operationType";

interface Props {
  readonly thinking: boolean;
  readonly fee: StdFee;
  readonly item: NameItem;
  readonly onAccept: () => void;
}

const AccountDelete: React.FC<React.PropsWithChildren<Props>> = (
  props: React.PropsWithChildren<Props>,
): React.ReactElement => {
  return (
    <AccountOperationView
      item={props.item}
      type={OperationType.Delete}
      thinking={props.thinking}
      submitCaption={"Delete"}
      header={<Header item={props.item} />}
      fee={props.fee}
      onAccept={props.onAccept}
    >
      {props.children}
    </AccountOperationView>
  );
};

export default AccountDelete;
