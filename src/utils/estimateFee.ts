import { EncodeObject } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
import config from "config";
import { TxType } from "signers/starnameRegistry";
import { isKeyOf } from "utils/isKeyOf";

const getResourcesCount = (msg: EncodeObject): number => {
  const { value } = msg;
  if ("newResources" in value) {
    const { newResources } = value;
    return newResources.length;
  } else if ("resources" in value) {
    const { resources } = value;
    return resources.length;
  } else {
    throw new Error("not a resources related message");
  }
};

export const estimateFee = (msgs: ReadonlyArray<EncodeObject>): StdFee => {
  const { gasMap, gasPrice } = config;
  const totalGas = msgs.reduce(
    (_totalGas: number, msg: EncodeObject): number => {
      const msgType = msg.typeUrl;
      if (
        msgType === TxType.Starname.RegisterAccount ||
        msgType === TxType.Starname.ReplaceAccountResources
      ) {
        const msgGas: number | undefined =
          gasMap[TxType.Starname.ReplaceAccountResources];
        return (
          _totalGas + (msgGas * getResourcesCount(msg) + gasMap.default / 2)
        );
      } else if (isKeyOf(msgType, gasMap)) {
        return _totalGas + gasMap[msgType];
      } else {
        return _totalGas + gasMap.default;
      }
    },
    0,
  );
  return {
    amount: [
      {
        denom: gasPrice.denom,
        amount: (Number(gasPrice.amount) * totalGas).toFixed(0),
      },
    ],
    gas: totalGas.toFixed(0),
  };
};
