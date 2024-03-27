import { Asset } from "@iov/asset-directory";
import api from "api";
import { FAVORITE_ASSET_URI } from "genericConstants";

export interface Resource {
  readonly uri: string;
  readonly resource: string;
}

export interface ResourceInfo {
  readonly id: string;
  readonly address: string;
  readonly asset: Asset;
}

export const getPreferredAsset = (
  resources: ReadonlyArray<Resource> | null,
): string => {
  if (resources === null) return "";
  const found: Resource | undefined = resources.find(
    (resource: Resource): boolean => {
      return resource.uri === FAVORITE_ASSET_URI;
    },
  );
  if (found !== undefined) {
    return found.resource;
  } else {
    return "";
  }
};

export const resourcesFromTargets = (
  targets: ReadonlyArray<ResourceInfo>,
): ReadonlyArray<Resource> => {
  return targets.map((_res) => ({
    resource: _res.address,
    uri: `asset:${_res.asset.symbol.toLowerCase()}`,
  }));
};

export const getTargetsFromResources = (
  resources: ReadonlyArray<Resource> | null,
): ReadonlyArray<ResourceInfo> => {
  if (resources === null) return [];
  return resources
    .filter(({ uri }: Resource): boolean => uri.startsWith("asset:"))
    .map((item: Resource, index: number): ResourceInfo => {
      const asset: Asset | undefined = api.getAssetByUri(item.uri);
      if (asset === undefined) {
        const { uri } = item;
        const symbol: string = uri.replace("asset:", "");
        return {
          id: "unknown" + index,
          address: item.resource,
          asset: {
            "starname-uri": uri,
            name: symbol.toUpperCase(),
            symbol: symbol.toUpperCase(),
            logo: "",
            "trustwallet-uid": null,
            coingeckoId: null,
          },
        };
      } else {
        return {
          id: item.uri,
          address: item.resource,
          asset: asset,
        };
      }
    });
};
