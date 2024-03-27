import "./styles.scss";

import { StdFee } from "@cosmjs/stargate";
import { Paper } from "@material-ui/core";
import BasicButtons from "components/basicButtons";
import { Block } from "components/block";
import TransactionDetails from "components/TransactionDetails";
import React from "react";
import { Amount } from "types/amount";
import { NameItem } from "types/nameItem";
import { OperationType } from "types/operationType";

interface Props {
  readonly type: OperationType;
  readonly thinking: boolean;
  readonly disabled?: boolean;
  readonly submitCaption: string;
  readonly header: React.ReactNode;
  readonly form?: React.ReactNode;
  readonly amount?: Amount;
  readonly item: NameItem;
  readonly fee: StdFee;
  readonly onAccept: () => void;
  readonly submitHtmlColor?: string;
}

const AccountOperationView: React.FC<React.PropsWithChildren<Props>> = (
  props: React.PropsWithChildren<Props>,
): React.ReactElement => {
  const { item } = props;
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    props.onAccept();
  };
  return (
    <Block className={"account-operation-view"}>
      <Paper className={"account-operation-view-paper"} variant={"outlined"}>
        <Block className={"account-operation-view-form-content"}>
          {props.header}
          {props.children}
        </Block>
      </Paper>
      <Block margin={12} />
      <form
        className={"account-operation-view-form-container"}
        onSubmit={onSubmit}
      >
        {props.form}
        <Block justifyContent={"center"} display={"flex"} alignItems={"center"}>
          <TransactionDetails
            amount={props.amount ?? item.getOperationPrice(props.type)}
            fee={props.fee}
            disabled={props.disabled === undefined ? false : props.disabled}
          />
        </Block>
        <Block
          marginTop={32}
          marginBottom={8}
          justifyContent={"center"}
          display={"flex"}
          alignItems={"center"}
          flexDirection={"column"}
        >
          <Block width={"75%"}>
            <BasicButtons
              thinking={props.thinking}
              primary={{
                label: props.submitCaption,
                disabled: !!props.disabled,
                ...(props.submitHtmlColor
                  ? { htmlColor: props.submitHtmlColor }
                  : {}),
              }}
            />
          </Block>
        </Block>
      </form>
    </Block>
  );
};

export default AccountOperationView;
