import toast, { ToastType } from "components/toast";
import React from "react";
import { isDesktop, isMobile } from "react-device-detect";
import { SignInButton } from "routes/login/components/signInButton";
import { Wallet } from "signers/wallet";
import {
  ImportedSignInMethod,
  isSignInMethod,
  SignInButtonCompletedCallback,
  SignInFormCompletedCallback,
  SignInMethod,
} from "types/signInMethod";

interface OwnProps {
  readonly ready: boolean;
  readonly inheritedKey: string;
  readonly onSignIn: SignInFormCompletedCallback<any>;
}

type Props = OwnProps & (SignInMethod | ImportedSignInMethod<any>);

export const SignInMethodItem: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const createOnSignInCallbackForMethod = function <T>(
    method: SignInMethod | ImportedSignInMethod<T>,
  ): SignInButtonCompletedCallback {
    return ((): void => {
      if (isSignInMethod(method)) {
        method
          .signIn()
          .then((wallet: Wallet | null): void => {
            props.onSignIn(wallet);
          })
          .catch((error: any): void => {
            toast.show(error.message, ToastType.Error);
          });
      } else {
        throw new Error("should handle signing in in the button callback");
      }
    }) as SignInButtonCompletedCallback;
  };
  if (isSignInMethod(props)) {
    if ((isMobile && props.isMobileAllowed()) || isDesktop) {
      const onClick = createOnSignInCallbackForMethod(props);
      return (
        <SignInButton
          key={props.inheritedKey}
          label={props.label}
          ready={props.ready && props.isAvailable()}
          icons={props.icons}
          onSignIn={onClick}
        />
      );
    }
    return <React.Fragment key={props.inheritedKey} />;
  } else {
    const Button = props.component;
    if ((isMobile && props.isMobileAllowed()) || isDesktop) {
      return (
        <Button
          key={props.inheritedKey}
          ready={props.ready}
          onSignIn={props.onSignIn}
        />
      );
    }
    return <React.Fragment />;
  }
};
