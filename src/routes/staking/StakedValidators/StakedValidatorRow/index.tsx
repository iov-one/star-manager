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
import StyledBadge from "routes/staking/StyledBadge";
import { Amount } from "types/amount";
import { Validator } from "types/delegationValidator";

interface RowProps {
  validator: Validator;
  logo: string | undefined;
  showDelegationDialog: (validator: Validator) => void;
  delegationToValidator: Amount;
  rewardFromValidator: Amount;
}

const StakedValidatorRow = ({
  validator,
  showDelegationDialog,
  logo,
  delegationToValidator,
  rewardFromValidator,
}: RowProps): React.ReactElement => {
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <TableRow
      key={validator.operator_address}
      hover={true}
      onClick={() => showDelegationDialog(validator)}
      className={"staked-validator-table-content-row"}
    >
      <TableCell
        align={"center"}
        className={"staked-validator-table-content-row-title"}
      >
        <Block className={"staked-validator-table-content-row-title-container"}>
          <StyledBadge
            overlap={"circular"}
            variant={"dot"}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Avatar alt={validator.description.moniker} src={logo} />
          </StyledBadge>
          <Typography style={{ marginLeft: "16px" }}>
            {validator.description.moniker}
          </Typography>
        </Block>
      </TableCell>
      <TableCell
        align={"center"}
        className={"staked-validator-table-content-row-delegation"}
      >
        {delegationToValidator.format(true)}
      </TableCell>
      {!hidden && (
        <TableCell
          align={"center"}
          className={"staked-validator-table-content-row-rewards"}
        >
          {rewardFromValidator.format(true)}
        </TableCell>
      )}
    </TableRow>
  );
};

export default StakedValidatorRow;
