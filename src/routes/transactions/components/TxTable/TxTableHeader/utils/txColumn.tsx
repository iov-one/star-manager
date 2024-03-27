import { TableCell } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";

interface Props {}

const useStyles = makeStyles({
  cell: {
    padding: 24,
    border: "none",
  },
});

const TxColumn: React.FC<React.PropsWithChildren<Props>> = (
  props: React.PropsWithChildren<Props>,
): React.ReactElement => {
  const styles = useStyles();
  return <TableCell className={styles.cell}>{props.children}</TableCell>;
};

export default TxColumn;
