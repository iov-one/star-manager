import { Domain } from "types/domain";
import { NameItem, OwnershipType } from "types/nameItem";
import { Starname } from "types/resolveResponse";
import {
  getPreferredAsset,
  getTargetsFromResources,
  Resource,
  ResourceInfo,
} from "types/resourceInfo";
import { SocialHandle } from "types/socialHandle";
import { isSocialHandleType, SocialHandleType } from "types/socialHandleType";

const emptyHandleSet: { [type in SocialHandleType]: SocialHandle | null } = {
  [SocialHandleType.Instagram]: null,
  [SocialHandleType.Twitter]: null,
  [SocialHandleType.Instagram]: null,
  [SocialHandleType.Discord]: null,
  [SocialHandleType.Telegram]: null,
  [SocialHandleType.Website]: null,
};

const getSocialHandlesFromResources = (
  resources: ReadonlyArray<Resource> | null,
): { [type in SocialHandleType]: SocialHandle | null } => {
  if (resources === null) return emptyHandleSet;
  const handleTypeFromResourceUri = (
    value: string,
  ): SocialHandleType | null => {
    const index: number = value.indexOf(":");
    if (index === -1) return null;
    const typeString: string = value.slice(index + 1);
    if (isSocialHandleType(typeString)) {
      return typeString;
    } else {
      return null;
    }
  };
  return resources
    .filter(({ uri }: Resource): boolean => uri.startsWith("social:"))
    .filter(
      ({ uri }: Resource): boolean => handleTypeFromResourceUri(uri) !== null,
    )
    .reduce(
      (
        handleSet: { [type in SocialHandleType]: SocialHandle | null },
        { uri, resource }: Resource,
      ): { [type in SocialHandleType]: SocialHandle | null } => {
        const type: SocialHandleType | null = handleTypeFromResourceUri(uri);
        if (type === null)
          throw new Error("we're supposed to have filtered invalid uris");
        return {
          ...handleSet,
          [type]: {
            value: resource,
            // If it's here it must have been verified no?
            verified: true,
          },
        };
      },
      emptyHandleSet,
    );
};

const getMetadataUri = (
  resources: ReadonlyArray<Resource> | null,
): string | null => {
  if (resources !== null) {
    const found: Resource | undefined = resources.find(
      ({ uri }: Resource): boolean => uri === "metadata:url",
    );
    if (found === undefined) {
      return null;
    }
    return found.resource;
  } else {
    return null;
  }
};

export const starnameResolutionResponseToName =
  (domain: Domain | undefined) =>
  (account: Starname): NameItem => {
    const { resources } = account;
    const socialResources: ReadonlyArray<Resource> =
      resources === null
        ? []
        : resources.filter(({ uri }: Resource): boolean => {
            return uri.startsWith("social:") || uri.startsWith("social-claim:");
          });
    const targets: ReadonlyArray<ResourceInfo> =
      getTargetsFromResources(resources);
    if (domain === undefined) {
      return new NameItem(
        {
          kind: "account",
          domain: {
            name: account.domain,
          } as Domain,
          name: account.name,
          owner: account.owner,
          broker: account.broker,
          preferredAsset: getPreferredAsset(resources),
          targets: targets,
          socialResources: socialResources,
          socialHandles: getSocialHandlesFromResources(socialResources),
          validUntil: Number(account.valid_until),
          certificates: account.certificates,
          metadataURI: getMetadataUri(resources),
        },
        OwnershipType.Self,
      );
    } else {
      return new NameItem(
        {
          kind: "account",
          domain: domain,
          name: account.name,
          owner: account.owner,
          broker: account.broker,
          preferredAsset: getPreferredAsset(resources),
          targets: targets,
          socialResources: socialResources,
          socialHandles: getSocialHandlesFromResources(socialResources),
          validUntil: Number(account.valid_until),
          certificates: account.certificates,
          metadataURI: getMetadataUri(account.resources),
        },
        domain.type === "open"
          ? OwnershipType.Self
          : domain.admin === account.owner
          ? OwnershipType.Self
          : OwnershipType.Loaned,
      );
    }
  };
