import { StdFee } from "@cosmjs/amino";
import AccountRenew from "components/AccountRenew";
import { ItemizedHelpView } from "components/itemizedHelpView";
import locales from "locales/strings";
import React from "react";
import { Amount } from "types/amount";
import { NameItem } from "types/nameItem";

interface Props {
  readonly fee: StdFee;
  readonly thinking: boolean;
  readonly item: NameItem;
  readonly onAccept: () => void;
  readonly amount?: Amount;
}

const StarnameAccountRenew: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { item } = props;
  return (
    <AccountRenew
      fee={props.fee}
      thinking={props.thinking}
      item={props.item}
      onAccept={props.onAccept}
      amount={props.amount}
    >
      <ItemizedHelpView
        entries={[`${locales.RENEWING_ACTION} ${item.toString()}`]}
      />
    </AccountRenew>
  );
};

export default StarnameAccountRenew;
