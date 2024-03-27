import "./style.scss";

import { Paper } from "@material-ui/core";
import { Block } from "components/block";
import React, { PropsWithChildren } from "react";

interface Props {
  title: React.ReactNode;
}

const EscrowFormContainer = (
  props: PropsWithChildren<Props>,
): React.ReactElement => {
  return (
    <Paper className={"account-operation-view-form-paper"}>
      <Block className={"account-operation-view-form-content"}>
        {props.title}
        <Block className={"escrow-fields-container"}>{props.children}</Block>
      </Block>
    </Paper>
  );
};

export default EscrowFormContainer;
