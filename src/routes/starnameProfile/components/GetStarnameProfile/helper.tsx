import assetsStarname from "@iov/asset-directory";
import { aggregates } from "aleph-js";
import api from "api";
import config from "config";
import { Task } from "logic/httpClient";
import { ICONS } from "routes/starnameProfile/Assets";
import { DomainInfo } from "types/domain";
import { AccountInfo } from "types/profile";
import { ResolvedStarnameData } from "types/resolvedStarnameData";
import { Starname } from "types/resolveResponse";
import { Resource } from "types/resourceInfo";

import { Pinata } from "./pinata";

const STARNAME_ACCOUNT_URL = `${config.apiUrl}/starname/v1beta1/account/`;
const STARNAME_DOMAIN_URL = `${config.apiUrl}/starname/v1beta1/domain/`;

interface StarnameResolveResponse {
  readonly account: Starname;
}

interface DomainResolveResponse {
  readonly domain: DomainInfo;
}

const emptyProfile = (
  starname: string,
  resources: ReadonlyArray<Resource> | null,
  certificates: ReadonlyArray<string>,
  timestamp: number,
  owner: string,
): AccountInfo => {
  if (resources === null || resources.length === 0) {
    return {
      name: starname,
      photo: null,
      resources: resources,
      certificates,
      valid_until: new Date(timestamp),
      owner: owner,
      biography: "",
      twitter_handle: "",
      telegram_handle: "",
      github_handle: "",
      discord_handle: "",
      instagram_handle: "",
    };
  } else {
    return {
      biography: "",
      discord_handle: "",
      github_handle: "",
      name: "",
      telegram_handle: "",
      twitter_handle: "",
      instagram_handle: "",
      photo: null,
      resources: resources,
      certificates,
      valid_until: new Date(timestamp),
      owner: owner,
    };
  }
};

const queryStarname = async (starname: string): Promise<Starname | null> => {
  const response = await fetch(STARNAME_ACCOUNT_URL + starname);
  if (response.status === 200) {
    const data: StarnameResolveResponse = await response.json();
    // Return the account
    return data.account;
  } else {
    return null;
  }
};

const queryDomainName = async (domain: string): Promise<DomainInfo | null> => {
  const response = await fetch(STARNAME_DOMAIN_URL + domain);
  if (response.status !== 200) return null;
  const data: DomainResolveResponse = await response.json();
  return data.domain;
};

const getMetadataUri = (resources: ReadonlyArray<Resource> | null): string => {
  if (resources === null) return "";
  const found: Resource | undefined = resources.find(
    (resource: Resource): boolean => resource.uri === "metadata:url",
  );
  if (found === undefined) return "";
  return found.resource;
};

export const AccountNotFoundError = new Error("account not found");

export const resolveStarname = async (
  starname: string,
): Promise<ResolvedStarnameData> => {
  const result = {
    accountInfo: null,
    domainInfo: null,
    escrowInfo: null,
  } as ResolvedStarnameData;
  if (starname.indexOf("*") === 0) {
    const domainName = starname.slice(1);
    const domain = await queryDomainName(domainName);
    result.domainInfo = domain;
  }
  const escrows = await Task.toPromise(
    api.getEscrows(undefined, "open", starname),
  );
  if (escrows.length === 0 || escrows.length > 1) {
    result.escrowInfo = null;
  }
  // although we are sure api will result in 1 escrow only
  else {
    result.escrowInfo = escrows[0];
  }
  const account = await queryStarname(starname);
  if (account === null) {
    // throw AccountNotFoundError;
    result.accountInfo = account;
    return result;
  }
  const { owner, resources, valid_until, certificates } = account;
  const metadata_uri: string = getMetadataUri(resources);
  // initialize accountInfo as empty profile
  result.accountInfo = emptyProfile(
    starname,
    resources,
    certificates,
    1000 * parseInt(valid_until),
    owner,
  );
  if (metadata_uri === "") {
    return result;
  } else if (metadata_uri.includes("aleph")) {
    try {
      const profile: AccountInfo = await aggregates.fetch_one<AccountInfo>(
        owner,
        starname,
        {
          api_server: config.alephConfig.apiServer,
        },
      );
      if (profile === undefined || profile === null) {
        return result;
      } else {
        // update accountInfo
        result.accountInfo = {
          ...profile,
          photo: toAlephUrl(profile.photo !== null ? profile.photo : null),
          resources: resources,
          certificates,
          valid_until: new Date(1000 * parseInt(valid_until)),
          owner: owner,
        };
        return result;
      }
    } catch (error) {
      console.error(error);
    }
  } else if (metadata_uri.includes("pinata")) {
    const pinata = new Pinata();
    try {
      const profile: AccountInfo = await pinata.getDataFromPinata(metadata_uri);
      result.accountInfo = {
        ...profile,
        resources,
        certificates,
        valid_until: new Date(1000 * parseInt(valid_until)),
        owner: owner,
      };
      return result;
    } catch (error) {
      console.warn(error);
    }
  }
  return result;
};

const toAlephUrl = (hash: string | null): string | null => {
  if (hash === null) return null;
  return `${config.alephConfig.apiServer}/api/v0/storage/raw/${hash}`;
};

export const findUriBySymbol = (
  symbol: string | undefined,
): string | undefined => {
  if (symbol === undefined) return undefined;
  const found = assetsStarname.find((asset) => {
    return symbol === asset.symbol;
  });
  return found !== undefined ? found["starname-uri"] : undefined;
};

export const getSymbol = (uri: string): string => {
  const found = assetsStarname.find((values) => {
    return uri === values["starname-uri"];
  });
  return found !== undefined ? found.symbol : uri.split(":")[1];
};

export const getName = (uri: string): string => {
  const found = assetsStarname.find((values) => {
    return uri === values["starname-uri"];
  });
  return found !== undefined ? found.name : uri.split(":")[1];
};

export const getImage = (uri: string): string => {
  const val = assetsStarname.find((values) => {
    return uri === values["starname-uri"];
  });
  return val !== undefined ? val.logo : ICONS.IOV_ICON;
};
