import { Typography } from "@material-ui/core";
import noTransactions from "assets/noTransactions.svg";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";

const NoTransactions = (): React.ReactElement => (
  <Block
    display={"flex"}
    flexDirection={"column"}
    justifyContent={"center"}
    paddingTop={"100px"}
  >
    <img src={noTransactions} alt={"no transactions"} />
    <Block margin={4} />
    <Block padding={2}>
      <Typography variant={"subtitle1"} align={"center"}>
        {locales.NO_TRANSACTIONS}
      </Typography>
      <Block margin={0.5} />
      <Typography
        variant={"subtitle1"}
        color={"textSecondary"}
        align={"center"}
      >
        {locales.MAKE_FIRST_TRANSACTION}
      </Typography>
    </Block>
  </Block>
);

export default NoTransactions;
