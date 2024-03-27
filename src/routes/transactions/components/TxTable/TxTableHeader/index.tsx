import { TableHead, TableRow, Typography } from "@material-ui/core";
import locales from "locales/strings";
import React from "react";
import TxColumn from "routes/transactions/components/TxTable/TxTableHeader/utils/txColumn";
import TxSortableColumn from "routes/transactions/components/TxTable/TxTableHeader/utils/txSortableColumn";

interface Props {
  className: string;
}

const TxTableHeader: React.FC<Props> = (props: Props): React.ReactElement => {
  const onSort = (): void => {
    console.warn("sort is not implemented yet");
  };
  return (
    <TableHead className={props.className}>
      <TableRow className={props.className}>
        <TxColumn>
          <Typography variant={"subtitle2"}>
            {locales.TRANSACTIONS_TAB_TITLE}
          </Typography>
        </TxColumn>
        <TxSortableColumn name={"date"} onSort={onSort}>
          <Typography variant={"subtitle2"}>{locales.DATE}</Typography>
        </TxSortableColumn>
        <TxColumn>
          <Typography variant={"subtitle2"}>{locales.AMOUNT}</Typography>
        </TxColumn>
      </TableRow>
    </TableHead>
  );
};

export default TxTableHeader;
