import { fromBech32 } from "@cosmjs/encoding";
import api from "api";
import config from "config";
import { TokenLike } from "config";
import { LocationDescriptor } from "history";
import { Task } from "logic/httpClient";
import { action, computed, observable } from "mobx";
import { Any } from "proto/google/protobuf/any";
import {
  Account as StarnameAccountType,
  Domain as StarnameDomainType,
} from "proto/iov/starname/v1beta1/types";
import {
  MANAGER_DELETE_STARNAME_ROUTE,
  MANAGER_EDIT_STARNAME_ROUTE,
  MANAGER_MANAGE_CERTIFICATES,
  MANAGER_RENEW_STARNAME_ROUTE,
  MANAGER_SELL_STARNAME_ROUTE,
  MANAGER_SHOW_QR_ROUTE,
  MANAGER_TRANSFER_STARNAME_ROUTE,
} from "routes/paths";
import { TxType } from "signers/starnameRegistry";
import { Amount } from "types/amount";
import { Domain, isDomain } from "types/domain";
import { Fees } from "types/fees";
import { isName, Name } from "types/name";
import { NameType } from "types/nameType";
import { OperationType } from "types/operationType";
import { Profile } from "types/profile";
import { Starname } from "types/resolveResponse";
import { Resource, ResourceInfo } from "types/resourceInfo";
import { SocialHandle } from "types/socialHandle";
import { SocialHandleType } from "types/socialHandleType";
import { getProfile } from "utils/profileUtils";
import { starnameResolutionResponseToName } from "utils/starnameResolutionResponseToName";

import { Escrow } from "./escrow";

export interface ItemRouteState {
  item: NameItem;
}

export enum OwnershipType {
  Self,
  Loaned,
  Admin,
  Escrow,
}

const InvalidTypeError = new Error(
  "Invalid type, cannot determine if this is a domain or an account",
);

export class NameItem {
  private readonly baseItem: Domain | Name;
  private readonly ownership: OwnershipType;
  @observable.ref profile: Profile | null = null;
  @observable loadingProfile = false;

  constructor(value: Domain | Name, ownership = OwnershipType.Self) {
    this.baseItem = value;
    this.ownership = ownership;
  }

  public getValue(): Domain | Name {
    return this.baseItem;
  }

  public getOwnership(): OwnershipType {
    return this.ownership;
  }

  public get domain(): string {
    const { baseItem } = this;
    if (isName(baseItem)) {
      const { domain } = baseItem;
      return domain.name;
    } else if (isDomain(baseItem)) {
      return baseItem.name;
    } else {
      throw InvalidTypeError;
    }
  }

  public get name(): string {
    const { name } = this.baseItem;
    return name;
  }

  public get type(): NameType {
    const { baseItem } = this;
    if (isName(baseItem)) {
      if (baseItem.name === "") {
        return NameType.Domain;
      } else {
        return NameType.Account;
      }
    } else {
      return NameType.Domain;
    }
  }

  public toString(): string {
    const { baseItem } = this;
    if (isName(baseItem)) {
      const { domain } = baseItem;
      return [baseItem.name, domain.name].join("*");
    } else if (isDomain(baseItem)) {
      return "*" + baseItem.name;
    } else {
      return "not implemented";
    }
  }

  public validUntil(): number {
    // Note that js timestamps are in ms
    const { baseItem } = this;
    if (isName(baseItem)) {
      const { domain } = baseItem;
      if (domain.type === "closed") {
        return domain.validUntil * 1000;
      }
      return baseItem.validUntil * 1000;
    } else if (isDomain(baseItem)) {
      return baseItem.validUntil * 1000;
    }
    return Date.now();
  }

  public deadline(escrows: ReadonlyArray<Escrow>): number {
    const { ownership } = this;
    // should throw? or maybe this?
    if (ownership !== OwnershipType.Escrow) return this.validUntil();
    const escrow = api.getEscrow(this.toString(), escrows);
    // not possible
    if (escrow === null) return NaN;
    return parseInt(escrow.deadline) * 1000;
  }

  private urlBuilder(base: string): LocationDescriptor<ItemRouteState> {
    return {
      pathname: base.includes(":starname")
        ? base.replace(":starname", this.toString())
        : base.replace(":name", this.toString()),
      state: { item: this },
    };
  }

  public deleteUrl(): LocationDescriptor<ItemRouteState> {
    return this.urlBuilder(MANAGER_DELETE_STARNAME_ROUTE);
  }

  public transferUrl(): LocationDescriptor<ItemRouteState> {
    return this.urlBuilder(MANAGER_TRANSFER_STARNAME_ROUTE);
  }

  public renewUrl(): LocationDescriptor<ItemRouteState> {
    return this.urlBuilder(MANAGER_RENEW_STARNAME_ROUTE);
  }

  public editProfileUrl(): LocationDescriptor<ItemRouteState> {
    return this.urlBuilder(MANAGER_EDIT_STARNAME_ROUTE);
  }

  public showQRUrl(): LocationDescriptor<ItemRouteState> {
    return this.urlBuilder(MANAGER_SHOW_QR_ROUTE);
  }

  public sellStarnameUrl(): LocationDescriptor<ItemRouteState> {
    return this.urlBuilder(MANAGER_SELL_STARNAME_ROUTE);
  }

  public manageCertificatesUrl(): LocationDescriptor<ItemRouteState> {
    return this.urlBuilder(MANAGER_MANAGE_CERTIFICATES);
  }

  public getDomainName(): string {
    const { baseItem } = this;
    if (isDomain(baseItem)) {
      return baseItem.name;
    } else {
      const { domain } = baseItem;
      return domain.name;
    }
  }

  public getDomain(): Domain {
    const { baseItem } = this;
    if (isDomain(baseItem)) {
      return baseItem;
    }
    return baseItem.domain;
  }

  private getOpenAccountOperationPrice(
    type: OperationType,
    fees: Fees,
  ): number {
    switch (type) {
      case OperationType.Transfer:
        return fees.transferAccountOpen;
      case OperationType.Renew:
        return fees.registerAccountOpen;
      case OperationType.Delete:
        return fees.feeDefault;
      case OperationType.Edit:
        return fees.replaceAccountResources;
      case OperationType.SetMetadata:
        return fees.setAccountMetadata;
      case OperationType.CreateEscrow:
        return fees.createEscrow;
      case OperationType.UpdateEscrow:
        return fees.updateEscrow;
      case OperationType.TransferToEscrow:
        return fees.transferToEscrow;
      case OperationType.RefundEscrow:
        return fees.refundEscrow;
    }
  }

  private getOpenDomainOperationPrice(type: OperationType, fees: Fees): number {
    const targets: ReadonlyArray<ResourceInfo> = this.getResources();
    switch (type) {
      case OperationType.Transfer:
        return fees.transferDomainOpen;
      case OperationType.Renew:
        return (
          fees.renewDomainOpen + targets.length * fees.registerAccountClosed
        );
      case OperationType.Delete:
        return fees.feeDefault;
      case OperationType.Edit:
        // only implicit account will reach here
        return fees.replaceAccountResources;
      case OperationType.SetMetadata:
        // only implicit account will reach here
        return fees.setAccountMetadata;
      case OperationType.CreateEscrow:
        return fees.createEscrow;
      case OperationType.UpdateEscrow:
        return fees.updateEscrow;
      case OperationType.TransferToEscrow:
        return fees.transferToEscrow;
      case OperationType.RefundEscrow:
        return fees.refundEscrow;
    }
  }

  private getClosedAccountOperationPrice(
    type: OperationType,
    fees: Fees,
  ): number {
    switch (type) {
      case OperationType.Transfer:
        // this feels like we should throw here as receivers cant transfer closed accounts
        // but admin can so fee must be returned
        // should only be called from owner
        return fees.transferAccountClosed;
      case OperationType.Renew:
        throw new Error("open accounts are not directly renewable");
      case OperationType.Delete:
        return fees.feeDefault;
      case OperationType.Edit:
        return fees.replaceAccountResources;
      case OperationType.SetMetadata:
        return fees.setAccountMetadata;
      case OperationType.CreateEscrow:
      case OperationType.UpdateEscrow:
      case OperationType.TransferToEscrow:
      case OperationType.RefundEscrow:
        throw new Error("closed account escrow operation not possible");
    }
  }

  public getClosedDomainRegistrationFee(domain: string, fees: Fees): number {
    switch (domain.length) {
      case 1:
        return fees.registerDomain1;
      case 2:
        return fees.registerDomain2;
      case 3:
        return fees.registerDomain3;
      case 4:
        return fees.registerDomain4;
      case 5:
        return fees.registerDomain5;
      default:
        return fees.registerDomainDefault;
    }
  }

  private getClosedDomainOperationPrice(
    type: OperationType,
    fees: Fees,
  ): number {
    switch (type) {
      case OperationType.Transfer:
        return fees.transferDomainClosed;
      case OperationType.Delete:
        return fees.feeDefault;
      case OperationType.Edit:
        // implicity account can reach here
        return fees.replaceAccountResources;
      case OperationType.SetMetadata:
        // Only implicit account can reach here, so better return this
        return fees.setAccountMetadata;
      case OperationType.CreateEscrow:
        return fees.createEscrow;
      case OperationType.UpdateEscrow:
        return fees.updateEscrow;
      case OperationType.TransferToEscrow:
        return fees.transferToEscrow;
      case OperationType.RefundEscrow:
        return fees.refundEscrow;
      case OperationType.Renew: {
        throw new Error(
          "renewal case is handled manually, this condition should never be reached",
        );
      }
    }
  }

  private getAccountOperationPrice(
    type: OperationType,
    open: boolean,
    fees: Fees,
  ): number {
    if (open) {
      return this.getOpenAccountOperationPrice(type, fees);
    } else {
      return this.getClosedAccountOperationPrice(type, fees);
    }
  }

  private getEscrowAccountOperationPrice(
    type: OperationType,
    fees: Fees,
  ): number {
    switch (type) {
      case OperationType.CreateEscrow:
        return fees.createEscrow;
      case OperationType.UpdateEscrow:
        return fees.updateEscrow;
      case OperationType.TransferToEscrow:
        return fees.transferToEscrow;
      case OperationType.RefundEscrow:
        return fees.refundEscrow;
      case OperationType.Transfer:
      case OperationType.Renew:
      case OperationType.Delete:
      case OperationType.Edit:
      case OperationType.SetMetadata:
        throw new Error("operation not possible on escrow account");
    }
  }

  private getDomainOperationPrice(
    type: OperationType,
    open: boolean,
    fees: Fees,
  ): number {
    if (open) {
      return this.getOpenDomainOperationPrice(type, fees);
    } else {
      return this.getClosedDomainOperationPrice(type, fees);
    }
  }

  private getOperationRawPrice(type: OperationType, fees: Fees): number {
    if (this.getOwnership() === OwnershipType.Escrow)
      return this.getEscrowAccountOperationPrice(type, fees);
    const domain = this.getDomain();
    if ("type" in domain) {
      const isOpenDomain = this.getDomain().type === "open";
      if (this.type === NameType.Domain)
        return this.getDomainOperationPrice(type, isOpenDomain, fees);
      return this.getAccountOperationPrice(type, isOpenDomain, fees);
    }
    throw new Error("invalid operation/case");
  }

  public getOperationPrice(type: OperationType): Amount {
    const fees: Fees = api.getFees();
    const price: number = this.getOperationRawPrice(type, fees);
    const token: TokenLike | undefined = api.getToken(fees.feeCoinDenom);
    if (token === undefined)
      throw new Error("cannot get price for denom `" + fees.feeCoinDenom + "'");
    return new Amount(price / fees.feeCoinPrice, token);
  }

  public getSocialResources(): ReadonlyArray<Resource> {
    const { baseItem } = this;
    if (isDomain(baseItem)) {
      return [];
    } else if (isName(baseItem)) {
      const metadataUri: string | null = this.metadataUri();
      if (metadataUri !== null) {
        return [
          ...baseItem.socialResources,
          {
            uri: "metadata:url",
            resource: metadataUri,
          },
        ];
      }
      return baseItem.socialResources;
    } else {
      throw TypeError;
    }
  }

  public getPreferredAsset(): string {
    const { baseItem } = this;
    if (isDomain(baseItem)) {
      return "";
    } else if (isName(baseItem)) {
      return baseItem.preferredAsset;
    } else {
      throw InvalidTypeError;
    }
  }

  public getResources(): ReadonlyArray<ResourceInfo> {
    const { baseItem } = this;
    if (isDomain(baseItem)) {
      return [];
    } else if (isName(baseItem)) {
      if (baseItem.targets === null) return [];
      return baseItem.targets;
    } else {
      throw InvalidTypeError;
    }
  }

  public getCertificates(): ReadonlyArray<string> {
    const { baseItem } = this;
    if (isDomain(baseItem)) return [];
    return baseItem.certificates;
  }

  public transferredTo(): string | undefined {
    const { baseItem } = this;
    if (!isDomain(baseItem)) return undefined;
    if (baseItem.owner !== baseItem.admin) {
      return baseItem.owner;
    } else {
      return undefined;
    }
  }

  public isRenewable(): boolean {
    if (this.getOwnership() !== OwnershipType.Self) return false;
    const settings = api.getSettings();
    if (this.type === NameType.Domain) {
      return (
        this.validUntil() + settings.domainGracePeriod > Date.now() &&
        this.validUntil() + settings.domainRenewalPeriod <
          Date.now() +
            (1 + settings.domainRenewalCountMax) * settings.domainRenewalPeriod
      );
    } else {
      // is an account
      const domainType = this.getDomain().type;
      if (domainType === "closed") return false;
      return (
        this.validUntil() + settings.accountGradePeriod > Date.now() &&
        this.validUntil() + settings.accountRenewalPeriod <
          Date.now() +
            (1 + settings.accountRenewalCountMax) *
              settings.accountRenewalPeriod
      );
    }
  }

  public isDeletable(): boolean {
    const owns = this.getOwnership();
    if (owns === OwnershipType.Self || owns === OwnershipType.Admin) {
      if (this.type === NameType.Domain) {
        if (this.getDomain().type === "open") {
          // check for grace period here
          return (
            Date.now() > this.validUntil() + api.getSettings().domainGracePeriod
          );
        }
        return true;
      }
      return true;
    }
    return false;
  }

  public isTradable(): boolean {
    if (this.type === NameType.Domain) return true;

    const owns = this.getOwnership();
    // immediately return true
    // as further check can become false as when quering escrow accounts
    // we create a mock domain which doesnt have a actual type property
    if (owns === OwnershipType.Escrow) return true;
    if (owns === OwnershipType.Loaned) return false;
    return this.getDomain().type === "open";
  }

  public metadataUri(): string | null {
    const { baseItem } = this;
    if (isName(baseItem)) {
      return baseItem.metadataURI;
    } else if (isDomain(baseItem)) {
      throw new Error("domains cannot hold metadata");
    } else {
      throw InvalidTypeError;
    }
  }

  public isTransferred(): boolean {
    if (isDomain(this.baseItem)) {
      const { admin, owner } = this.baseItem;
      return admin !== owner;
    } else {
      const { domain, owner } = this.baseItem;
      return domain.admin !== owner;
    }
  }

  public isPremium(): boolean {
    if (this.type === NameType.Domain) return true;
    const domain = this.getDomain();
    const {
      basicEditionDomains: { starname, community },
    } = config;
    return (
      !starname.includes(domain.name) &&
      !community.find((domainAss) => domainAss.domain === domain.name)
    );
  }

  public getSocialHandle(type: SocialHandleType): SocialHandle {
    const { baseItem } = this;
    if (isDomain(baseItem)) {
      return { verified: false, value: "" };
    } else if (isName(baseItem)) {
      const handle: SocialHandle | null = baseItem.socialHandles[type];
      if (handle === null) {
        return { verified: false, value: "" };
      }
      return handle;
    } else {
      throw TypeError;
    }
  }

  @action.bound
  public setLoadingProfile(value: boolean): void {
    this.loadingProfile = value;
  }

  @action.bound
  public loadProfile(): Task<void> {
    const { baseItem } = this;
    this.setLoadingProfile(true);
    const task: Task<Profile> = getProfile(baseItem.owner, this);
    return {
      run: async (): Promise<void> => {
        try {
          const profile: Profile = await task.run();
          this.setProfile(profile);
        } finally {
          this.setLoadingProfile(false);
        }
      },
      abort: (): void => {
        task.abort();
      },
    };
  }

  @action.bound
  public setProfile(profile: Profile): void {
    this.profile = profile;
  }

  @computed
  public get publicUrl(): string {
    return "https://starname.me/" + this.toString();
  }

  public async getAccountsNumInDomain(): Promise<number> {
    return Task.toPromise(api.getAccountsNumInDomain(this.getDomain()));
  }

  private async reloadDomain(): Promise<NameItem> {
    const converter = starnameResolutionResponseToName(undefined);
    const task: Task<Starname> = api.resolveStarname(this.toString());
    return converter(await task.run());
  }

  private async reloadName(): Promise<NameItem> {
    const task1: Task<Domain> = api.getDomainInfo(this.domain);
    const domain: Domain = await task1.run();
    const task2: Task<Starname> = api.resolveStarname(this.toString());
    const converter = starnameResolutionResponseToName(domain);
    return converter(await task2.run());
  }

  public async reload(): Promise<NameItem> {
    switch (this.type) {
      case NameType.Domain:
        return this.reloadDomain();
      case NameType.Account:
        return this.reloadName();
    }
  }

  public equals(other: NameItem): boolean {
    return (
      this.name === other.name &&
      this.domain === other.domain &&
      this.type === other.type
    );
  }

  public static constructTransferrableObjectFromItem(item: NameItem): Any {
    if (item.type === NameType.Domain) {
      const domain = item.getDomain();
      return {
        typeUrl: TxType.Starname.Domain,
        value: StarnameDomainType.encode(
          StarnameDomainType.fromPartial({
            name: domain.name,
            validUntil: domain.validUntil,
            admin: fromBech32(domain.admin).data,
          }),
        ).finish(),
      };
    } else {
      const value = item.getValue();
      return {
        typeUrl: TxType.Starname.Account,
        value: StarnameAccountType.encode(
          StarnameAccountType.fromPartial({
            domain: item.domain,
            name: item.name,
            validUntil: item.validUntil() / 1000,
            owner: isDomain(value)
              ? fromBech32(value.admin).data
              : fromBech32(value.owner).data,
          }),
        ).finish(),
      };
    }
  }
}

export const dummyItem = new NameItem({
  kind: "domain",
  owner: "",
  name: "",
  admin: "",
  validUntil: 0,
  type: "",
  broker: "",
});
