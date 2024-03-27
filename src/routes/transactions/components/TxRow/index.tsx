import "./styles.scss";

import { TableRow } from "@material-ui/core";
import React from "react";
import { Columns } from "routes/transactions/components/Columns";
import { TxDetail } from "routes/transactions/components/TxTable/TxDetail";
import { ITransaction as Transaction } from "types/transaction";

interface Props {
  transaction: Transaction;
}

export const TxRow: React.FC<Props> = (props: Props): React.ReactElement => {
  const [showDetails, setShowDetails] = React.useState<boolean>(false);
  const toggleShowDetails = (): void => setShowDetails(!showDetails);
  return (
    <>
      <TableRow
        classes={{ root: "transactions-table-row" }}
        onClick={toggleShowDetails}
      >
        <Columns transaction={props.transaction} />
      </TableRow>
      <TxDetail open={showDetails} transaction={props.transaction} />
    </>
  );
};
