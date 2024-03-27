import { aggregates } from "aleph-js";
import config from "config";
import { Task } from "logic/httpClient";
import { Pinata } from "pinata";
import { NameItem } from "types/nameItem";
import { Profile } from "types/profile";

const { alephConfig } = config;

export const getAlephHashFromUrl = (url: string): string => {
  const fragments: ReadonlyArray<string> = url.split("/");
  if (fragments.length === 0) return "";
  return fragments[fragments.length - 1];
};

export const toAlephUrl = (hash: string | null): string | null => {
  if (hash === null) return null;
  return `${alephConfig.apiServer}/api/v0/storage/raw/${hash}`;
};

const getFromPinata = (metadataUri: string): Task<Profile> => {
  const status: { aborted: boolean } = { aborted: false };
  const pinata = new Pinata();
  return {
    run: async (): Promise<Profile> => {
      const profile = pinata.getDataFromPinata(metadataUri);
      if (status.aborted) {
        throw new Error("aborted");
      }
      return profile;
    },
    abort: (): void => {
      status.aborted = true;
    },
  };
};

const getFromAleph = (address: string, item: NameItem): Task<Profile> => {
  const status: { aborted: boolean } = { aborted: false };
  return {
    run: async (): Promise<Profile> => {
      const profile: Profile = await aggregates.fetch_one<Profile>(
        address,
        [item.name, item.domain].join("*"),
        {
          api_server: alephConfig.apiServer,
        },
      );
      if (status.aborted) {
        throw new Error("aborted");
      }
      if (profile !== null) {
        return {
          name: profile.name,
          biography: profile.biography,
          photo: toAlephUrl(profile.photo),
        };
      } else {
        return {} as Profile;
      }
    },
    abort: (): void => {
      status.aborted = true;
    },
  };
};

export const getProfile = (address: string, item: NameItem): Task<Profile> => {
  const metadataUri: string | null = item.metadataUri();
  if (metadataUri === null) {
    return {
      run: async (): Promise<Profile> => ({} as Profile),
      abort: (): void => {},
    };
  }
  if (metadataUri.includes("aleph")) {
    return getFromAleph(address, item);
  } else {
    return getFromPinata(metadataUri);
  }
};
