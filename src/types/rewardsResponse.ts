import { Coin } from "@cosmjs/amino";

import { GenericApiResponse } from "./genericApiResponse";

export interface Reward {
  readonly validator_address: string;
  readonly reward: ReadonlyArray<Coin>;
}

export type RewardsResponse = GenericApiResponse<{
  readonly rewards: ReadonlyArray<Reward>;
  readonly total: ReadonlyArray<Coin>;
}>;
