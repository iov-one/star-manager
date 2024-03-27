import "./styles.scss";

import { Table, TableBody } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";
import { TxTablePager } from "routes/transactions/components/Pager";
import { TxRow } from "routes/transactions/components/TxRow";
import TxTableHeader from "routes/transactions/components/TxTable/TxTableHeader";
import { Pager } from "types/pager";
import { ITransaction as Transaction } from "types/transaction";

interface Props {
  readonly pager: Pager;
  readonly transactions: ReadonlyArray<Transaction>;
  readonly loading: boolean;
}

const mapTransactionToElement = (
  transaction: Transaction,
): React.ReactElement => (
  <TxRow key={transaction.id} transaction={transaction} />
);

const TxTable: React.FC<Props> = (props: Props): React.ReactElement => {
  const { transactions, pager } = props;

  return (
    <Block className={"transactions-table"}>
      <Block className={"transactions-table-content"}>
        <Table className={"transactions-table-content-table"}>
          <colgroup className={"transactions-table-content-table-columns"}>
            <col width={"60%"} />
            <col width={"15%"} />
            <col width={"25%"} />
          </colgroup>
          <TxTableHeader className={"transactions-table-content-header"} />
          <TableBody className={"transactions-table-content-body"}>
            {transactions
              .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)
              .map(mapTransactionToElement)}
          </TableBody>
        </Table>
        <TxTablePager pager={pager} />
      </Block>
    </Block>
  );
};

export default TxTable;
