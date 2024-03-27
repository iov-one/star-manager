import api from "api";
import { Signer } from "signers/signer";
import { Wallet } from "signers/wallet";

type BeforeAllHandler = (done: () => void) => void;

export const createBeforeAllHandler =
  (
    signer: Signer,
    wallet: Wallet,
    next?: () => Promise<void>,
  ): BeforeAllHandler =>
  (done: () => void): void => {
    // Need to initialize this first
    api
      .initialize()
      .then((): Promise<boolean> => signer.initialize())
      .then((loaded: boolean): Promise<void> => {
        if (!loaded) throw new Error("cannot initialized");
        if (next === undefined) {
          return Promise.resolve();
        } else {
          return next();
        }
      })
      .then(done)
      .catch(console.warn);
  };
