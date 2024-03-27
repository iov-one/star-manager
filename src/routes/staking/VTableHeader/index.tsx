import "./style.scss";

import {
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import locales from "locales/strings";
import React from "react";
import theme from "theme";

const VTableHeader = (): React.ReactElement => {
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  return (
    <TableHead className="validators-table-content-header">
      <TableRow>
        <TableCell className="validators-header-name-cell">
          <Typography variant={"subtitle2"}>{locales.VALIDATOR}</Typography>
        </TableCell>
        {!hidden && (
          <TableCell align={"right"} width={theme.spacing(10)}>
            <Typography variant={"subtitle2"}>
              {locales.VALIDATOR_VOTING_POWER}
            </Typography>
          </TableCell>
        )}
        <TableCell>
          <Typography align={"center"} variant={"subtitle2"}>
            {locales.VALIDATOR_COMMISSION}
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default VTableHeader;
