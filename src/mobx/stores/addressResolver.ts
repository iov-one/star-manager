import api from "api";
import { Task, TaskError } from "logic/httpClient";
import { action, computed, observable } from "mobx";
import { Settings } from "types/settings";
import { getIOVAddressForStarname } from "utils/addressResolver";

export const AddressRegex = /^star1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38}$/;

export class AddressResolver {
  @observable addressOrStarname = "";
  // Keep the address in case it's a starname or something
  @observable error: string | undefined = undefined;
  @observable resolving = false;
  @observable executing = false;
  @observable certified = false;
  // Does not need to be accessed from elsewhere
  @observable address = "";

  private readonly chainId: string;

  constructor() {
    this.chainId = api.getChainId();
  }

  @computed
  public get valid(): boolean {
    return AddressResolver.isAddress(this.address);
  }

  private static isDomain(value: string): boolean {
    if (!value.startsWith("*")) return false;
    const settings: Settings = api.getSettings();
    const regex = new RegExp(settings.validDomainName);
    return regex.test(value.substr(1));
  }

  private static isAccount(value: string): boolean {
    const [name, domain, ...others] = value.split("*");
    if (others.length !== 0) return false;
    if (name === undefined || domain === undefined) return false;
    const settings: Settings = api.getSettings();
    const domainRegex = new RegExp(settings.validDomainName);
    const nameRegex = new RegExp(settings.validAccountName);
    return (
      (domainRegex.test(domain) || domain === "iov") && nameRegex.test(name)
    );
  }

  private static isAddress(value: string): boolean {
    return AddressRegex.test(value);
  }

  @action.bound
  public setAddressOrStarname(input: string): () => void {
    const value: string = input.trim();
    this.certified = false;
    this.addressOrStarname = value;
    this.error = undefined;
    const resolve: () => () => void = () => {
      if (AddressResolver.isDomain(value)) {
        return this.resolveAndSetAddress(value);
      } else if (AddressResolver.isAccount(value)) {
        return this.resolveAndSetAddress(value);
      } else if (AddressResolver.isAddress(value)) {
        this.setAddress(value);
      } /* Likely invalid input */ else {
        this.setAddress("");
      }
      return () => undefined;
    };
    const cancel = resolve();
    return () => {
      this.resolving = false;
      // Do cancellation now
      cancel();
    };
  }

  @action.bound
  private resolveAndSetAddress(value: string): () => void {
    this.resolving = true;
    const task: Task<string> = getIOVAddressForStarname(value);
    task
      .run()
      .then((address: string) => {
        this.setAddress(address);
      })
      .catch((error: TaskError & { error: string }) => {
        this.address = "";
        if (error.code === -1) {
          // Simply aborted, do nothing
        } else if (typeof error.body === "string") {
          this.setError(error.body);
        } else if ("error" in error.body) {
          const { error: message } = error.body;
          if (message.includes("does not exist")) {
            this.setError("Name or starname does not exist");
          } else {
            this.setError(message);
          }
        } else if ("code" in error.body && error.body.code === 3) {
          this.setError("Name or starname does not exist");
        }
      })
      .finally((): void => {
        this.resolving = false;
      });
    return () => {
      task.abort();
    };
  }

  @action.bound
  private setAddress(address: string): void {
    this.resolving = false;
    this.address = address;

    // TODO: check if address has certificates and
    //       set this to true
    // this.certified = true;
  }

  @action.bound
  private setError(error: string): void {
    this.error = error;
    this.resolving = false;
    this.address = "";
  }
}
