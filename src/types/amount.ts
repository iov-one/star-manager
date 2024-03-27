import { Coin } from "@cosmjs/amino";
import api from "api";
import { TokenLike } from "config";
import abbreviate from "utils/abbreviateNumber";

export interface CoinLike {
  amount: number;
  token: TokenLike;
  format(): string;
}

export class Amount implements CoinLike {
  public amount: number;
  public token: TokenLike;

  constructor(amount: number, token: TokenLike) {
    this.amount = amount;
    this.token = token;
  }

  public static from(uTokens: number): Amount {
    return new Amount(uTokens, api.getMainToken());
  }

  public static fromValue(value: number): Amount {
    const token = api.getMainToken();
    return new Amount(value * token.subunitsPerUnit, token);
  }

  public format(abbrv = false): string {
    const { token } = this;
    const value: number = this.amount / token.subunitsPerUnit;
    const fractionDigits: number = Math.log10(token.subunitsPerUnit);
    return (
      (abbrv
        ? abbreviate(value, 2, 0)
        : value.toLocaleString(undefined, {
            maximumFractionDigits: fractionDigits,
            minimumFractionDigits: 2,
          })) +
      " " +
      token.ticker
    );
  }

  public getFractionalValue(): number {
    const { token } = this;
    return Math.round(this.amount / token.subunitsPerUnit);
  }

  public getDenom(): string {
    const { token } = this;
    return token.ticker;
  }

  public toCoins(): ReadonlyArray<Coin> {
    return [
      {
        amount: Math.round(this.amount).toString(),
        denom: this.token.subunitName,
      },
    ];
  }
}

export const toInternalCoins = (
  coins: ReadonlyArray<Coin>,
  tokens: { [p: string]: TokenLike },
): ReadonlyArray<Amount> => {
  return coins.map(
    (item: Coin): Amount => new Amount(Number(item.amount), tokens[item.denom]),
  );
};

export const isAmount = (
  candidates: ReadonlyArray<any>,
): candidates is ReadonlyArray<Amount> => {
  return candidates.every(
    (candidate: any): boolean =>
      candidate !== null && "amount" in candidate && "token" in candidate,
  );
};
