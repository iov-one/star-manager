import { Asset } from "@iov/asset-directory";
import api from "api";
import config from "config";

export const getAsset = (symbolName: string): any => {
  const allAssets: ReadonlyArray<Asset> = api.getAssets();
  const found = allAssets.find(
    ({ symbol }: any): boolean =>
      symbol.toLowerCase() === symbolName.toLowerCase(),
  );
  if (found === undefined) {
    const { mainAsset } = config;
    return {
      ...mainAsset,
      logo: "/assets/icons/fallback-asset.png",
    };
  }
  return found;
};
