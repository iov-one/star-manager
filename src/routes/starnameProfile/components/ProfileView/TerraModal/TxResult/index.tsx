import "./style.scss";

import { InputAdornment, OutlinedInput, Typography } from "@material-ui/core";
import { DoneAll } from "@material-ui/icons";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";

interface Props {
  starname: string;
  amount: number;
  asset: string;
}

const TxResult = (props: Props): React.ReactElement => {
  const { amount, asset, starname } = props;
  const formattedAmount = `${amount.toString()} ${asset.toUpperCase()}`;
  return (
    <Block className="tx-result-container">
      <Block className="head">
        <DoneAll fontSize="large" color={"primary"} />
        <Typography align={"center"} variant={"h6"}>
          {locales.SUCCESS}
        </Typography>
      </Block>
      <OutlinedInput
        readOnly={true}
        defaultValue={starname}
        startAdornment={
          <InputAdornment position={"start"}>{locales.SENT_TO}</InputAdornment>
        }
      />
      <OutlinedInput
        readOnly={true}
        defaultValue={formattedAmount}
        startAdornment={
          <InputAdornment position={"start"}>{locales.AMOUNT}</InputAdornment>
        }
      />
    </Block>
  );
};

export default TxResult;
