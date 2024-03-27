import avatar from "assets/avatar.svg";
import locales from "locales/strings";
import React from "react";
import { TxType } from "signers/starnameRegistry";
import { Validator } from "types/delegationValidator";
import {
  isDelegationData,
  isRedelegationData,
  isStarnameData,
  ITransaction as Transaction,
} from "types/transaction";

const getValidatorName = (validator: Validator): string => {
  const { description } = validator;
  return description.moniker;
};

export const getTitleVerb = (transaction: Transaction): string => {
  switch (transaction.type) {
    case TxType.Starname.RegisterAccount:
      return locales.REGISTER_ACCOUNT;
    case TxType.Starname.TransferAccount:
      return locales.TRANSFER_ACCOUNT;
    case TxType.Starname.DeleteAccount:
      return locales.DELETE_ACCOUNT;
    case TxType.Starname.RenewAccount:
      return locales.RENEW_ACCOUNT;
    case TxType.Starname.ReplaceAccountMetadata:
      return locales.SET_METADATA;
    case TxType.Starname.ReplaceAccountResources:
      return locales.SET_RESOURCES;
    case TxType.Starname.RegisterDomain:
      return locales.REGISTER_DOMAIN;
    case TxType.Starname.TransferDomain:
      return locales.TRANSFER_DOMAIN;
    case TxType.Starname.DeleteDomain:
      return locales.DELETE_DOMAIN;
    case TxType.Starname.RenewDomain:
      return locales.RENEW_DOMAIN;
    case TxType.Starname.AddAccountCertificate:
      return locales.ADD_ACCOUNT_CERTIFICATE;
    case TxType.Starname.DeleteAccountCertificate:
      return locales.DELETE_ACCOUNT_CERTIFICATE;
    case TxType.Escrow.CreateEscrow:
      return locales.STARNAME_ESCROW_SETUP;
    case TxType.Escrow.RefundEscrow:
      return locales.REMOVE_ESCROW;
    case TxType.Escrow.TransferToEscrow:
      return locales.STARNAME_SOLD;
    case TxType.Escrow.UpdateEscrow:
      return locales.UPDATE_ESCROW;
    case TxType.Bank.Send:
      return locales.TO;
    case TxType.Virtual.Receive:
      return locales.FROM;
    case TxType.Staking.Delegate:
      return locales.DELEGATE;
    case TxType.Staking.Undelegate:
      return locales.UNDELEGATE;
    case TxType.Staking.BeginRedelegate:
      return locales.REDELEGATE;
    case TxType.Distribution.WithdrawDelegatorReward:
      return locales.CLAIM_REWARDS;
    default:
      return locales.UNKNOWN;
  }
};
export const getImageSource = (transaction: Transaction): string => {
  switch (transaction.type) {
    case TxType.Bank.Send:
    case TxType.Virtual.Receive:
      return avatar;
    case TxType.Starname.RegisterAccount:
      break;
    case TxType.Starname.TransferAccount:
      break;
    case TxType.Starname.DeleteAccount:
      break;
    case TxType.Starname.RenewAccount:
      break;
    case TxType.Starname.ReplaceAccountMetadata:
      break;
    case TxType.Starname.ReplaceAccountResources:
      break;
    case TxType.Starname.RegisterDomain:
      break;
    case TxType.Starname.TransferDomain:
      break;
    case TxType.Starname.DeleteDomain:
      break;
    case TxType.Starname.RenewDomain:
      break;
    case TxType.Starname.AddAccountCertificate:
      break;
    case TxType.Starname.DeleteAccountCertificate:
      break;
    case TxType.Virtual.GenericStarname:
      break;
    default:
      break;
  }
  return avatar;
};

export const getTitleSubject = (
  transaction: Transaction,
): string | React.ReactElement => {
  const { data } = transaction;
  switch (transaction.type) {
    case TxType.Starname.RegisterAccount:
    case TxType.Starname.TransferAccount:
    case TxType.Starname.DeleteAccount:
    case TxType.Starname.RenewAccount:
    case TxType.Starname.ReplaceAccountMetadata:
    case TxType.Starname.ReplaceAccountResources:
    case TxType.Starname.RegisterDomain:
    case TxType.Starname.TransferDomain:
    case TxType.Starname.DeleteDomain:
    case TxType.Starname.RenewDomain:
    case TxType.Starname.AddAccountCertificate:
    case TxType.Starname.DeleteAccountCertificate:
    case TxType.Virtual.GenericStarname:
    case TxType.Escrow.CreateEscrow:
    case TxType.Escrow.RefundEscrow:
    case TxType.Escrow.TransferToEscrow:
    case TxType.Escrow.UpdateEscrow:
      if (typeof data === "string") return data;
      if (isStarnameData(data)) {
        if (data.domain !== undefined) {
          return [data.name, data.domain].join("*");
        }
        return `*${data.name}`;
      } else {
        return locales.UNKNOWN;
      }
    case TxType.Bank.Send:
      if (typeof data !== "string") return locales.INVALID;
      return data;
    case TxType.Virtual.Receive:
      return transaction.sender ?? "";
    case TxType.Staking.Delegate:
    case TxType.Staking.Undelegate:
      if (isDelegationData(data)) {
        return getValidatorName(data);
      } else {
        return locales.UNKNOWN;
      }
    case TxType.Staking.BeginRedelegate:
      if (isRedelegationData(data)) {
        return `${getValidatorName(data.src)} to ${getValidatorName(data.dst)}`;
      } else {
        return locales.UNKNOWN;
      }
    case TxType.Distribution.WithdrawDelegatorReward:
      if (typeof data === "string") {
        return `From ${data}`;
      } else return locales.UNKNOWN;
    default:
      return locales.UNKNOWN;
  }
};
