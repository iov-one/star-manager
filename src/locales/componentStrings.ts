import locales from "locales/en";
import { NameType } from "types/nameType";
import { TooltipInfo } from "types/tooltipInfo";

export const DeleteNameStrings: string[] = [
  "Deleting this name removes it from your account.",
  "You can create it again but all the associated addresses will be unlinked",
  "No one will be able to send you funds to this name.",
];

export const DeleteDomainStrings: string[] = [
  "Deleting this starname removes it from your account.",
  "All it's associated names will become inactive this meaning even names you have transferred to other people.",
  "You may not be able to register this starname after you delete it.",
];

export const TransferStrings: { [key in NameType]: string[] } = {
  [NameType.Account]: [
    "The person receiving this name will have ownership over it, they" +
      " only use it to receive funds and link blockchain addresses to" +
      " it.",
    "Any associated blockchain addresses will be unlinked before the name" +
      " is transferred.",
  ],
  [NameType.Domain]: [
    "The starname and all associated names will be transfered to a new" +
      " owner.",
    "No one will be able to send you assets on this starname or any names" +
      " associated to this starname.",
    "You will not be able to recover this starname after you transfer it," +
      " only if the new owner transfers it back to you.",
  ],
};

export const REGISTER_STARNAME_TOOLTIP: TooltipInfo = {
  label: "How it works",
  title: "What is a starname?",
  content: locales.WHAT_IS_A_STARNAME,
};

export const VERIFY_MYSELF = {
  BEGIN: "Verifying myself: I am ",
  END: " on starname.me #starname $IOV #blockchain #cryptocurrency #IOV",
};

export const TRANSFERRING_HEADER = {
  ACTION: "You are transferring ",
  WHAT: "the domain ",
  TO: "to a new owner",
  FROM: "from your domain",
};

export const monthNames: ReadonlyArray<string> = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const ALERT_BANNER = {
  BEGIN: "Always make sure the URL is",
  DOMAIN: "app.starname.me",
  END: "- bookmark it to be safe",
};

export const CosmosAssetAddUtilityLabels = [
  "Introduction",
  "Select crypto currencies",
  "Add to Starname Profile",
];

export const TwoFactorAuthenticationInitSteps = [
  "Need for 2FA",
  "Scan QR Code",
  "Verify Token",
  "Save secret safely",
];

export const TwoFactorAuthInit = {
  INTRO: {
    primary:
      "Two factor authentication provides protection to your account from external access. Enabling this will add an extra layer of security between user and Starname application",
    secondary:
      'Lets enforce two factor authentication on your account by clicking "NEXT" button',
  },
  QR: {
    primary:
      "Scan this QR with an authenticator app. We recommend cloud-based solutions such as:",
  },
  VERIFY: {
    primary: "Enter the 6-digit code from authenticator app",
  },
  SAVE_SECRET: {
    primary:
      "If you have chosen cloud-based authenticator apps, please backup your account “secret” shown below. Ps: Now is also a good time to check that you have your Mnemonic backed up properly as well",
    secondary: 'Please note down this "secret" on a paper and keep it safely',
  },
};

export const TwoFactorAuthRemoval = {
  INTRO:
    "Turning two-factor authentication removes the additional layer of security, are you sure you want to remove it ?",
  PROVIDE_TOKEN:
    "Please enter the 6-digit code from authenticator app, in order to prove your identity",
};

export const CertificateGetStarted = {
  INTRO: "Don't have a certificate yet ?",
  PRIMARY: "Don't you know, your *starname can serve as your digital identity?",
  SECONDARY:
    "These certificates are actually backbone of this digital identity",
};

export const CertificationStepsHelper = {
  FIND_DIFFERENT_CERTIFIERS: "You can find more certifiers at",
  PROCEED_WITH_THIS_APPLICATION:
    "Proceed with this instantly verifiable certificate application",
  FOLLOW_CERTIFIER_STEPS: "Follow steps provided by the certificate provider",
  GET_CERTIFICATE: "Get your certificate from provider",
  UPLOAD_HERE: "And finally upload here..",
};

export const ModifyEscrowStrings = [
  "We have found an escrow already associated with sale of this starname.",
  "If you want to update some fields of this escrow, then update below fields accordingly and submit the update transaction.",
  "Or if you want, you can also delete this escrow anytime, doing this will transfer ownership of this starname back to you.",
];
