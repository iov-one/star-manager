import React from "react";
import { Wallet } from "signers/wallet";

export const WalletContext = React.createContext<Wallet | null>(null);

export const useWallet = (): Wallet => {
  const wallet: Wallet | null = React.useContext<Wallet | null>(WalletContext);
  if (wallet === null)
    throw new Error("if user was signed in, there must exist a ApiBridge");
  return wallet;
};

export default WalletContext;
