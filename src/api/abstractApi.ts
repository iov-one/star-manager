import { Coin } from "@cosmjs/amino";
import assetsStarname, { Asset } from "@iov/asset-directory";
import { ApiConfig } from "api/config";
import { Stargate } from "api/stargate";
import { ApiType } from "api/types/apiType";
import { StargateAccount } from "api/types/stargate/accountResponse";
import { StargateValidator } from "api/types/stargate/validatorResponse";
import config, { TokenLike } from "config";
import { BondStatus } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { get, Task } from "logic/httpClient";
import { Account } from "types/account";
import { Amount, toInternalCoins } from "types/amount";
import { IResponsePage } from "types/apiPage";
import { Balance } from "types/balance";
import { Validator, ValidatorLogoResponse } from "types/delegationValidator";
import { Domain } from "types/domain";
import { Escrow, EscrowObject, isEscrowDomainObject } from "types/escrow";
import { Fees } from "types/fees";
import { StdMap } from "types/map";
import { NameItem, OwnershipType } from "types/nameItem";
import { NameViewData } from "types/nameViewData";
import { Pager } from "types/pager";
import { Starname } from "types/resolveResponse";
import { Reward } from "types/rewardsResponse";
import { Settings } from "types/settings";
import { ITransaction as Transaction } from "types/transaction";
import { Unbonding } from "types/unbondingsResponse";
import { Delegation } from "types/userDelegationsResponse";
import { getIOVAddressForStarname } from "utils/addressResolver";
import { starnameResolutionResponseToName } from "utils/starnameResolutionResponseToName";

export abstract class AbstractApi {
  protected settings: Settings = {} as Settings;
  protected tokens: { [su: string]: TokenLike } = {};
  protected assets: StdMap<Asset> = {};
  protected mainAsset: Asset = {} as Asset;
  protected fees: Fees = {} as Fees;
  protected symbols: string[] = [];
  protected broker = "";

  public abstract type: ApiType;
  public abstract api: ApiConfig;
  protected abstract chainId: string;

  protected abstract loadSettings(): Promise<Settings>;
  protected abstract loadFees(): Promise<Fees>;

  public abstract getAccount: (
    address: string,
  ) => Promise<StargateAccount | Account | undefined>;
  public abstract getBalance(address: string): Task<ReadonlyArray<Balance>>;
  public abstract resourceAccounts(
    address: string,
  ): Task<ReadonlyArray<string>>;
  public abstract resolveStarname(starname: string): Task<Starname>;
  public abstract getDomainInfo(name: string): Task<Domain>;

  public abstract getAccountsInDomain(
    domain: Domain,
    pageSize: number,
    pageNumber: number,
  ): Task<ReadonlyArray<NameItem>>;

  public abstract getAccountsNumInDomain(domain: Domain): Task<number>;

  public abstract getBasicEditionStarnames(
    owner: string,
    pageSize: number,
    pageNumber: number,
  ): Task<NameViewData>;

  public abstract getAccountsWithOwner(
    owner: string,
    pageSize?: number,
    pageNumber?: number,
  ): Task<ReadonlyArray<NameItem>>;

  public abstract getEscrows(
    seller?: string,
    state?: "open" | "expired",
    objKey?: string,
    pageStart?: number,
    pageLength?: number,
  ): Task<ReadonlyArray<Escrow>>;

  public abstract getEscrowWithId(escrowId: string): Task<Escrow>;

  public abstract getAccountsWithResource(
    uri: string,
    resource: string,
  ): Task<ReadonlyArray<Starname>>;

  public abstract getPremiumEditionStarnames(
    owner: string,
    pageSize: number,
    pageNumber: number,
  ): Task<NameViewData>;

  public abstract getValidator(
    address: string,
  ): Task<StargateValidator | Validator>;

  public abstract getValidators(
    bondStatus?: BondStatus,
  ): Task<ReadonlyArray<StargateValidator | Validator>>;

  public abstract getUserDelegations(
    address: string,
  ): Task<ReadonlyArray<Delegation>>;

  public abstract getUnbondings(
    address: string,
  ): Task<ReadonlyArray<Unbonding>>;

  public abstract getUserRewards(address: string): Task<ReadonlyArray<Reward>>;

  public abstract getChainId(): string;
  public abstract isValidStarname(value: string): boolean;
  public abstract getTransactions(
    address: string,
    page: Pager,
  ): Task<StdMap<IResponsePage<Transaction>>>;

  public async initialize(): Promise<void> {
    this.tokens = config.tokens;
    this.settings = await this.loadSettings();
    this.fees = await this.loadFees();
    this.mainAsset = config.mainAsset;
    const assets: ReadonlyArray<Asset> = [
      config.mainAsset,
      ...assetsStarname,
    ].sort(({ name: n1 }: Asset, { name: n2 }: Asset): number =>
      n1.localeCompare(n2),
    );
    if (config.broker) {
      try {
        this.broker = await Task.toPromise(
          getIOVAddressForStarname(config.broker),
        );
      } catch {
        this.broker = "";
      }
    }
    this.assets = assets.reduce(
      (previousValue: StdMap<Asset>, asset: Asset): StdMap<Asset> => {
        return { ...previousValue, [asset.symbol]: asset };
      },
      {},
    );
    this.symbols = assets.map((chain: Asset): string => chain.symbol);
  }

  public getAssets = (): ReadonlyArray<Asset> => {
    return Object.values(this.assets);
  };

  public getChains = (): ReadonlyArray<Asset> => {
    return Object.values(this.assets);
  };

  public getToken = (subunitName: string): TokenLike | undefined => {
    return this.tokens[subunitName];
  };

  public getFees = (): Fees => {
    return this.fees;
  };

  public getSettings = (): Settings => {
    return this.settings;
  };

  public getAssetByUri = (uri: string): Asset | undefined => {
    const assets: ReadonlyArray<Asset> = Object.values(this.assets);
    return assets.find(
      (chain: Asset): boolean => chain["starname-uri"] === uri,
    );
  };

  public getAssetByTicker = (ticker: string): Asset | undefined => {
    const chains: Asset[] = Object.values(this.assets);
    return chains.find(
      ({ symbol }: Asset): boolean =>
        symbol.toLowerCase() === ticker.toLowerCase(),
    );
  };

  public getChainById = (id: string): Asset | undefined => {
    return this.assets[id];
  };

  public toInternalCoins(coins: ReadonlyArray<Coin>): ReadonlyArray<Amount> {
    return toInternalCoins(coins, this.tokens);
  }

  public toCoins(amount: number): ReadonlyArray<Coin> {
    const tokenLike = this.getMainToken();
    return [
      {
        amount: (amount * tokenLike.subunitsPerUnit).toFixed(0),
        denom: tokenLike.subunitName,
      },
    ];
  }

  public getMainToken(): TokenLike {
    const { denom } = config.mainAsset;
    return config.tokens[denom];
  }

  public getValidatorLogo(
    identity: string,
  ): Task<{ identity: string; url?: string }> {
    const task: Task<ValidatorLogoResponse> = get<ValidatorLogoResponse>(
      `${config.validatorsImageLookupApiUrl}?fields=pictures&key_suffix=${identity}`,
    );
    return {
      abort: (): void => {
        task.abort();
      },
      run: async (): Promise<{ identity: string; url?: string }> => {
        const response: ValidatorLogoResponse = await task.run();
        if (response.status.code !== 0) return { identity };
        return {
          identity: identity,
          url: response.them[0].pictures.primary.url,
        };
      },
    };
  }

  public getStarname(name: string): Task<NameItem> {
    const task1: Task<Starname> = this.resolveStarname(name);
    let task2: Task<Domain> | null = null;
    return {
      run: async (): Promise<NameItem> => {
        const response: Starname = await task1.run();
        task2 = this.getDomainInfo(response.domain);
        const converter = starnameResolutionResponseToName(await task2.run());
        // Make it a full NameItem
        return converter(response);
      },
      abort: (): void => {
        if (task2 !== null) {
          task2.abort();
        }
        task1.abort();
      },
    };
  }

  public getDefaultAssetURI(): string {
    const { mainAsset } = this;
    return mainAsset["starname-uri"];
  }

  public getBroker(): string {
    return this.broker;
  }

  public escrowToNameItem(escrow: Escrow): NameItem {
    const { object } = escrow;
    if (isEscrowDomainObject(object)) {
      return new NameItem(
        {
          kind: "domain",
          admin: object.value.admin,
          name: object.value.name,
          validUntil: Number(object.value.valid_until),
          owner: object.value.admin,
          type: object.value.type,
        },
        OwnershipType.Escrow,
      );
    }
    const converter = starnameResolutionResponseToName(undefined);
    const nameItemedEscrow = converter({
      broker: "",
      certificates: [],
      domain: object.domain,
      metadata_uri: "",
      name: object.name,
      owner: object.owner,
      resources: null,
      valid_until: object.valid_until,
    });
    return new NameItem(nameItemedEscrow.getValue(), OwnershipType.Escrow);
  }

  public escrowObjectToStarname(object: EscrowObject): string {
    if (isEscrowDomainObject(object)) {
      return `*${object.value.name}`;
    } else {
      return `${object.name}*${object.domain}`;
    }
  }

  public getEscrow(
    starname: string,
    escrows: ReadonlyArray<Escrow>,
  ): Escrow | null {
    return (
      escrows.find(({ object }) => {
        return this.escrowObjectToStarname(object) === starname;
      }) ?? null
    );
  }
}

export const isStargateApi = (api: AbstractApi): api is Stargate =>
  api.type === ApiType.STARGATE;
