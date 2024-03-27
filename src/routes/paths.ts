export const BALANCES_ROUTE = "/balances";
export const TRANSACTIONS_ROUTE = "/transactions";
export const STAKING_ROUTE = "/staking";
export const SEND_PAYMENT_ROUTE = "/send-payment";
export const RECEIVE_PAYMENT_ROUTE = "/receive-payment";
export const BUY_TOKENS_ROUTE = "/buy-tokens";
export const MANAGE_2FA_ROUTE = "/manage-2fa";

export const MANAGER_BASE_ROUTE = "/manager";
export const MANAGER_REGISTER_STARNAME_ROUTE =
  MANAGER_BASE_ROUTE + "/register/:domain?";
export const MANAGER_EDIT_STARNAME_ROUTE = MANAGER_BASE_ROUTE + "/edit/:name";
export const MANAGER_DELETE_STARNAME_ROUTE =
  MANAGER_BASE_ROUTE + "/delete/:name";
export const MANAGER_RENEW_STARNAME_ROUTE = MANAGER_BASE_ROUTE + "/renew/:name";
export const MANAGER_TRANSFER_STARNAME_ROUTE =
  MANAGER_BASE_ROUTE + "/transfer/:name";
export const MANAGER_SHOW_QR_ROUTE = MANAGER_BASE_ROUTE + "/showqr/:name";
export const MANAGER_MANAGE_CERTIFICATES =
  MANAGER_BASE_ROUTE + "/certificates/:name";
export const MANAGER_SELL_STARNAME_ROUTE = MANAGER_BASE_ROUTE + "/sell/:name";

// GDrive signer
export const GOOGLE_DRIVE_REQUEST_AUTHORIZATION_TO_SIGN =
  "/google-drive-request-authorization-to-sign";
export const GOOGLE_DRIVE_DISPLAY_MNEMONIC = "/google-drive-display-mnemonic";

// Root routes
export const PRIVACY_POLICY_ROUTE = "/privacy-policy";
export const TERMS_AND_CONDITIONS_ROUTE = "/terms-and-conditions";
export const IOV_TOKENS_PAYMENT_RESULT = "/tokens-credit-result";

export const INSTAGRAM_POPUP_ROUTE = "/profile/instagram";

export const WELCOME = "/welcome";
export const STARNAME_PROFILE_BASE = "/profile";
export const STARNAME_PROFILE_MAIN =
  STARNAME_PROFILE_BASE + "/:starname/:currency?";
export const STARNAME_PROFILE_SEND =
  STARNAME_PROFILE_BASE + "/:starname/:currency/:amount";
