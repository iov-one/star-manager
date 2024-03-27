import React from "react";
import {
  isTransactionFailure,
  isTransactionSuccess,
  PostTxResult,
} from "types/postTxResult";
import { TxError } from "types/txError";

type TxPromiseHandler = (promise: Promise<PostTxResult>) => Promise<string>;

export enum TxHandlerStatus {
  Idle,
  Handling,
  Done,
}

export const useTxPromiseHandler = (): [TxPromiseHandler, TxHandlerStatus] => {
  const [status, setStatus] = React.useState<TxHandlerStatus>(
    TxHandlerStatus.Idle,
  );
  const handler = async (promise: Promise<PostTxResult>): Promise<string> => {
    setStatus(TxHandlerStatus.Handling);

    try {
      const result = await promise;
      if (isTransactionSuccess(result)) {
        return result.transactionHash;
      } else if (isTransactionFailure(result)) {
        throw new TxError(result);
      } else {
        throw new Error("unknown error");
      }
    } finally {
      setStatus(TxHandlerStatus.Done);
    }
  };

  return [handler, status];
};
