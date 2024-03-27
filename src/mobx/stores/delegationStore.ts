import api from "api";
import config from "config";
import locales from "locales/strings";
import { Task } from "logic/httpClient";
import { action, computed, observable } from "mobx";
import React from "react";
import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { DelegationActions } from "types/delegationActions";
import { Validator } from "types/delegationValidator";
import { PostTxResult } from "types/postTxResult";
import { Reward } from "types/rewardsResponse";
import { Delegation } from "types/userDelegationsResponse";

export class DelegationStore {
  @observable address = "";
  @observable currentValidator: Validator | null = null;
  @observable userBalance: Amount = Amount.fromValue(0);
  @observable userDelegations: ReadonlyArray<Delegation> = [];
  @observable userRewards: ReadonlyArray<Reward> = [];
  @observable validators: ReadonlyArray<Validator> = [];
  @observable validatorsLogos: { [key: string]: string | undefined } = {};
  @observable amountString = "";
  @observable bannerVisible = true;
  @observable currentAction: DelegationActions = DelegationActions.DELEGATE;
  @observable refreshData = false;
  @observable destinationValidator: Validator | null = null;

  @action.bound
  public setValidators(validators: ReadonlyArray<Validator>): void {
    this.validators = validators;
  }

  @action.bound
  private setValidatorsLogos(validatorsLogos: {
    [key: string]: string | undefined;
  }): void {
    this.validatorsLogos = validatorsLogos;
  }

  @action.bound
  public initializeLogos(validators: ReadonlyArray<Validator>): Task<void> {
    const tasks = validators.map((element) =>
      api.getValidatorLogo(element.description.identity),
    );

    return {
      run: async (): Promise<void> => {
        const responses = await Promise.all(tasks.map((task) => task.run()));
        this.setValidatorsLogos(
          responses.reduce(
            (validators, response) => ({
              ...validators,
              [response.identity]: response.url,
            }),
            {},
          ),
        );
      },
      abort: (): void => {
        tasks.forEach((task): void => task.abort());
      },
    };
  }

  @computed
  public get amountValue(): number {
    return parseFloat(this.amountString);
  }

  @computed
  public get amount(): Amount {
    return Amount.fromValue(this.amountValue);
  }

  @computed
  public get currentValidatorDelegation(): number {
    if (this.currentValidator) {
      const currentValidatorAddress = this.currentValidator.operator_address;
      const currentDelegation = this.userDelegations.find(
        ({ delegation }) =>
          delegation.validator_address === currentValidatorAddress,
      );
      if (currentDelegation) {
        const { balance } = currentDelegation;
        return Amount.from(Number(balance.amount)).getFractionalValue();
      }
    }
    return 0;
  }

  @computed
  public get validateAmount(): boolean {
    if (isNaN(this.amountValue)) return true;
    switch (this.currentAction) {
      case DelegationActions.DELEGATE:
        return (
          this.amountValue > 0 &&
          this.amountValue < this.userBalance.getFractionalValue()
        );
      case DelegationActions.UNDELEGATE:
        return (
          this.amountValue > 0 &&
          this.amountValue <= this.currentValidatorDelegation
        );
      case DelegationActions.REDELEGATE:
        return (
          this.amountValue > 0 &&
          this.amountValue <= this.currentValidatorDelegation
        );
      default:
        return false;
    }
  }

  @computed
  public get validateForm(): boolean {
    switch (this.currentAction) {
      case DelegationActions.DELEGATE:
        return (
          this.amountValue > 0 &&
          this.amountValue < this.userBalance.getFractionalValue()
        );
      case DelegationActions.REDELEGATE:
        if (!this.destinationValidator) return false;
        return (
          this.amountValue > 0 &&
          this.amountValue <= this.currentValidatorDelegation
        );
      case DelegationActions.UNDELEGATE:
        return (
          this.amountValue > 0 &&
          this.amountValue <= this.currentValidatorDelegation
        );
      default:
        return false;
    }
  }

  @computed
  public get currentDelegation(): string {
    return `${this.currentValidatorDelegation.toString()} ${
      config.mainAsset.name
    }`;
  }

  @computed
  public get delegationTypeMessage(): string {
    switch (this.currentAction) {
      case DelegationActions.DELEGATE:
        return locales.YOUR_DELEGATION;
      case DelegationActions.UNDELEGATE:
        return locales.AVAILABLE_FOR_UNDELEGATION;
      case DelegationActions.REDELEGATE:
        return locales.AVAILABLE_FOR_REDELEGATION;
      default:
        return "";
    }
  }

  @computed
  public get totalStaked(): Amount {
    return Amount.from(
      this.userDelegations.reduce((acc, v) => {
        return acc + parseFloat(v.balance.amount);
      }, 0),
    );
  }

  @computed
  public get totalRewards(): Amount {
    const mainToken = api.getMainToken();
    return Amount.fromValue(
      this.userRewards.reduce((acc, rew) => {
        const mainReward = rew.reward.find(
          (_c) => _c.denom === mainToken.subunitName,
        );
        if (!mainReward) return acc;
        return (
          acc + Amount.from(Number(mainReward.amount)).getFractionalValue()
        );
      }, 0),
    );
  }

  @action.bound
  public toggleRefresh(): void {
    this.refreshData = !this.refreshData;
  }

  @action.bound
  public setAddress(address: string): void {
    this.address = address;
  }

  @action.bound
  public setAmountString(value: string): void {
    this.amountString = value;
  }

  @action.bound
  public setBannerVisible(visible: boolean): void {
    this.bannerVisible = visible;
  }

  @action.bound
  public setCurrentAction(action: DelegationActions): void {
    this.currentAction = action;
  }

  @action.bound
  public setCurrentValidator(validator: Validator): void {
    this.currentValidator = validator;
  }

  @action.bound
  public setUserBalance(balance: Amount): void {
    this.userBalance = balance;
  }

  @action.bound
  public setUserDelegations(delegations: ReadonlyArray<Delegation>): void {
    this.userDelegations = delegations;
  }

  @action.bound
  public setUserRewards(rewards: ReadonlyArray<Reward>): void {
    this.userRewards = rewards;
  }

  @action.bound
  public setDestinationValidator(validatorAddress: string): void {
    this.destinationValidator =
      this.validators.find(
        (_validator) => _validator.operator_address === validatorAddress,
      ) ?? null;
  }

  @action.bound
  public async delegate(wallet: Wallet): Promise<PostTxResult> {
    if (!this.currentValidator) throw new Error("Current validator not set");
    return wallet.delegateAmount(
      this.currentValidator.operator_address,
      this.amount,
    );
  }

  @action.bound
  public async undelegate(wallet: Wallet): Promise<PostTxResult> {
    if (!this.currentValidator) throw new Error("Current validator not set");
    return wallet.unDelegateAmount(
      this.currentValidator.operator_address,
      this.amount,
    );
  }

  @action.bound
  public async redelegate(wallet: Wallet): Promise<PostTxResult> {
    if (!this.currentValidator || !this.destinationValidator)
      throw new Error("Current or Destination validator not set");
    return wallet.redelegateAmount(
      this.currentValidator.operator_address,
      this.destinationValidator.operator_address,
      this.amount,
    );
  }

  @action.bound
  public resetDialogState(): void {
    this.currentValidator = null;
    this.amountString = "";
    this.currentAction = DelegationActions.DELEGATE;
    this.destinationValidator = null;
  }
}

export const DelegationStoreContext = React.createContext<DelegationStore>(
  new DelegationStore(),
);
