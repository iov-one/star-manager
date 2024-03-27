import { isTransactionFailure } from "types/postTxResult";

// only for use of payment wallets, can't be covered with useTxPromiseHandler
const isInsufficientFundsError = (error: Error | any): boolean => {
  if (error instanceof Error) {
    if (isTransactionFailure(error) && error.code === 5) return true;
  }
  return false;
};

export { isInsufficientFundsError };
