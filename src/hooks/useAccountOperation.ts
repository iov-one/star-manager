import { StdFee } from "@cosmjs/amino";
import { useWallet } from "contexts/walletContext";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import React, { useContext } from "react";
import { RouteComponentProps } from "react-router";
import { Wallet } from "signers/wallet";
import { AccountRouteParameters } from "types/accountRouteParameters";
import { ItemRouteState, NameItem } from "types/nameItem";
import { NameType } from "types/nameType";
import { PostTxResult } from "types/postTxResult";

export type SubmitHandler<T = PostTxResult> = () => Promise<T>;
export type FeeListenerHandler = () => Promise<StdFee>;

type SubmitFn<T> = (
  wallet: Wallet,
  item: NameItem,
  sessionStore: SessionStore,
) => Promise<T>;

export interface AccountOperation<T = PostTxResult> {
  readonly createSubmitHandler: (submit: SubmitFn<T>) => SubmitHandler<T>;
  readonly wallet: Wallet;
  readonly type: NameType;
  readonly item: NameItem;
}

export type OperationRouteProps = RouteComponentProps<
  AccountRouteParameters,
  never,
  ItemRouteState
>;

export const useAccountOperation = <T = PostTxResult>(
  props: OperationRouteProps,
): AccountOperation<T> => {
  const {
    state: { item },
  } = props.location;
  const sessionStore = useContext<SessionStore>(SessionStoreContext);
  const wallet: Wallet = useWallet();
  return React.useMemo<AccountOperation<T>>(
    () => ({
      createSubmitHandler: (submit: SubmitFn<T>): SubmitHandler<T> => {
        return (): Promise<T> => {
          return submit(wallet, item, sessionStore);
        };
      },
      wallet: wallet,
      item: item,
      type: item.type,
    }),
    [item, sessionStore, wallet],
  );
};
