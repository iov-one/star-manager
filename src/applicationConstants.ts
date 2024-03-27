import { SocialHandleType } from "types/socialHandleType";

export const SIGN_OUT_EVENT = "logout";
export const KEPLR_KEYSTORE_CHANGE_EVENT = "keplr_keystorechange";

export const SocialLabels: { [key in SocialHandleType]: string } = {
  [SocialHandleType.Twitter]: "Twitter",
  [SocialHandleType.Telegram]: "Telegram",
  [SocialHandleType.Discord]: "Discord",
  [SocialHandleType.Instagram]: "Instagram",
  [SocialHandleType.Website]: "Website",
};
