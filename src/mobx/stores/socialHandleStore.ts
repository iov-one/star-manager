import { action, computed, observable } from "mobx";
import React from "react";
import { SocialHandle } from "types/socialHandle";

export class SocialHandleStore {
  @observable verified = false;
  @observable value = "";
  @observable empty = true;

  private originalValue = "";

  constructor(handle: SocialHandle) {
    this.originalValue = handle.value;
    this.value = handle.value;
    this.verified = handle.verified;
  }

  @action.bound
  public setVerified(verified: boolean): void {
    this.verified = verified;
  }

  @action.bound
  public setValue(value: string): void {
    this.empty = value === "";
    this.value = value;
    this.verified = false;

    if (value === this.originalValue) this.setVerified(true);
  }

  @computed
  public get canBeVerified(): boolean {
    // skip check for originalValue === value or if already verified
    return !!this.value;
  }

  @computed
  public get handleModified(): boolean {
    return this.originalValue !== this.value;
  }
}

export const SocialHandleContext =
  React.createContext<SocialHandleStore | null>(null);

export const useSocialHandleStore = (): SocialHandleStore => {
  const sessionStore = React.useContext<SocialHandleStore | null>(
    SocialHandleContext,
  );
  if (sessionStore === null) {
    throw new Error("store context not ready yet");
  }
  return sessionStore;
};
