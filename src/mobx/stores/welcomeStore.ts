import { AccountData, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import * as bip39 from "bip39";
import { hdPath } from "constants/hdPath";
import { action, computed, observable } from "mobx";
import React from "react";

enum Steps {
  ShowMnemonic = 0,
  Challenge = 1,
  ShowAddressAndCreate = 2,
}

export class WelcomeStore {
  readonly mnemonic: string;
  readonly words: ReadonlyArray<string>;

  @observable address = "";
  @observable currentStep = 0;
  @observable selection: ReadonlyArray<string> = [];

  constructor() {
    const mnemonic = bip39.generateMnemonic();
    this.mnemonic = mnemonic;
    this.words = mnemonic.split(" ");
  }

  public isWordSelected(word: string): boolean {
    const { selection } = this;
    return selection.includes(word);
  }

  @action.bound
  public toggleWord(word: string): void {
    const { selection } = this;
    const index = selection.indexOf(word);
    if (index === -1) {
      this.selection = [...selection, word];
    } else {
      this.selection = [
        ...selection.slice(0, index),
        ...selection.slice(index + 1),
      ];
    }
  }

  @action.bound
  public resetSelection(): void {
    this.selection = [];
  }

  @computed
  public get isNextAvailable(): boolean {
    const { selection } = this;
    switch (this.currentStep) {
      case Steps.ShowMnemonic:
        return true;
      case Steps.Challenge:
        return selection.join(" ") === this.mnemonic;
      case Steps.ShowAddressAndCreate:
        return true;
      default:
        return false;
    }
  }

  @action.bound
  public setCurrentStep(currentStep: number): void {
    this.currentStep = currentStep;
    if (currentStep === Steps.ShowAddressAndCreate) {
      DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
        prefix: "star",
        hdPaths: [hdPath],
      })
        .then(
          (
            signer: DirectSecp256k1HdWallet,
          ): Promise<ReadonlyArray<AccountData>> => {
            return signer.getAccounts();
          },
        )
        .then((accounts: ReadonlyArray<AccountData>): void => {
          this.address = accounts[0].address;
        });
    }
  }
}

export const WelcomeStoreContext = React.createContext<WelcomeStore>(
  new WelcomeStore(),
);
