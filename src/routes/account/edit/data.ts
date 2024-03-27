import { SocialHandleType } from "types/socialHandleType";

export interface SocialNetworkSpec {
  readonly type: SocialHandleType;
  readonly verifiable: boolean;
}

export const SocialNetworks: ReadonlyArray<SocialNetworkSpec> = [
  {
    type: SocialHandleType.Twitter,
    verifiable: true,
  },
  {
    type: SocialHandleType.Instagram,
    verifiable: true,
  },
  {
    type: SocialHandleType.Telegram,
    verifiable: false,
  },
  {
    type: SocialHandleType.Discord,
    verifiable: false,
  },
  {
    type: SocialHandleType.Website,
    verifiable: false,
  },
];
