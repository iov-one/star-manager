import { SocialNetwork } from "./socialNetwork";

export interface SocialItem {
  name: string;
  certified: boolean;
  readonly network: SocialNetwork;
}
