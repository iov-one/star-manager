import { Starname } from "types/resolveResponse";

import { PaginationPage } from "./page";

export interface ResourceAccountsResponse {
  accounts: ReadonlyArray<Starname>;
  page: PaginationPage;
}
