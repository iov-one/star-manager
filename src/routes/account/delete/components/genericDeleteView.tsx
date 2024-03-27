import { StdFee } from "@cosmjs/amino";
import AccountDelete from "components/AccountDelete";
import { ItemizedHelpView } from "components/itemizedHelpView";
import {
  DeleteDomainStrings,
  DeleteNameStrings,
} from "locales/componentStrings";
import React from "react";
import { NameItem } from "types/nameItem";
import { NameType } from "types/nameType";

interface Props {
  readonly fee: StdFee;
  readonly thinking: boolean;
  readonly type: NameType;
  readonly item: NameItem;
  readonly onAccept: () => void;
  readonly onCancel: () => void;
}

const GenericDeleteView: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const entries: string[] =
    props.type === NameType.Account ? DeleteNameStrings : DeleteDomainStrings;
  return (
    <AccountDelete
      fee={props.fee}
      thinking={props.thinking}
      item={props.item}
      onAccept={props.onAccept}
    >
      <ItemizedHelpView entries={entries} />
    </AccountDelete>
  );
};

export default GenericDeleteView;
