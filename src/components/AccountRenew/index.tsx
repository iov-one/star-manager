import { StdFee } from "@cosmjs/amino";
import AccountOperationView from "components/AccountOperationView";
import { Header } from "components/AccountRenew/header";
import React from "react";
import { Amount } from "types/amount";
import { NameItem } from "types/nameItem";
import { OperationType } from "types/operationType";

interface Props {
  readonly fee: StdFee;
  readonly thinking: boolean;
  readonly item: NameItem;
  readonly onAccept: () => void;
  readonly amount?: Amount;
}

const AccountRenew: React.FunctionComponent<React.PropsWithChildren<Props>> = (
  props: React.PropsWithChildren<Props>,
): React.ReactElement => {
  return (
    <AccountOperationView
      item={props.item}
      type={OperationType.Renew}
      thinking={props.thinking}
      submitCaption={"Renew"}
      header={<Header item={props.item} />}
      fee={props.fee}
      onAccept={props.onAccept}
      amount={props.amount}
    >
      {props.children}
    </AccountOperationView>
  );
};

export default AccountRenew;
