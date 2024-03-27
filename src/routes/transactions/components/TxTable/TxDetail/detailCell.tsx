import { Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { Cell } from "routes/transactions/components/TxTable/TxDetail/cell";
import { ITransaction as Transaction } from "types/transaction";

interface Props {
  cell: Cell;
  transaction: Transaction;
}

const useStyles = makeStyles((theme: Theme) => ({
  hint: {
    color: theme.palette.text.hint,
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  cell: {
    border: "none",
    "&:first-child": {
      paddingLeft: 72,
    },
    "&:last-child": {
      paddingRight: 32,
    },
  },
}));

export const DetailCell: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { cell, transaction } = props;
  const classes = useStyles();
  const value: string = React.useMemo((): string => {
    if (typeof cell.value === "undefined") {
      return "";
    } else if (typeof cell.value === "function") {
      return cell.format
        ? cell.format(cell.value(transaction))
        : cell.value(transaction);
    } else {
      const value: any = transaction[cell.value];
      if (typeof value === "string") {
        return value;
      } else {
        return cell.format ? cell.format(value) : locales.UNKNOWN;
      }
    }
  }, [cell, transaction]);
  const label: string = React.useMemo((): string => {
    if (typeof cell.label === "string") {
      return cell.label;
    } else if (typeof cell.label === "function") {
      return cell.label(transaction);
    } else {
      return "";
    }
  }, [cell, transaction]);
  return (
    <Block className={"transaction-detail-view-cell"}>
      <Block>
        <Typography
          color={"textPrimary"}
          variant={"subtitle2"}
          component={"div"}
        >
          {label}
        </Typography>
      </Block>
      <Block>
        <Typography
          className={classes.hint}
          variant={"subtitle2"}
          component={"div"}
        >
          {value}
        </Typography>
      </Block>
    </Block>
  );
};
