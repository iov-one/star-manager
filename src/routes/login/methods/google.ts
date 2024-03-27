import { GoogleAuthInfo } from "@iov/gdrive-custodian";
import { GoogleSignInButton } from "routes/login/components/googleSignInButton";
import { ImportedSignInMethod } from "types/signInMethod";

export const google: ImportedSignInMethod<GoogleAuthInfo> = {
  key: "google",
  component: GoogleSignInButton,
  isAvailable: (): boolean => true,
  isMobileAllowed: (): boolean => true,
};
