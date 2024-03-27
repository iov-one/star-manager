import { TablePagination } from "@material-ui/core";
import locales from "locales/strings";
import React from "react";

import TablePaginationActions from "./PaginationActions";

interface Props {
  validatorsCount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
}

const VTablePagination = (props: Props): React.ReactElement => {
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ): void => {
    props.setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    props.setRowsPerPage(parseInt(event.target.value, 10));
    props.setPage(0);
  };
  return (
    <TablePagination
      component={"div"}
      rowsPerPageOptions={[5, 10, 25, { label: locales.ALL, value: -1 }]}
      count={props.validatorsCount}
      rowsPerPage={props.rowsPerPage}
      page={props.page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      ActionsComponent={TablePaginationActions}
    />
  );
};

export default VTablePagination;
