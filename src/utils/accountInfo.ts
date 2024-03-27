import { StdSignDoc } from "@cosmjs/amino";
import api from "api";

export interface AccountInfo {
  readonly accountNumber: string;
  readonly sequence: string;
}

export const getBestAccountInfoMatch = async (
  signable: StdSignDoc,
  address: string,
): Promise<AccountInfo> => {
  if (
    signable.account_number !== undefined &&
    signable.sequence !== undefined
  ) {
    return {
      accountNumber: signable.account_number,
      sequence: signable.sequence,
    };
  } else {
    const account = await api.getAccount(address);
    if (account === undefined) {
      throw new Error("cannot determine account number or sequence");
    }
    return {
      accountNumber: account.accountNumber,
      sequence: account.sequence,
    };
  }
};
