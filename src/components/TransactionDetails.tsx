import { StdFee } from "@cosmjs/amino";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React from "react";
import { Amount } from "types/amount";
import { feeToAmount, formatAmount } from "utils/formatters";

interface Props {
  readonly amount: Amount | undefined;
  readonly fee: StdFee;
  readonly disabled: boolean;
}

const TransactionDetails: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { amount, fee } = props;
  const feeAmount = feeToAmount(fee);
  const formattedFee: string = formatAmount([feeAmount]);
  const amountDisplay: string =
    amount !== undefined ? formatAmount([amount]) : "";
  const total: Amount =
    amount !== undefined
      ? new Amount(amount.amount + feeAmount.amount, amount.token)
      : Amount.fromValue(0);

  return (
    <Accordion variant={"elevation"} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        disabled={props.disabled}
      >
        <Typography>
          {"Transaction Cost" +
            (props.disabled ? "" : " : " + total.format(true))}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>{"Amount"}</TableCell>
                <TableCell align="right">{amountDisplay}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{"Transaction Fee(s)"}</TableCell>
                <TableCell align="right">{formattedFee}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell align="right">{total.format()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default TransactionDetails;
