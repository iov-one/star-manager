export const AuthPopup = (
  baseUrl: string,
  clientId: string,
  redirectUri: string,
  target = "_blank",
  scope = "user_profile",
  responseType = "code",
  options?: string,
): Window | null => {
  return window.open(
    `${baseUrl}?client_id=${clientId}&redirect_uri=${
      window.location.origin + redirectUri
    }&scope=${scope}&response_type=${responseType}`,
    target,
    options,
  );
};
