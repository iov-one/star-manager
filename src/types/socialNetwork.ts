export enum SocialNetwork {
  Twitter = "twitter",
  Github = "github",
  Telegram = "telegram",
  Discord = "discord",
  Instagram = "instagram",
  Website = "website",
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isSocialNetwork = (value: any): value is SocialNetwork => {
  if (typeof value !== "string") return false;
  const values: ReadonlyArray<string> = Object.values(SocialNetwork);
  return values.includes(value);
};
