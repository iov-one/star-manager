import { ApiConfig } from "api/config";
import config from "config";

const BASE_URL = config.apiUrl;
const STARNAME_URL = `${BASE_URL}/starname/v1beta1`;
const ESCROW_URL = `${BASE_URL}/escrow`;
const COSMOS_URL = `${BASE_URL}/cosmos`;

const Stargate: ApiConfig = {
  apiUrl: BASE_URL,
  rpcUrl: config.rpcUrl,
  config: `${STARNAME_URL}/configuration/params`,
  fees: `${STARNAME_URL}/configuration/fees`,
  queryTransactions: `${COSMOS_URL}/tx/v1beta1/txs`,
  account: (address: string): string =>
    `${COSMOS_URL}/auth/v1beta1/accounts/${address}`,
  accountStarname: (starname: string): string =>
    `${STARNAME_URL}/account/${starname}`,
  brokerAccounts: (broker: string): string =>
    `${STARNAME_URL}/accounts/broker/${broker}`,
  domainAccounts: (domain: string): string =>
    `${STARNAME_URL}/accounts/domain/${domain}`,
  resourceAccounts: (uri: string, resource: string): string =>
    `${STARNAME_URL}/accounts/resource/${uri}/${resource}`,
  accountsWithOwner: (owner: string | Promise<string>): string =>
    `${STARNAME_URL}/accounts/owner/${owner}`,
  stakingValidators: `${COSMOS_URL}/staking/v1beta1/validators`,
  stakingValidator: (address: string): string =>
    `${COSMOS_URL}/staking/v1beta1/validators/${address}`,
  validatorLogo: (identity: string): string =>
    `${config.validatorsImageLookupApiUrl}?fields=pictures&key_suffix=${identity}`,
  userDelegations: (address: string): string =>
    `${COSMOS_URL}/staking/v1beta1/delegations/${address}`,
  userUnbondings: (address: string): string =>
    `${COSMOS_URL}/staking/v1beta1/delegators/${address}/unbonding_delegations`,
  userRewards: (address: string): string =>
    `${COSMOS_URL}/distribution/v1beta1/delegators/${address}/rewards`,
  balances: (address: string): string =>
    `${COSMOS_URL}/bank/v1beta1/balances/${address}`,
  domainsWithOwner: (owner: string | Promise<string>): string =>
    `${STARNAME_URL}/domains/owner/${owner}`,
  domainInfo: (domain: string): string => `${STARNAME_URL}/domain/${domain}`,
  escrowWithId: (escrowId: string): string =>
    `${ESCROW_URL}/escrow/${escrowId}`,
  escrows: (query: string): string => `${ESCROW_URL}/escrows${query ?? ""}`,
};

export default Stargate;
