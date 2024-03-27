import React from "react";
import { Wallet } from "signers/wallet";

export type SignInButtonCompletedCallback = () => void;
export type SignInFormCompletedCallback<N = null> = (
  wallet: Wallet | N,
) => void;

export interface SignerButtonProps<T> {
  readonly ready: boolean;
  readonly onSignIn: SignInFormCompletedCallback<T>;
}

export interface ImportedSignInMethod<T> {
  readonly component: React.ComponentType<SignerButtonProps<T>>;
  readonly isAvailable: () => boolean;
  readonly isMobileAllowed: () => boolean;
  readonly key: string;
}

export interface SignInMethod {
  readonly label: string;
  readonly icons?: {
    on: string;
    off: string;
  };
  readonly isAvailable: () => boolean;
  readonly isMobileAllowed: () => boolean;
  readonly signIn: () => Promise<Wallet | null>;
  readonly key: string;
}

export const isSignInMethod = (
  method: SignInMethod | any,
): method is SignInMethod => {
  return (
    "label" in method &&
    "isAvailable" in method &&
    "signIn" in method &&
    typeof method.signIn === "function" &&
    typeof method.isAvailable === "function"
  );
};
