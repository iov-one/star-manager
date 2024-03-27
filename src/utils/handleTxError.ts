import { IovLedgerAppErrorState } from "@iov/ledger-iovns";
import toast, { ToastType } from "components/toast";
import { TxRejected } from "constants/errorCodes";
import { ERROR_IGNORED } from "genericConstants";
import strings from "locales/strings";
import { TaskError } from "logic/httpClient";
import { PinataError } from "pinata";
import { isTxError, TxError } from "types/txError";

import isAccountNotExistsOnChain from "./isAccountNotExistsOnChain";
import { isRequestRejectedError } from "./isRequestRejectedError";
import { isStargateClientSdkBroadcastError } from "./isStargateClientSdkBroadcastError";

type GenericErrorType = TaskError | Error | IovLedgerAppErrorState | string;

export const getTxError = (error: GenericErrorType): string => {
  if (isStargateClientSdkBroadcastError(error)) {
    return errorHandler(TxError.fromStargateClientError(error));
  } else if (isRequestRejectedError(error)) {
    return errorHandler(TxError.fromCode(TxRejected));
  }
  return errorHandler(error);
};

export const handleTxError = (error: GenericErrorType): void => {
  const message = getTxError(error);
  if (message === ERROR_IGNORED) return;
  toast.show(message, ToastType.Error);
};

const errorHandler = (error: GenericErrorType): string => {
  console.warn(error);
  if (isTxError(error)) {
    return error.message;
  } else if (isAccountNotExistsOnChain(error)) {
    return strings.ACCOUNT_DOESNT_EXIST_ON_CHAIN;
  } else if (error instanceof PinataError) {
    return error.message;
  } else if (typeof error === "string") {
    console.warn(error);
    return ERROR_IGNORED;
  } else if ("returnCode" in error) {
    if (error.returnCode === 0x6986) {
      // Ignore this cause it means the user rejected to sign the
      // transaction
      return ERROR_IGNORED;
    } else {
      return error.errorMessage;
    }
  } else if ("code" in error && error.code === -1) {
    return ERROR_IGNORED; // Ignore, it was aborted
  } else if ("message" in error) {
    if (error.message === "rejected") return ERROR_IGNORED;
    return strings.UNEXPECTED_ERROR;
  } else if (typeof error.body === "undefined") {
    return strings.UNKNOWN_ERROR;
  } else if (typeof error.body === "string") {
    return error.body;
  } else if ("error" in error.body) {
    const { error: message } = error.body;
    return message;
  }
  return ERROR_IGNORED;
};
