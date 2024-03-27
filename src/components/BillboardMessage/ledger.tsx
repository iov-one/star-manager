import ledger from "assets/ledger.svg";
import { Block } from "components/block";
import React from "react";

import { GenericBillboard, Props } from "./index";

const LedgerBillboardMessage: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  return (
    <GenericBillboard text={props.text}>
      <Block marginTop={8}>
        <img src={ledger} alt={"ledger"} />
      </Block>
    </GenericBillboard>
  );
};

export default LedgerBillboardMessage;
