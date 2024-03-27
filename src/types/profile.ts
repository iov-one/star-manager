import { Resource } from "./resourceInfo";

export interface Profile {
  readonly name: string;
  readonly photo: string | null;
  readonly biography: string;
}

export interface AccountInfo extends Profile {
  readonly owner: string;
  readonly resources: ReadonlyArray<Resource> | null;
  readonly certificates: ReadonlyArray<string>;
  readonly valid_until: Date;
  readonly twitter_handle: string;
  readonly telegram_handle: string;
  readonly github_handle: string;
  readonly discord_handle: string;
  readonly instagram_handle: string;
}

export interface OffChainProfile {
  readonly name: string;
  readonly photo: string | null;
  readonly biography: string;
}

export const EmptyProfile: Profile = {
  name: "",
  biography: "",
  photo: null,
};
