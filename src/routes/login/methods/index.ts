import { google } from "routes/login/methods/google";
import { keplr } from "routes/login/methods/keplr";
import { ledger } from "routes/login/methods/ledger";
import { seedPhrase } from "routes/login/methods/seedPhrase";
import { ImportedSignInMethod, SignInMethod } from "types/signInMethod";

/**
 * This allows to include only those sign-in methods that will be made
 * available in a given environment.
 *
 * The order of items in the array, affects the order in which buttons are
 * presented to the user in the UI
 */
const methods: ReadonlyArray<SignInMethod | ImportedSignInMethod<any>> =
  ((): ReadonlyArray<SignInMethod | ImportedSignInMethod<any>> => [
    keplr,
    ledger,
    google,
    seedPhrase,
  ])();

export default methods;
