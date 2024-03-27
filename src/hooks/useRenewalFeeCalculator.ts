import api from "api";
import { TokenLike } from "config";
import React from "react";
import { Amount } from "types/amount";
import { NameItem } from "types/nameItem";
import { NameType } from "types/nameType";

export const useRenewalFeeCalculator = (item: NameItem): Amount | undefined => {
  const [accountsNum, setAccountsNum] = React.useState<number | null>(null);
  const [amount, setAmount] = React.useState<Amount | undefined>(undefined);

  React.useEffect(() => {
    if (item.type === NameType.Account) return;
    item.getAccountsNumInDomain().then(setAccountsNum);
  }, [item]);

  React.useEffect(() => {
    if (accountsNum === null) return;
    const fees = api.getFees();
    // this fee is based on domain's length
    const baseRenewalFee = item.getClosedDomainRegistrationFee(
      item.getDomainName(),
      fees,
    );
    const token: TokenLike | undefined = api.getToken(fees.feeCoinDenom);
    if (token === undefined)
      throw new Error("cannot get price for denom `" + fees.feeCoinDenom + "'");
    const price = baseRenewalFee + accountsNum * fees.registerAccountClosed;
    setAmount(new Amount(price / fees.feeCoinPrice, token));
  }, [accountsNum, item]);
  return amount;
};
