import { TableCell, TableRow } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";
import { DetailRow } from "routes/transactions/components/TxTable/TxDetail/detailRow";
import { Row } from "routes/transactions/components/TxTable/TxDetail/row";
import sendTxRows from "routes/transactions/components/TxTable/TxDetail/sendTxDetailFields";
import starnameTxRows from "routes/transactions/components/TxTable/TxDetail/starnameTxDetailFields";
import { TxType } from "signers/starnameRegistry";
import { ITransaction as Transaction } from "types/transaction";

import {
  createEscrowTxRows,
  refundEscrowTxRows,
  transferToEscrowTxRows,
  updateEscrowTxRows,
} from "./escrowDetailFields";

interface Props {
  readonly transaction: Transaction;
  readonly open: boolean;
}

export const TxDetail: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const { transaction } = props;
  const rows: ReadonlyArray<Row> = React.useMemo((): ReadonlyArray<Row> => {
    switch (transaction.type) {
      case TxType.Virtual.Receive:
      case TxType.Bank.Send:
        return sendTxRows;
      case TxType.Escrow.CreateEscrow:
        return createEscrowTxRows;
      case TxType.Escrow.UpdateEscrow:
        return updateEscrowTxRows;
      case TxType.Escrow.RefundEscrow:
        return refundEscrowTxRows;
      case TxType.Escrow.TransferToEscrow:
        return transferToEscrowTxRows;
      default:
        return starnameTxRows;
    }
  }, [transaction]);
  if (!props.open) return null;
  return (
    <TableRow className={"transaction-detail-view"}>
      <TableCell className={"transaction-detail-view-row-content"} colSpan={3}>
        <Block className={"transaction-detail-view-row-wrapper"}>
          {rows.map((row: Row, index: number): React.ReactElement => {
            return (
              <DetailRow
                key={index}
                transaction={transaction}
                cells={row.cells}
              />
            );
          })}
        </Block>
      </TableCell>
    </TableRow>
  );
};
