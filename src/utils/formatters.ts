import { StdFee } from "@cosmjs/amino";
import { Amount } from "types/amount";

export const feeToAmount = (fee: StdFee): Amount => {
  return Amount.from(
    fee.amount.reduce((acc, coin) => acc + Number(coin.amount), 0),
  );
};

export const formatAmount = (coins: ReadonlyArray<Amount>): string => {
  return coins.map((c) => c.format()).join(", ");
};

export const formatTimestamp = (timestamp: Date): string =>
  timestamp.toLocaleTimeString();

export const formatDeadline = (deadline: Date): string =>
  deadline.toLocaleDateString();
