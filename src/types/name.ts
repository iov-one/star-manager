import { Domain } from "types/domain";
import { Starname } from "types/resolveResponse";
import { Resource, ResourceInfo } from "types/resourceInfo";
import { SocialHandle } from "types/socialHandle";
import { SocialHandleType } from "types/socialHandleType";

export interface NamesResponse {
  readonly height: number;
  readonly result: {
    readonly accounts: Starname[];
  };
}

export interface Name {
  readonly kind: "account";
  readonly domain: Domain;
  readonly name: string;
  readonly owner: string;
  readonly broker: string | null;
  readonly validUntil: number;
  readonly targets: ReadonlyArray<ResourceInfo> | null;
  readonly preferredAsset: string;
  readonly socialHandles: { [type in SocialHandleType]: SocialHandle | null };
  readonly socialResources: ReadonlyArray<Resource>;
  readonly certificates: string[];
  readonly metadataURI: string | null;
}

export const isName = (obj: Name | any): obj is Name => {
  return obj.kind === "account";
};
