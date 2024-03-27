import "./styles.scss";

import React from "react";
import { Cell } from "routes/transactions/components/TxTable/TxDetail/cell";
import { DetailCell } from "routes/transactions/components/TxTable/TxDetail/detailCell";
import { ITransaction as Transaction } from "types/transaction";

interface Props {
  readonly transaction: Transaction;
  readonly cells: ReadonlyArray<Cell>;
}

export const DetailRow: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { cells, transaction } = props;
  return (
    <>
      {cells.map((cell: Cell): React.ReactElement => {
        return (
          <DetailCell key={cell.key} cell={cell} transaction={transaction} />
        );
      })}
    </>
  );
};
