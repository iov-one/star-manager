import { StdFee } from "@cosmjs/stargate";
import React from "react";
import { GasEstimatorContext } from "signers/gasEstimator";
import { Wallet } from "signers/wallet";
import { isFee, PostTxResult } from "types/postTxResult";
import { ZERO_FEE } from "utils/zeroFee";

export const useFeeEstimator = (
  simulate: (wallet: Wallet) => Promise<PostTxResult>,
  dependencies: ReadonlyArray<any> = [],
): StdFee => {
  const wallet = React.useContext(GasEstimatorContext);
  const [fee, setFee] = React.useState<StdFee>(ZERO_FEE);
  React.useEffect((): void => {
    if (fee === ZERO_FEE) {
      simulate(wallet).then((result: PostTxResult): void => {
        if (isFee(result)) {
          setFee(result);
        }
      });
    }
  }, [fee, simulate, wallet, ...dependencies]);
  return fee;
};
