import { DeliverTxResponse } from "@cosmjs/stargate";
import { TxErrorCodeNotFound, TxRejected } from "constants/errorCodes";
import {
  CosmosErrors,
  EscrowErrors,
  StarnameErrors,
} from "constants/sdkErrors";
import strings from "locales/strings";

import { Codespace } from "./codespace";

const getCodespace = (error: DeliverTxResponse): Codespace => {
  const { rawLog } = error;
  if (!rawLog) return Codespace.Unknown;
  const indexOfLastColon = rawLog.lastIndexOf(":");
  // move to next word after space
  const sdkError = rawLog.slice(indexOfLastColon + 2);
  return Object.values(StarnameErrors).includes(sdkError)
    ? Codespace.Starname
    : Object.values(EscrowErrors).includes(sdkError)
    ? Codespace.Escrow
    : Object.values(CosmosErrors).includes(sdkError)
    ? Codespace.Cosmos
    : Codespace.Unknown;
};

const getErrorBasedOnCodespace = (
  codespace: Codespace,
  code: number,
): string => {
  switch (codespace) {
    case Codespace.Cosmos:
      return CosmosErrors[code];
    case Codespace.Starname:
      return StarnameErrors[code];
    case Codespace.Escrow:
      return EscrowErrors[code];
    case Codespace.Unknown:
      return strings.TRANSACTION_FAILED;
  }
};

const codespaceFromString = (value: string): Codespace => {
  switch (value) {
    case "starname":
      return Codespace.Starname;
    case "sdk":
      return Codespace.Cosmos;
    case "escrow":
      return Codespace.Escrow;
    default:
      return Codespace.Unknown;
  }
};

// this class is created to handle errors from client
// as well as for errors post chain processing
export class TxError extends Error {
  private raw: DeliverTxResponse;
  private codespace: Codespace;
  public type = "TxError";

  constructor(raw: DeliverTxResponse, codespace?: Codespace) {
    super();
    this.raw = raw;
    this.codespace = codespace ?? getCodespace(raw);
  }

  public static fromCode(code: number, codespace?: Codespace): TxError {
    return new TxError(
      {
        code,
        height: 0,
        transactionHash: "",
        events: [],
        gasUsed: 0,
        gasWanted: 0,
      },
      codespace,
    );
  }

  public static fromStargateClientError(error: Error): TxError {
    const matches = error.message.match(/code\s(.*)\s\(codespace: (.*)\)/);
    return matches
      ? TxError.fromCode(parseInt(matches[1]), codespaceFromString(matches[2]))
      : TxError.fromCode(TxErrorCodeNotFound);
  }

  public get message(): string {
    const { raw } = this;
    // special cases
    if (raw.code === TxRejected) return strings.REQUEST_REJECTED;
    if (raw.code === TxErrorCodeNotFound)
      return strings.TX_ERROR_CODE_NOT_FOUND;
    // check against specific sdk errors
    const error: string = getErrorBasedOnCodespace(this.codespace, raw.code);
    return error.charAt(0).toUpperCase() + error.slice(1);
  }
}

export const isTxError = (value: TxError | any): value is TxError => {
  if (typeof value !== "object") return false;
  if ("type" in value) {
    return value.type === "TxError";
  }
  return false;
};
