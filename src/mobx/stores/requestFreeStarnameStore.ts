import api from "api";
import toast, { ToastType } from "components/toast";
import config from "config";
import { getAllOtherAutoChains } from "config/supportedChains";
import locales from "locales/strings";
import { action, computed, observable } from "mobx";
import React from "react";
import { GDriveCustodian } from "signers/gdrive/custodian";
import { Wallet } from "signers/wallet";
import { Starname } from "types/resolveResponse";
import { debounceTask } from "utils/debounceTask";
import sendConfirmationEmail from "utils/sendConfirmationEmail";

enum RequestFreeStarnameErrorCode {
  BadRequest,
  InternalError,
  NotAuthorized,
  AlreadyOwnFreeStarname,
  InvalidResponseCode,
}

interface RequestFreeStarnameError {
  readonly code: RequestFreeStarnameErrorCode;
  readonly kind: "RequestFreeStarnameError";
}

const isRequestFreeStarnameError = (
  value: any | RequestFreeStarnameError,
): value is RequestFreeStarnameError => {
  if (value === null) return false;
  return value.kind === "RequestFreeStarnameError";
};

export class RequestFreeStarnameStore {
  @observable public error = false;
  @observable public starnameHelperText = " ";
  @observable public queryingStarname = false;
  @observable public name = "";
  @observable public domain = config.basicEditionDomains.starname[0] || "iov";
  @observable public validStarname = false;
  @observable public requesting = false;

  private onSuccessHandler = (): void => {};

  @computed
  public get isFormComplete(): boolean {
    return this.validStarname;
  }

  @computed
  public get starname(): string {
    return `${this.name}*${this.domain}`;
  }

  @action.bound
  public setName(value: string): void {
    this.name = value;
  }

  @action.bound
  public setDomain(value: string): void {
    this.domain = value;
  }

  @action.bound
  private async handleStarnameQueryPromise(
    promise: Promise<Starname>,
  ): Promise<void> {
    // Start the query
    this.starnameHelperText = locales.FREE_STARNAME_CHECKING_AVAILABILITY;
    this.queryingStarname = true;
    try {
      await promise;
      // If no errors happened here, it means the
      // starname exists
      this.starnameHelperText = locales.FREE_STARNAME_SORRY_NOT_AVAILABLE;
      this.queryingStarname = false;
      this.error = true;
    } catch (error: any) {
      if ("body" in error) {
        if ("error" in error.body) {
          const { error: message } = error.body;
          // Other errors are ignored (like the abort error)
          if (
            error.code === 400 &&
            message.includes("not found in domain iov")
          ) {
            this.starnameHelperText = locales.FREE_STARNAME_NICE_AVAILABLE;
            this.validStarname = true;
          }
        } else if (error.code === 400 && "message" in error.body) {
          const { message: errorMessage } = error.body;
          if (errorMessage.includes("account does not exist")) {
            this.starnameHelperText = locales.FREE_STARNAME_NICE_AVAILABLE;
            this.validStarname = true;
          }
        }
        this.queryingStarname = false;
      } else {
        throw error;
      }
    }
  }

  @action.bound
  public queryStarname(): (() => void) | void {
    const { starname, name } = this;
    this.error = false;
    this.validStarname = false;
    if (name.length === 0) {
      this.queryingStarname = false;
      this.starnameHelperText = " ";
      this.error = false;
    } else if (api.isValidStarname(name)) {
      const task = debounceTask(api.resolveStarname(starname), 300);
      this.handleStarnameQueryPromise(task.run()).catch(console.warn);
      return (): void => task.abort();
      // Called to abort the query
    } else {
      this.starnameHelperText = locales.FREE_STARNAME_TYPO;
      this.error = true;
    }
  }

  private getResponseObjectFromRawResponse = (
    response: Response,
  ): RequestFreeStarnameError | null => {
    switch (response.status) {
      case 201:
        return null;
      case 400:
        return {
          code: RequestFreeStarnameErrorCode.BadRequest,
          kind: "RequestFreeStarnameError",
        };
      case 401:
        return {
          code: RequestFreeStarnameErrorCode.NotAuthorized,
          kind: "RequestFreeStarnameError",
        };
      case 500:
        return {
          code: RequestFreeStarnameErrorCode.InternalError,
          kind: "RequestFreeStarnameError",
        };
      default:
        return {
          code: RequestFreeStarnameErrorCode.InvalidResponseCode,
          kind: "RequestFreeStarnameError",
        };
    }
  };

  private handleRequestFreeStarnameResponse = async (
    response: Response,
    custodian: GDriveCustodian,
  ): Promise<void> => {
    const data = await this.getResponseObjectFromRawResponse(response);
    if (isRequestFreeStarnameError(data)) {
      switch (data.code) {
        case RequestFreeStarnameErrorCode.BadRequest:
        case RequestFreeStarnameErrorCode.InternalError:
          toast.show(locales.FREE_STARNAME_SOMETHING_HAPPENED, ToastType.Error);
          break;
        case RequestFreeStarnameErrorCode.NotAuthorized:
          toast.show(locales.FREE_STARNAME_ALREADY_REQUESTED, ToastType.Error);
          break;
        case RequestFreeStarnameErrorCode.AlreadyOwnFreeStarname:
          toast.show(locales.FREE_STARNAME_ALREADY_REQUESTED, ToastType.Error);
          break;
        case RequestFreeStarnameErrorCode.InvalidResponseCode:
          toast.show(
            locales.FREE_STARNAME_INVALID_RESPONSE_CODE,
            ToastType.Error,
          );
          break;
      }
    } else {
      if (this.onSuccessHandler) {
        this.onSuccessHandler();
      }
      const status = await sendConfirmationEmail(
        this.starname,
        custodian.getIdToken(),
      );
      if (!status) console.error("failed sending confirmation email");
    }
  };

  private requestFreeStarnameAsync = async (
    custodian: GDriveCustodian,
    wallet: Wallet,
  ): Promise<void> => {
    const { starname } = this;
    const idToken: string = custodian.getIdToken();
    if (idToken === undefined) {
      throw new Error(
        "cannot resolve google id token to authorize this request",
      );
    }
    const otherResources = [];
    try {
      const communitySpecificChain = wallet.getCommunitySpecificChain(
        starname.split("*")[1],
      );
      const otherChainResources = await wallet.getOtherChainResources(
        communitySpecificChain
          ? getAllOtherAutoChains().concat(communitySpecificChain)
          : getAllOtherAutoChains(),
      );
      otherResources.push(...otherChainResources);
    } catch (error) {
      console.error(error);
    }
    const address: string = await wallet.getAddress();
    const response: Response = await fetch(config.freeStarnameApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        starname,
        idToken,
        otherResources,
      }),
    });
    return this.handleRequestFreeStarnameResponse(response, custodian);
  };

  @action.bound
  public requestFreeStarname(custodian: GDriveCustodian, wallet: Wallet): void {
    this.requesting = true;
    this.requestFreeStarnameAsync(custodian, wallet)
      .catch((error: any): void => {
        this.error = true;
        this.starnameHelperText = `${error}`;
      })
      .finally((): void => {
        this.requesting = false;
      });
  }

  public setOnSuccessHandler(handler: () => void): void {
    this.onSuccessHandler = handler;
  }
}

export const RequestFreeStarnameStoreContext =
  React.createContext<RequestFreeStarnameStore>(new RequestFreeStarnameStore());
