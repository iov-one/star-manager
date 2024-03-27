import "./style.scss";

import {
  Avatar,
  TableCell,
  TableRow,
  Theme,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { Block } from "components/block";
import React from "react";
import { Validator } from "types/delegationValidator";
import abbreviate from "utils/abbreviateNumber";

interface RowProps {
  validator: Validator;
  logo: string | undefined;
  showDelegationDialog: (validator: Validator) => void;
}

const ValidatorRow = ({
  validator,
  showDelegationDialog,
  logo,
}: RowProps): React.ReactElement => {
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <TableRow
      hover={true}
      onClick={() => showDelegationDialog(validator)}
      key={validator.operator_address}
      className={"validators-table-content-row"}
    >
      <TableCell
        align={"center"}
        className={"validators-table-content-row-title"}
      >
        <Block className={"validators-table-content-row-title-container"}>
          <Avatar alt={validator.description.moniker} src={logo} />
          <Typography style={{ marginLeft: "16px" }}>
            {validator.description.moniker}
          </Typography>
        </Block>
      </TableCell>
      {!hidden && (
        <TableCell
          align={"right"}
          className={"validators-table-content-row-voting-power"}
        >
          {abbreviate(Number(validator.tokens))}
        </TableCell>
      )}
      <TableCell
        align={"center"}
        className={"validators-table-content-row-commission"}
      >
        {(parseFloat(validator.commission.commission_rates.rate) * 100)
          .toFixed(2)
          .replace(/\.?0*$/g, "") + "%"}
      </TableCell>
    </TableRow>
  );
};

export default ValidatorRow;
