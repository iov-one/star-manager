import api from "api";
import deepEqual from "fast-deep-equal";
import { action, computed, observable } from "mobx";
import { EscrowState } from "proto/iov/escrow/v1beta1/types";
import React from "react";
import { Amount } from "types/amount";
import { Escrow, ModifiableEscrowFields } from "types/escrow";
import { NameItem } from "types/nameItem";

import { AddressResolver } from "./addressResolver";

export type CurrencyTypes = "iov" | "usd" | "eur";

interface PriceConversionObject {
  usd: number;
  eur: number;
}

export class EscrowStore extends AddressResolver {
  // address member from this class will be used as seller address
  @observable currency: CurrencyTypes = "iov";
  @observable priceConversionObject: PriceConversionObject | null = null;
  @observable deadline: Date | null = null;
  @observable amountString = "";

  @observable escrow: Escrow | null = null;

  @observable maxDate = new Date();
  @observable minDate = new Date();

  @computed
  public get amount(): Amount {
    const parsed = parseFloat(this.amountString);
    if (this.currency === "iov") return Amount.fromValue(parsed);
    else {
      if (this.priceConversionObject === null)
        throw new Error("cant convert amount without price conversion object");
      return Amount.fromValue(
        Math.round(parsed / this.priceConversionObject[this.currency]),
      );
    }
  }

  @computed
  public get amountValue(): number {
    return parseFloat(this.amountString);
  }

  @computed
  public get isValidDeadline(): boolean {
    if (this.deadline === null) return false;
    const dateValue = this.deadline.getTime();
    return dateValue > Date.now() &&
      dateValue <= Date.now() + api.getSettings().escrowMaxPeriod
      ? true
      : false;
  }

  @computed
  public get isValidAmount(): boolean {
    return this.amount.getFractionalValue() > 0;
  }

  @computed
  public get escrowParsedDeadline(): Date {
    if (this.escrow === null) throw new Error("escrow not initialized");
    return new Date(parseInt(this.escrow.deadline) * 1000);
  }

  @computed
  public get escrowParsedAmount(): Amount {
    if (this.escrow === null) throw new Error("escrow not initialized");
    return Amount.from(Math.ceil(parseFloat(this.escrow.price[0].amount)));
  }

  @computed
  public get hasEscrowStateChanged(): boolean {
    if (this.escrow === null) return false;
    return deepEqual(
      {
        amount: this.escrowParsedAmount.getFractionalValue().toString(),
        deadline: this.escrowParsedDeadline,
        seller: this.escrow.seller,
      } as ModifiableEscrowFields,
      {
        amount: this.amount.getFractionalValue().toString(),
        deadline: this.deadline,
        seller: this.address,
      } as ModifiableEscrowFields,
    );
  }

  @computed
  public get escrowState(): EscrowState {
    if (this.escrow === null) return EscrowState.ESCROW_STATE_EXPIRED;
    return this.escrow.state;
  }

  @action.bound
  public setPriceConversionObject(value: PriceConversionObject): void {
    this.priceConversionObject = value;
  }

  @action.bound
  public setCurrency(value: CurrencyTypes): void {
    this.currency = value;
  }

  @action.bound
  public setAmountString(value: string): void {
    this.amountString = value;
  }

  @action.bound
  public setDeadline(value: Date | null): void {
    this.deadline = value;
  }

  @action.bound
  public setEscrow(value: Escrow): void {
    this.escrow = value;
  }

  @action.bound
  public initEscrow(value: Escrow): void {
    this.setEscrow(value);

    // init other values as well
    this.setAmountString(
      this.escrowParsedAmount.getFractionalValue().toString(),
    );
    this.setDeadline(new Date(parseInt(value.deadline) * 1000));
    this.setAddressOrStarname(value.seller);
  }

  @action.bound
  public setDateCaps(item: NameItem): void {
    const validUntil = item.validUntil();
    const now = Date.now();
    if (validUntil <= now) return;
    this.minDate = new Date(now);
    const maxEscrowAllowedDate = new Date(
      now + api.getSettings().escrowMaxPeriod,
    );
    this.maxDate =
      validUntil > maxEscrowAllowedDate.getTime()
        ? maxEscrowAllowedDate
        : new Date(validUntil - 1000 * 3600 * 24);
  }

  @action.bound
  public resetEscrowState(): void {
    if (this.escrow === null) return;
    this.currency = "iov";
    this.amountString = this.escrowParsedAmount.getFractionalValue().toString();
    this.setAddressOrStarname(this.escrow.seller);
    this.deadline = this.escrowParsedDeadline;
  }

  @action.bound
  public reset(): void {
    this.amountString = "";
    this.currency = "iov";
    this.priceConversionObject = null;
    this.deadline = null;
    this.escrow = null;
    this.maxDate = new Date();
    this.minDate = new Date();
  }
}

export const EscrowStoreContext = React.createContext<EscrowStore>(
  new EscrowStore(),
);
