import "./styles.scss";

import { TableCell, Typography } from "@material-ui/core";
import caret from "assets/arrow-down-grey.svg";
import { Block } from "components/block";
import React from "react";
import {
  getImageSource,
  getTitleSubject,
  getTitleVerb,
} from "routes/transactions/components/TxTable/helpers";
import { ITransaction as Transaction } from "types/transaction";
import { formatAmount } from "utils/formatters";

interface Props {
  readonly transaction: Transaction;
}

export const Columns: React.FC<Props> = (props: Props): React.ReactElement => {
  const { transaction } = props;
  const { time } = transaction;
  return (
    <>
      <TableCell className={"transactions-table-cell"}>
        <Block className={"transactions-table-cell-content"}>
          <Block className={"transactions-table-cell-content-avatar"}>
            <img src={getImageSource(transaction)} alt={"transaction"} />
          </Block>
          <Block className={"transactions-table-cell-content-title"}>
            <Typography
              className={"transactions-table-cell-content-title-verb"}
              color={"textPrimary"}
              variant={"subtitle2"}
            >
              {getTitleVerb(transaction)}
            </Typography>
            <Typography
              className={"transactions-table-cell-content-title-subject"}
              color={"textSecondary"}
              variant={"subtitle2"}
            >
              {/* FIXME: this probably will need the ... in the middle trick */}
              {getTitleSubject(transaction)}
            </Typography>
          </Block>
        </Block>
      </TableCell>
      <TableCell className={"transactions-table-cell"}>
        <Typography color={"textPrimary"} variant={"subtitle2"}>
          {time.toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell
        className={"transactions-table-cell transactions-table-cell-amount"}
      >
        <Block className={"transactions-table-cell-amount-amount"}>
          <Typography color={"textPrimary"} variant={"subtitle2"}>
            {formatAmount(transaction.amount)}
          </Typography>
          <Block width={16} marginLeft={8}>
            <img src={caret} alt={"arrow"} />
          </Block>
        </Block>
      </TableCell>
    </>
  );
};
