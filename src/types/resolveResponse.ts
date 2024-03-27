import { Resource } from "types/resourceInfo";

export interface Starname {
  readonly broker: string;
  readonly certificates: string[];
  readonly domain: string;
  readonly metadata_uri: string;
  readonly name: string;
  readonly owner: string;
  readonly resources: Resource[] | null;
  readonly valid_until: string;
}
