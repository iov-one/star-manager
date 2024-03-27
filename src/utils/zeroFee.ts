import { StdFee } from "@cosmjs/amino";
import config from "config";

export const ZERO_FEE: StdFee = {
  gas: "0",
  amount: [
    {
      amount: "0",
      denom: config.gasPrice.denom,
    },
  ],
};
