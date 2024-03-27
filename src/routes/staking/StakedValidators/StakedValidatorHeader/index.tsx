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

const StakedValidatorsHeader = (): React.ReactElement => {
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <TableHead className="staked-validators-header">
      <TableRow>
        <TableCell className="staked-validators-header-name-cell">
          <Typography variant={"subtitle2"}>{locales.VALIDATOR}</Typography>
        </TableCell>
        <TableCell align="center">
          <Typography variant={"subtitle2"}>{locales.STAKED_AMOUNT}</Typography>
        </TableCell>
        {!hidden && (
          <TableCell align={"center"} width={theme.spacing(10)}>
            <Typography variant={"subtitle2"}>{locales.REWARDS}</Typography>
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
};

export default StakedValidatorsHeader;
