export enum SocialHandleType {
  Twitter = "twitter",
  Telegram = "telegram",
  Discord = "discord",
  Instagram = "instagram",
  Website = "website",
}

export const isSocialHandleType = (
  value: unknown,
): value is SocialHandleType => {
  if (typeof value !== "string") return false;
  const values: ReadonlyArray<string> = Object.values(SocialHandleType);
  return values.includes(value);
};
