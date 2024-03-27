import { Signer } from "@iov/gdrive-custodian";
import api from "api";
import config from "config";
import { Menus } from "data/menus";
import { RootRoutes } from "data/rootRoutes";
import locales, { templateToString } from "locales/strings";
import { Task } from "logic/httpClient";
import { action, computed, observable } from "mobx";
import React from "react";
import { GOOGLE_DRIVE_DISPLAY_MNEMONIC } from "routes/paths";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { ApplicationName } from "types/applicationName";
import { Domain } from "types/domain";
import { Escrow } from "types/escrow";
import { MenuItemDef } from "types/menuItemDef";
import { NameItem, OwnershipType } from "types/nameItem";
import { NameType } from "types/nameType";
import { Warning } from "types/warning";

const APPLICATION_NAME_STORAGE_KEY = "current-application";
export const CURRENT_PROFILE_STORAGE_KEY = "current-profile";

export class SessionStore {
  @observable.ref public menu: ReadonlyArray<MenuItemDef> = [];
  @observable public application: ApplicationName = ApplicationName.Manager;
  @observable public rootRoute = "";
  @observable.ref public warning: Warning | null = null;
  @observable public loading = true;
  @observable.ref
  public accounts: ReadonlyArray<NameItem> = [];
  @observable.ref public escrows: ReadonlyArray<Escrow> = [];
  @observable public queriedStarname: string | null = null;
  @observable public viewOnlyMode = false;
  @observable public showBuyTokenWidget = false;

  @observable wallet: Wallet | null = null;

  @action.bound
  public setWallet(wallet: Wallet | null): () => void {
    if (wallet !== null) {
      this.wallet = wallet;
      const currentApp: string | null = localStorage.getItem(
        APPLICATION_NAME_STORAGE_KEY,
      );
      if (currentApp !== null && currentApp in Menus) {
        this.setApplication(currentApp as ApplicationName);
      } else {
        this.setApplication(ApplicationName.Manager);
      }
      return this.initialize();
    } else {
      this.wallet = wallet;
    }
    return (): void => {};
  }

  @action.bound
  public setViewOnlyMode(mode: boolean): void {
    this.viewOnlyMode = mode;
  }

  @action.bound
  public setShowBuyTokenWidget(value: boolean): void {
    this.showBuyTokenWidget = value;
  }

  private async getOwnedAccounts(
    address: string,
  ): Promise<ReadonlyArray<NameItem> | null> {
    const getMaxLimitTask = api.getCountForAccountsWithOwner(address);
    const maxLimit = await getMaxLimitTask.run();
    const task: Task<ReadonlyArray<NameItem>> = api.getAccountsWithOwner(
      address,
      maxLimit ?? undefined,
    );
    const items: ReadonlyArray<NameItem> = await task.run();
    return items;
  }

  private getOwnedDomains(
    items: ReadonlyArray<NameItem>,
  ): ReadonlyArray<Domain> {
    return items.reduce((acc, item) => {
      if (item.type === NameType.Domain) acc.push(item.getDomain());
      return acc;
    }, Array<Domain>());
  }

  private async getEscrowAccounts(): Promise<ReadonlyArray<Escrow> | null> {
    const { wallet } = this;
    if (wallet === null) return null;
    const address = await wallet.getAddress();
    return Task.toPromise(api.getEscrows(address));
  }

  private async getLoanedAccounts(
    address: string,
    ownedAccounts: ReadonlyArray<NameItem>,
  ): Promise<ReadonlyArray<NameItem>> {
    const ownedDomains = this.getOwnedDomains(ownedAccounts);
    const accountsUnderDomains = await Promise.all(
      ownedDomains.map((domain) =>
        Task.toPromise(api.getAccountsInDomain(domain)),
      ),
    );
    // separate loaned accounts from owned
    // also don't include escrow accounts
    return accountsUnderDomains
      .map((accounts) =>
        accounts
          // open accounts are not considered loaned
          .filter((_acc) => _acc.getDomain().type !== "open")
          .filter(
            (_acc) =>
              // this will separate owned accounts
              _acc.getValue().owner !== address &&
              // escrow address has different length
              // so its a distinguishing factor
              // TODO: find a better way
              _acc.getValue().owner.length < 45,
          )
          .map((item) => {
            // now these NameItem contain ownership = loaned
            // but we want to display it for admin view
            // check if current wallet address is admin of any of these items
            // and manipulate account ownership accordingly
            return item.getDomain().admin === address
              ? new NameItem(item.getValue(), OwnershipType.Admin)
              : item;
          }),
      )
      .flat();
  }

  private async getAccounts(): Promise<ReadonlyArray<NameItem> | null> {
    const { wallet } = this;
    if (wallet === null) return null;
    const address: string = await wallet.getAddress();
    const accountsListing = Array<NameItem>();
    // this will contain normal accounts as well as domain(implicit) accounts
    // domain(implicit) accounts are needed to provide info on domain as well all accounts under it
    const ownedAccounts = await this.getOwnedAccounts(address);
    if (ownedAccounts) {
      // merge with result by specifying type as owned
      accountsListing.push(...ownedAccounts);
      // these accounts doesnt belong to domain admin
      // but required for dashboard listing
      const loanedAccounts = await this.getLoanedAccounts(
        address,
        ownedAccounts,
      );
      accountsListing.push(...loanedAccounts);
    }
    // add escrows to listing as well
    accountsListing.push(...this.escrows.map(api.escrowToNameItem));
    return accountsListing;
  }

  @action.bound
  public onAccountDeleted(deleted: NameItem): void {
    const { accounts } = this;
    this.accounts = accounts.filter(
      (item: NameItem): boolean => !item.equals(deleted),
    );
  }

  @action.bound
  public onProfileUpdated(account: NameItem): void {
    const { accounts } = this;
    const index: number = accounts.findIndex((item: NameItem): boolean => {
      if (item === undefined) return false;
      return (
        account.name === item.name &&
        account.domain === item.domain &&
        account.type === item.type
      );
    });
    if (index === -1) {
      console.warn("cannot find the modified account");
    } else {
      this.accounts = [
        ...accounts.slice(0, index),
        account,
        ...accounts.slice(index + 1),
      ];
    }
  }

  public onGlobalTaskStarted(): void {
    this.setLoading(true);
  }

  public onGlobalTaskFinished(): void {
    this.setLoading(false);
  }

  private initialize(): () => void {
    void this.refreshAccounts();
    return (): void => {};
  }

  @action.bound
  public async refreshAccounts(): Promise<void> {
    this.setLoading(true);
    try {
      // must be queried before getAccounts as escrows are required by that fn
      const escrows = await this.getEscrowAccounts();
      // some mobx state issue.. soln: update accounts right now!
      if (escrows) this.setEscrows(escrows);
      const accounts = await this.getAccounts();
      await this.checkGoogleKeySafety();
      if (accounts) this.setAccounts(accounts);
    } catch (error) {
      console.warn(error);
    } finally {
      this.setLoading(false);
    }
  }

  @action.bound
  public setApplication(name: ApplicationName): void {
    const { wallet } = this;
    if (wallet === null) return;
    if (name in Menus) {
      localStorage.setItem(APPLICATION_NAME_STORAGE_KEY, name);
      this.menu = Menus[name];
      this.rootRoute = RootRoutes[name];
      this.application = name;
    } else {
      this.menu = [];
      this.rootRoute = "/";
      this.application = name;
    }
  }

  @action.bound
  public setWarning(warning: Warning | null): void {
    this.warning = warning;
  }

  @action.bound
  public setLoading(value: boolean): void {
    this.loading = value;
  }

  public reset(): void {
    this.loading = false;
    this.menu = [];
    this.application = ApplicationName.Manager;
    this.warning = null;
    this.rootRoute = "";
    this.queriedStarname = null;
  }

  public static getCurrentAccount(
    accounts: ReadonlyArray<NameItem>,
  ): NameItem | null {
    // Nothing to lookup
    if (accounts.length === 0) return null;
    const savedName: string | null = localStorage.getItem(
      CURRENT_PROFILE_STORAGE_KEY,
    );
    if (savedName !== null) {
      const found: NameItem | undefined = accounts.find(
        (item: NameItem): boolean => {
          return item.toString() === savedName;
        },
      );
      if (found !== undefined) {
        return found;
      } else {
        return accounts[0];
      }
    } else {
      return accounts[0];
    }
  }

  @computed
  public get userHasStarnames(): boolean {
    const { accounts } = this;
    return accounts.length > 0;
  }

  @action.bound
  public setAccounts(accounts: ReadonlyArray<NameItem>): void {
    if (accounts.length > 0) {
      this.accounts = accounts
        .slice()
        .sort((a1: NameItem, a2: NameItem): number => {
          const n1: string = a1.toString();
          return n1.localeCompare(a2.toString());
        });
    } else {
      this.accounts = [];
    }
  }

  @action.bound
  public setEscrows(escrows: ReadonlyArray<Escrow>): void {
    if (escrows.length > 0) {
      this.escrows = escrows;
    } else {
      this.escrows = [];
    }
  }

  private async checkGoogleKeySafety(): Promise<void> {
    const { wallet } = this;
    if (wallet === null) return;
    const { signer } = wallet;
    if (signer.type !== SignerType.Google) return;
    const googleSigner: Signer = signer;
    // Check if we mnemonic is stored
    if (await googleSigner.isMnemonicSafelyStored()) return;

    this.setWarning({
      title: templateToString(locales.MNEMONIC_NOT_STORED_TITLE, {
        count: config.gdriveMnemonicLength,
      }),
      message: templateToString(locales.MNEMONIC_NOT_STORE_MESSAGE, {
        count: config.gdriveMnemonicLength,
      }),
      action: {
        handler: (): void => {
          googleSigner
            .showMnemonic(GOOGLE_DRIVE_DISPLAY_MNEMONIC)
            .then((saved: boolean): void => {
              if (saved) {
                this.setWarning(null);
              }
            });
        },
        label: locales.SHOW_MNEMONIC,
      },
    });
  }

  @action.bound
  public runGlobalTask<T>(task: Task<T>): (() => void) | void {
    this.setLoading(true);
    // Create the loading task
    task
      .run()
      .catch((error: any): void => {
        console.warn(error);
      })
      .finally((): void => {
        this.setLoading(false);
      });
    return (): void => {
      this.setLoading(false);
      task.abort();
    };
  }

  @action.bound
  public setQueriedStarname(starname: string | null): void {
    this.queriedStarname = starname;
  }

  @computed
  public get urlQueriedStarname(): string {
    if (this.queriedStarname) {
      const starIdx = this.queriedStarname.indexOf("*");
      if (starIdx === -1) {
        return this.queriedStarname;
      } else if (starIdx === 0) {
        return this.queriedStarname.substring(1);
      } else return this.queriedStarname.substring(0, starIdx);
    }
    return "";
  }
}

export const SessionStoreContext = React.createContext<SessionStore>(
  new SessionStore(),
);
