import { EncodeObject } from "@cosmjs/proto-signing";
import { StargateClient } from "@cosmjs/stargate";
import { AbstractApi } from "api/abstractApi";
import endpoints from "api/config";
import { ApiType } from "api/types/apiType";
import {
  StargateAccount,
  StargateAccountResponse,
} from "api/types/stargate/accountResponse";
import { StargateBalanceResponse } from "api/types/stargate/balanceResponse";
import { StargateDomainInfoResponse } from "api/types/stargate/domainInfoResponse";
import { DomainsWithOwnerResponse } from "api/types/stargate/domainsWithOwnerResponse";
import { StargateFeesResponse } from "api/types/stargate/feesResponse";
import { StargateResolveResponse } from "api/types/stargate/resolveResponse";
import { ResourceAccountsResponse } from "api/types/stargate/resourceAccountsResponse";
import { StargateRewardsResponse } from "api/types/stargate/rewardsResponse";
import {
  StargateBaseTx,
  StargateSearchTxResponse,
} from "api/types/stargate/searchTxResponse";
import { StargateTransaction } from "api/types/stargate/transaction";
import queries, { StargateTxQuery } from "api/types/stargate/txQuery";
import { StargateUserDelegationsResponse } from "api/types/stargate/userDelegationsResponse";
import { StargateUserUnbondingsResponse } from "api/types/stargate/userUndondingsResponse";
import {
  StargateValidator,
  StargateValidatorResponse,
} from "api/types/stargate/validatorResponse";
import { StargateValidatorsResponse } from "api/types/stargate/validatorsResponse";
import { stargateToQueryString } from "api/utils/stargateToQueryString";
import { BondStatus } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { get, Task } from "logic/httpClient";
import { sortTransactions } from "logic/sort/transactions";
import { EscrowState } from "proto/iov/escrow/v1beta1/types";
import { TxType } from "signers/starnameRegistry";
import { Amount } from "types/amount";
import { IResponsePage } from "types/apiPage";
import { Balance } from "types/balance";
import { Domain } from "types/domain";
import { ApiEscrow, Escrow } from "types/escrow";
import { Fees, transformFeesResponse } from "types/fees";
import { GenericApiResponse } from "types/genericApiResponse";
import { StdMap } from "types/map";
import { NameItem } from "types/nameItem";
import { NameViewData } from "types/nameViewData";
import { Pager } from "types/pager";
import { PostTxResult } from "types/postTxResult";
import { Starname } from "types/resolveResponse";
import { Reward } from "types/rewardsResponse";
import {
  Settings,
  StargateSettingsResponse,
  transformSettingsResponse,
} from "types/settings";
import { ITransaction as Transaction } from "types/transaction";
import { Unbonding } from "types/unbondingsResponse";
import { Delegation } from "types/userDelegationsResponse";
import { GenericQuery } from "utils/queryString";
import { starnameResolutionResponseToName } from "utils/starnameResolutionResponseToName";

export class Stargate extends AbstractApi {
  private client: StargateClient | null = null;

  public type = ApiType.STARGATE;
  public api = endpoints.stargate;
  protected chainId = "";

  public async initialize(): Promise<void> {
    try {
      const rpcUrl = this.api.rpcUrl;
      if (!rpcUrl) throw new Error("RPC url must be valid for stargate");
      const client = await StargateClient.connect(rpcUrl);
      this.client = client;
      this.chainId = await client.getChainId();
      // Call the common stuff
      await super.initialize();
    } catch (error) {
      console.error(error);
    }
  }

  protected loadSettings = async (): Promise<Settings> => {
    const task: Task<StargateSettingsResponse> = get<StargateSettingsResponse>(
      this.api.config,
    );
    const response = await task.run();
    return transformSettingsResponse(response.config);
  };

  protected async loadFees(): Promise<Fees> {
    const task = get<StargateFeesResponse>(this.api.fees);
    const response = await task.run();
    return transformFeesResponse(response.fees);
  }

  public getAccount = async (
    address: string,
  ): Promise<StargateAccount | undefined> => {
    if (!address) throw new Error("no address provided to getAccount");
    const task: Task<StargateAccountResponse> = get<StargateAccountResponse>(
      this.api.account(address),
    );
    const { account } = await task.run();
    return {
      address: account.address,
      pubkey: account.pub_key,
      accountNumber: account.account_number,
      sequence: account.sequence,
    };
  };

  public getBalance(address: string): Task<ReadonlyArray<Balance>> {
    const task = get<StargateBalanceResponse>(this.api.balances(address));

    return {
      abort: (): void => {
        task.abort();
      },
      run: async (): Promise<ReadonlyArray<Balance>> => {
        const { balances }: StargateBalanceResponse = await task.run();
        const result = Array<Balance>();
        if (balances.length > 0) {
          balances.forEach((balance) => {
            const token = this.getToken(balance.denom);
            if (!token) return;
            const amount = new Amount(Number(balance.amount), token);
            result.push({ address, amount });
          });
        } else {
          const token = this.getMainToken();
          const amount = new Amount(0, token);
          result.push({ address, amount });
        }
        return result;
      },
    };
  }

  public resourceAccounts = (address: string): Task<ReadonlyArray<string>> => {
    const task: Task<ResourceAccountsResponse> = get<ResourceAccountsResponse>(
      this.api.resourceAccounts(this.mainAsset["starname-uri"], address),
    );
    return {
      run: async (): Promise<ReadonlyArray<string>> => {
        const { accounts } = await task.run();
        return accounts.map((account: Starname): string =>
          [account.name, account.domain].join("*"),
        );
      },
      abort: (): void => {
        task.abort();
      },
    };
  };

  public resolveStarname = (starname: string): Task<Starname> => {
    const task: Task<StargateResolveResponse> = get<StargateResolveResponse>(
      this.api.accountStarname(starname),
    );
    return {
      run: async (): Promise<Starname> => {
        const { account } = await task.run();
        return account;
      },
      abort: (): void => {
        task.abort();
      },
    };
  };

  public getDomainInfo = (name: string): Task<Domain> => {
    const task: Task<StargateDomainInfoResponse> =
      get<StargateDomainInfoResponse>(this.api.domainInfo(name));
    return {
      run: async (): Promise<Domain> => {
        const result = await task.run();
        const { domain }: StargateDomainInfoResponse = result;
        return {
          kind: "domain",
          name: domain.name,
          owner: "",
          admin: domain.admin,
          validUntil: Number(domain.valid_until),
          type: domain.type,
          broker: domain.broker,
        };
      },
      abort: () => task.abort(),
    };
  };

  public getAccountsInDomain = (
    domain: Domain,
    pageSize?: number,
    pageNumber?: number,
    includeTotalCount?: boolean,
  ): Task<ReadonlyArray<NameItem>> => {
    const task: Task<ResourceAccountsResponse> = get<ResourceAccountsResponse>(
      this.urlWithQueries(
        this.api.domainAccounts(domain.name),
        pageSize,
        pageNumber,
        includeTotalCount,
      ),
    );
    return {
      run: async () => {
        const { accounts } = await task.run();
        const names: ReadonlyArray<NameItem> = accounts.map(
          starnameResolutionResponseToName(domain),
        );
        return names;
      },
      abort: () => task.abort(),
    };
  };

  public getAccountsNumInDomain = (domain: Domain): Task<number> => {
    const task: Task<ResourceAccountsResponse> = get<ResourceAccountsResponse>(
      this.urlWithQueries(
        this.api.domainAccounts(domain.name),
        1,
        undefined,
        true,
      ),
    );
    return {
      run: async () => {
        const { page } = await task.run();
        return page.total ? parseInt(page.total) : 0;
      },
      abort: () => task.abort(),
    };
  };

  private urlWithQueries = (
    url: string,
    pageSize?: number,
    pageNumber?: number,
    includeTotalCount?: boolean,
  ): string => {
    const searchParams = new URLSearchParams();
    if (pageSize) searchParams.set("pagination.limit", pageSize.toString());
    if (pageNumber)
      searchParams.set("pagination.offset", pageNumber.toString());
    if (includeTotalCount)
      searchParams.set("pagination.count_total", String(includeTotalCount));
    const stringedSearchParams = searchParams.toString();
    return url + (stringedSearchParams ? `?${stringedSearchParams}` : "");
  };

  public getBasicEditionStarnames = (
    owner: string,
    pageSize: number,
    pageNumber: number,
  ): Task<NameViewData> => {
    const task = get<ResourceAccountsResponse>(
      this.urlWithQueries(
        this.api.accountsWithOwner(owner),
        pageSize,
        pageNumber,
      ),
    );
    return {
      run: async (): Promise<NameViewData> => {
        const { accounts } = await task.run();
        const starnames: ReadonlyArray<NameItem> = accounts.map(
          starnameResolutionResponseToName(undefined),
        );
        starnames.filter((item: NameItem): boolean => !item.isPremium());
        return {
          starnames,
          domains: [],
        };
      },
      abort: (): void => {
        task.abort();
      },
    };
  };

  public getCountForAccountsWithOwner = (
    owner: string,
  ): Task<number | null> => {
    const task = get<ResourceAccountsResponse>(
      this.urlWithQueries(
        this.api.accountsWithOwner(owner),
        1,
        undefined,
        true,
      ),
    );
    return {
      run: async (): Promise<number | null> => {
        const {
          page: { total },
        } = await task.run();

        return total ? parseInt(total) : null;
      },
      abort: () => task.abort(),
    };
  };

  public getAccountsWithOwner = (
    owner: string,
    pageSize?: number,
    pageNumber?: number,
    includeTotalCount?: boolean,
  ): Task<ReadonlyArray<NameItem>> => {
    const task: Task<ResourceAccountsResponse> = get<ResourceAccountsResponse>(
      this.urlWithQueries(
        this.api.accountsWithOwner(owner),
        pageSize,
        pageNumber,
        includeTotalCount,
      ),
    );
    return {
      run: async (): Promise<ReadonlyArray<NameItem>> => {
        const response: ResourceAccountsResponse = await task.run();
        const { accounts } = response;
        const promises: ReadonlyArray<Promise<NameItem>> = accounts.map(
          async (starname: Starname): Promise<NameItem> => {
            const domainResolver: Task<Domain> = this.getDomainInfo(
              starname.domain,
            );
            const domain: Domain = await domainResolver.run();
            // Create a converter using the resolved domain
            const converter = starnameResolutionResponseToName(domain);
            // Return the converted object
            return converter(starname);
          },
        );
        return Promise.all(promises);
      },
      abort: (): void => task.abort(),
    };
  };

  public getPremiumEditionStarnames = (
    owner: string,
    pageSize: number,
    pageNumber: number,
  ): Task<NameViewData> => {
    const getDomainsTask = get<DomainsWithOwnerResponse>(
      this.urlWithQueries(
        this.api.domainsWithOwner(owner),
        pageSize,
        pageNumber,
      ),
    );
    const getNamesTask: Task<ReadonlyArray<NameItem>> =
      this.getAccountsWithOwner(owner, pageSize, pageNumber);
    const transferredAndPremiumOnly = (
      array: ReadonlyArray<NameItem>,
    ): ReadonlyArray<NameItem> => {
      return array.filter((item: NameItem): boolean => {
        if (!item.isPremium()) return false;
        return item.isTransferred();
      });
    };
    return {
      run: async (): Promise<NameViewData> => {
        const response = await getDomainsTask.run();
        const { domains } = response;
        const ownerString = await owner;
        return {
          starnames: transferredAndPremiumOnly(await getNamesTask.run()),
          domains: domains.map(
            (domain): NameItem =>
              new NameItem({
                owner: ownerString,
                name: domain.name,
                validUntil: Number(domain.valid_until),
                admin: domain.admin,
                type: domain.type,
                broker: domain.broker,
                // We must attach the kind when
                // loading from the server
                kind: "domain",
              }),
          ),
        };
      },
      abort: (): void => {
        getDomainsTask.abort();
        getNamesTask.abort();
      },
    };
  };

  public getValidator(address: string): Task<StargateValidator> {
    const task: Task<StargateValidatorResponse> =
      get<StargateValidatorResponse>(this.api.stakingValidator(address));
    return {
      abort: (): void => {
        task.abort();
      },
      run: async (): Promise<StargateValidator> => {
        const { validator } = await task.run();
        return validator;
      },
    };
  }

  public getValidators(
    bondStatus?: BondStatus,
  ): Task<ReadonlyArray<StargateValidator>> {
    const task: Task<StargateValidatorsResponse> =
      get<StargateValidatorsResponse>(
        `${this.api.stakingValidators}` +
          (bondStatus !== undefined ? `?status=${BondStatus[bondStatus]}` : ""),
      );
    return {
      abort: (): void => {
        task.abort();
      },
      run: async (): Promise<ReadonlyArray<StargateValidator>> => {
        const { validators } = await task.run();
        return validators;
      },
    };
  }

  public getUserDelegations(
    delegatorAddress: string,
  ): Task<ReadonlyArray<Delegation>> {
    const task = get<StargateUserDelegationsResponse>(
      this.api.userDelegations(delegatorAddress),
    );

    return {
      abort: (): void => {
        task.abort();
      },

      run: async (): Promise<ReadonlyArray<Delegation>> => {
        const { delegation_responses } = await task.run();
        return delegation_responses;
      },
    };
  }

  public getUnbondings(address: string): Task<ReadonlyArray<Unbonding>> {
    const task = get<StargateUserUnbondingsResponse>(
      this.api.userUnbondings(address),
    );

    return {
      abort: (): void => {
        task.abort();
      },
      run: async (): Promise<ReadonlyArray<Unbonding>> => {
        const { unbonding_responses } = await task.run();
        return unbonding_responses;
      },
    };
  }

  public getUserRewards(address: string): Task<ReadonlyArray<Reward>> {
    const task = get<StargateRewardsResponse>(this.api.userRewards(address));

    return {
      abort: (): void => {
        task.abort();
      },
      run: async (): Promise<ReadonlyArray<Reward>> => {
        const { rewards } = await task.run();
        return rewards;
      },
    };
  }

  public getAccountsWithResource(
    uri: string,
    resource: string,
  ): Task<ReadonlyArray<Starname>> {
    const task = get<ResourceAccountsResponse>(
      this.api.resourceAccounts(uri, resource),
    );

    return {
      abort: () => {
        task.abort();
      },
      run: async (): Promise<ReadonlyArray<Starname>> => {
        const { accounts } = await task.run();
        return accounts;
      },
    };
  }

  private static convertMessageType(msg: any): EncodeObject {
    const { "@type": type, ...value } = msg;
    return {
      typeUrl: type,
      value: value,
    };
  }

  public legacySignAndBroadcast = async (): Promise<PostTxResult> => {
    const { rpcUrl: url } = endpoints.stargate;
    if (url === undefined) {
      throw new Error("bad configuration detected");
    }

    return {} as PostTxResult;
  };

  public rpcPostTx = async (signedTx: Uint8Array): Promise<PostTxResult> => {
    const client: StargateClient | null = this.client;
    if (client !== null) {
      return client.broadcastTx(signedTx);
    } else {
      throw new Error("not initialized");
    }
  };

  public getTransactions = (
    address: string,
    page: Pager,
  ): Task<StdMap<IResponsePage<Transaction>>> => {
    const tasksMap: StdMap<Task<IResponsePage<Transaction>>> = queries.reduce(
      (
        map: StdMap<Task<IResponsePage<Transaction>>>,
        createQuery: (address: string) => StargateTxQuery,
      ): StdMap<Task<IResponsePage<Transaction>>> => {
        const concreteQuery: StargateTxQuery = createQuery(address);
        return {
          ...map,
          [concreteQuery.type]: this.getTransactionsWithQuery(
            address,
            concreteQuery.parameters,
            page,
          ),
        };
      },
      {},
    );
    return {
      run: async (): Promise<StdMap<IResponsePage<Transaction>>> => {
        const entries: [string, Task<IResponsePage<Transaction>>][] =
          Object.entries<Task<IResponsePage<Transaction>>>(tasksMap);
        const awaitedEntries: [string, IResponsePage<Transaction>][] =
          await Promise.all(
            entries.map(
              async ([key, task]: [
                string,
                Task<IResponsePage<Transaction>>,
              ]): Promise<[string, IResponsePage<Transaction>]> => [
                key,
                await task.run(),
              ],
            ),
          );
        return Object.fromEntries<IResponsePage<Transaction>>(awaitedEntries);
      },
      abort: (): void => {
        const tasks: ReadonlyArray<Task<IResponsePage<Transaction>>> =
          Object.values(tasksMap);
        // Abort all tasks
        tasks.forEach((task: Task<IResponsePage<Transaction>>): void =>
          task.abort(),
        );
      },
    };
  };

  // FIXME: Pagination incomplete
  private getTransactionsWithQuery(
    address: string,
    query: GenericQuery,
    _page: Pager,
  ): Task<IResponsePage<Transaction>> {
    const queryString: string = stargateToQueryString({
      ...query,
    });
    const url: string = this.api.queryTransactions + `?${queryString}`;
    const task = get<StargateSearchTxResponse>(url);
    return {
      abort: (): void => {
        task.abort();
      },
      run: async (): Promise<IResponsePage<Transaction>> => {
        const response = await task.run();
        const { tx_responses } = response;
        const convertedTxs = this.convertResponseTxsToStargateTxs(tx_responses);
        const { total } = response.pagination;
        const total_count = total ? Number(total) : 0;
        return {
          pages: 1,
          page: 1,
          requested: 30,
          received: total_count,
          total: total_count,
          items: tx_responses
            ? (
                await Promise.all(
                  convertedTxs.map(this.toInternalTransaction(address)),
                )
              ).sort(sortTransactions)
            : [],
        };
      },
    };
  }

  // This is done to make this compatible with older implementation
  private convertResponseTxsToStargateTxs(
    txs: ReadonlyArray<StargateBaseTx<any>>,
  ): ReadonlyArray<StargateBaseTx<EncodeObject>> {
    return txs.map((oldUrlTypeTx) => {
      const { tx, ...fields } = oldUrlTypeTx;
      const { body, ...txFields } = tx;
      const { messages, ...bodyFields } = body;
      // We need to modify structure of messages as the one coming in API
      // response is way different from ENCODE Object,
      // if should resemble encode object, so that we can further pass it
      // to check type of tx by encodeObject check functions
      const typeConvertedMsgs = messages.map((msg) =>
        Stargate.convertMessageType(msg),
      );
      // Inject modified message ( structure) to body
      // Then other fields from tx
      const modifiedTx = { ...fields } as StargateBaseTx<EncodeObject>;
      modifiedTx.tx = {
        body: { messages: typeConvertedMsgs, ...bodyFields },
        ...txFields,
      };

      return modifiedTx;
    });
  }

  public toInternalTransaction(
    address: string,
  ): (baseTx: StargateBaseTx<EncodeObject>) => Promise<Transaction> {
    return async (
      baseTx: StargateBaseTx<EncodeObject>,
    ): Promise<Transaction> => {
      const {
        tx: {
          body: { messages },
        },
      } = baseTx;
      const message = messages[0];
      switch (message.typeUrl) {
        case TxType.Bank.Send:
          return StargateTransaction.fromSendBaseTx(baseTx, address);
        case TxType.Escrow.CreateEscrow:
          return StargateTransaction.fromCreateEscrowBaseTx(baseTx);
        case TxType.Escrow.RefundEscrow:
          return StargateTransaction.fromRefundEscrowBaseTx(baseTx);
        case TxType.Escrow.TransferToEscrow:
          return StargateTransaction.fromTransferToEscrowBaseTx(baseTx);
        case TxType.Escrow.UpdateEscrow:
          return StargateTransaction.fromUpdateEscrowBaseTx(baseTx);
        case TxType.Starname.RegisterAccount:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.TransferAccount:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.DeleteAccount:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.RenewAccount:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.RenewDomain:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.ReplaceAccountMetadata:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.ReplaceAccountResources:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.RegisterDomain:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.TransferDomain:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.DeleteDomain:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.AddAccountCertificate:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Starname.DeleteAccountCertificate:
          return StargateTransaction.fromStarnameBaseTx(baseTx);
        case TxType.Staking.Delegate:
          return StargateTransaction.fromStakingBaseTx(baseTx);
        case TxType.Staking.Undelegate:
          return StargateTransaction.fromStakingBaseTx(baseTx);
        case TxType.Staking.BeginRedelegate:
          return StargateTransaction.fromRedelegateBaseTx(baseTx);
        case TxType.Distribution.WithdrawDelegatorReward:
          return StargateTransaction.fromDistributionBaseTx(baseTx);

        default:
          throw new Error("unknown transaction type: " + message.typeUrl);
      }
    };
  }

  public getChainId = (): string => this.chainId;

  public isValidStarname(value: string): boolean {
    const { validAccountName } = this.settings;
    const re = new RegExp(validAccountName);
    return re.test(value);
  }

  public getEscrowWithId(escrowId: string): Task<Escrow> {
    const task = get<GenericApiResponse<{ escrow: Escrow }>>(
      this.api.escrowWithId(escrowId),
    );
    return {
      run: async (): Promise<Escrow> => {
        const { result } = await task.run();
        return result.escrow;
      },
      abort: (): void => task.abort(),
    };
  }

  public getEscrows(
    seller?: string,
    state?: "open" | "expired",
    starname?: string,
    pageStart?: number,
    pageLength?: number,
  ): Task<ReadonlyArray<Escrow>> {
    const params = new URLSearchParams();
    if (seller) params.set("seller", seller);
    if (state) params.set("state", state);
    if (starname)
      params.set(
        "object",
        Buffer.from(
          starname.indexOf("*") === 0
            ? starname.slice(1)
            : starname.split("*").reverse().join("*"),
        ).toString("hex"),
      );
    if (pageStart) params.set("pagination_start", pageStart.toString());
    if (pageLength) params.set("pagination_length", pageLength.toString());
    const stringedSearchParams = params.toString();
    const task = get<
      GenericApiResponse<{ escrows: ReadonlyArray<ApiEscrow> | null }>
    >(
      this.api.escrows(
        ...(stringedSearchParams ? [`?${stringedSearchParams}`] : []),
      ),
    );
    return {
      run: async (): Promise<ReadonlyArray<Escrow>> => {
        const { result } = await task.run();
        // api only return escrows with state expired
        // and only cares for open or expired
        return result.escrows
          ? result.escrows.map((_es) => {
              return {
                ..._es,
                state:
                  _es.state === undefined
                    ? EscrowState.ESCROW_STATE_OPEN
                    : _es.state,
              };
            })
          : [];
      },
      abort: (): void => task.abort(),
    };
  }
}
