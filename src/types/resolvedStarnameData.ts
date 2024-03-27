import { DomainInfo } from "./domain";
import { Escrow } from "./escrow";
import { AccountInfo } from "./profile";

export interface ResolvedStarnameData {
  domainInfo: null | DomainInfo;
  accountInfo: null | AccountInfo;
  escrowInfo: null | Escrow;
}
