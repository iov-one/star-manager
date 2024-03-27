import { StdFee } from "@cosmjs/amino";
import { Asset } from "@iov/asset-directory";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { IInternalEvent, IWalletConnectSession } from "@walletconnect/types";
import {
  Account,
  aggregates,
  AggregateSubmitResult,
  cosmos,
  Options,
  store,
  StoreSubmitResult,
} from "aleph-js";
import api from "api";
import modal from "components/modal";
import toast, { ToastType } from "components/toast";
import { WalletConnectAssetList } from "components/walletConnectAssetList";
import config from "config";
import { TxRejected } from "constants/errorCodes";
import deepEqual from "fast-deep-equal";
import strings from "locales/strings";
import { Task } from "logic/httpClient";
import { action, computed, IValueDidChange, observable, observe } from "mobx";
import React from "react";
import { GasEstimatorWallet } from "signers/gasEstimator";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { NameItem } from "types/nameItem";
import { NameType } from "types/nameType";
import {
  isFee,
  isTransactionFailure,
  isTransactionSuccess,
  PostTxResult,
} from "types/postTxResult";
import { EmptyProfile, OffChainProfile, Profile } from "types/profile";
import { Resource, ResourceInfo } from "types/resourceInfo";
import { SocialHandle } from "types/socialHandle";
import { SocialHandleType } from "types/socialHandleType";
import { SocialHandleVerification } from "types/socialHandleVerification";
import { TxError } from "types/txError";
import { AlephSigner } from "utils/alephSigner";
import { isRequestRejectedError } from "utils/isRequestRejectedError";
import { isStargateClientSdkBroadcastError } from "utils/isStargateClientSdkBroadcastError";
import { getAlephHashFromUrl } from "utils/profileUtils";
import { WalletConnectAddressReader } from "utils/walletConnect/abstractAddressReader";
import { DefaultWalletConnectAddressReader } from "utils/walletConnect/defaultWalletAddressReader";
import { StarnameWalletConnectAddressReader } from "utils/walletConnect/starnameWalletAddressReader";
import { WalletConnectAddressItem } from "utils/walletConnect/walletConnectAddressItem";

const { alephConfig } = config;

export class ProfileStore {
  @observable name = "";
  @observable photo: string | null = null;
  @observable loading = false;
  @observable biography = "";
  @observable oldProfile: Profile = EmptyProfile;
  @observable.ref socialResources: ReadonlyArray<Resource> = [];
  @observable.ref resources: ReadonlyArray<ResourceInfo> = [];
  @observable.ref availableAssets: ReadonlyArray<Asset> = api.getAssets();
  @observable hasProfile = false;
  @observable preferredAsset = "";
  @observable
  fee: StdFee = {
    gas: "0",
    amount: [],
  };

  private estimator: Wallet = new GasEstimatorWallet();
  private file: File | null = null;
  private originalSocialResources: ReadonlyArray<Resource> = [];
  private originalResources: ReadonlyArray<ResourceInfo> = [];
  private originalPreferredAsset = "";

  constructor() {
    observe(
      this,
      "resources",
      (change: IValueDidChange<ReadonlyArray<ResourceInfo>>): void => {
        const resources: ReadonlyArray<ResourceInfo> = change.newValue;
        if (
          resources.find(({ asset }: ResourceInfo): boolean => {
            return asset["starname-uri"] === this.preferredAsset;
          }) === undefined
        ) {
          this.setPreferredAsset("");
        }
        this.updateFee();
      },
    );
    observe(this, "socialResources", (): void => {
      this.updateFee();
    });
  }

  @action.bound
  private setProfile(profile: Profile): void {
    this.name = profile.name;
    this.biography = profile.biography;
    this.photo =
      profile.photo === "" || profile.photo === null ? null : profile.photo;
    this.updateOldProfile();
  }

  private updateOldProfile(): void {
    // Copy all values to the profile
    this.oldProfile = {
      name: this.name,
      photo: this.photo,
      biography: this.biography,
    };
  }

  @action.bound
  public load(wallet: Wallet, item: NameItem): Task<void> {
    this.hasProfile = item.metadataUri() !== null;
    this.setResources(this.sortedResources([...item.getResources()]));
    this.preferredAsset = item.getPreferredAsset();
    this.originalPreferredAsset = this.preferredAsset;
    this.originalResources = this.resources;
    this.socialResources = this.sortedSocialResources([
      ...item.getSocialResources(),
    ]);
    this.originalSocialResources = this.socialResources;
    if (this.hasProfile) {
      const task: Task<void> = item.loadProfile();
      return {
        run: async (): Promise<void> => {
          this.setLoading(true);
          try {
            await task.run();
            if (item.profile !== null) {
              this.setProfile(item.profile);
            }
          } finally {
            this.setLoading(false);
          }
        },
        abort: (): void => {
          this.setLoading(false);
          task.abort();
        },
      };
      // Set current profile object
    } else {
      this.setProfile({
        name: "",
        biography: "",
        photo: null,
      });
    }
    return {
      run: async (): Promise<void> => {},
      abort: (): void => {},
    };
  }

  private profileModified(): boolean {
    return !deepEqual(this.oldProfile, {
      name: this.name,
      photo: this.photo,
      biography: this.biography,
    });
  }

  @action.bound
  private setFee(fee: StdFee): void {
    this.fee = fee;
  }

  private updateFee(): void {
    const { estimator } = this;
    // Pretend that we are submitting it
    estimator
      .replaceAccountResources(
        "",
        "",
        this.resources,
        // To emulate the whole thing, we should also pretend
        // that we set the metadata url
        this.replaceMetadataUrl(this.socialResources, "non-empty"),
        "",
      )
      .then((fee: PostTxResult): void => {
        if (isFee(fee)) {
          this.setFee(fee);
        }
      });
  }

  private socialResourcesModified(): boolean {
    const { socialResources, originalSocialResources } = this;
    if (socialResources.length !== originalSocialResources.length) {
      return true;
    } else if (socialResources.length === 0) {
      return false;
    } else {
      return !socialResources.every(
        (resource: Resource, index: number): boolean => {
          const other: Resource = originalSocialResources[index];
          return (
            other.uri === resource.uri && other.resource === resource.resource
          );
        },
      );
    }
  }

  @action.bound
  private setResources(resources: ReadonlyArray<ResourceInfo>): void {
    const allAssets = api.getAssets();
    this.availableAssets = allAssets.filter((asset: Asset): boolean => {
      const found: ResourceInfo | undefined = resources.find(
        ({ asset: resourceAsset }: ResourceInfo): boolean => {
          return asset["starname-uri"] === resourceAsset["starname-uri"];
        },
      );
      return found === undefined;
    });
    this.resources = resources;
  }

  private resourcesModified(): boolean {
    const { resources, originalResources } = this;
    if (resources.length !== originalResources.length) {
      return true;
    } else {
      return resources.some(
        (resource: ResourceInfo, index: number): boolean => {
          const other: ResourceInfo = originalResources[index];
          const { asset: otherAsset } = other;
          const { asset: resourceAsset } = resource;
          return (
            other.address !== resource.address ||
            other.id !== resource.id ||
            otherAsset !== resourceAsset
          );
        },
      );
    }
  }

  private validateResources(resources: ReadonlyArray<Resource>): boolean {
    const { validResource } = api.getSettings();
    const regexp = new RegExp(validResource);
    return resources.every((res) => regexp.test(res.resource));
  }

  @computed
  public get canBeSubmitted(): boolean {
    return (
      (this.preferredAsset !== this.originalPreferredAsset ||
        this.profileModified() ||
        this.socialResourcesModified() ||
        this.resourcesModified()) &&
      this.validateResources(this.socialResources)
      // Do we actually need this ? skipping for performance
      // &&
      // this.validateResources(
      //   this.resources.map((resInfo) => {
      //     return {
      //       resource: resInfo.address,
      //       uri: `asset:${resInfo.asset.symbol.toLowerCase()}`,
      //     };
      //   }),
      // )
    );
  }

  @action.bound
  public setField(name: keyof Profile, value: string): void {
    this[name] = value;
  }

  @action.bound
  private setPhoto(value: string | null): void {
    this.photo = value;
  }

  @action.bound
  public setFile(file: File | null): void {
    this.file = file;
    if (this.file === null) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        this.setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(this.file);
  }

  @action.bound
  public setLoading(value: boolean): void {
    this.loading = value;
  }

  @action.bound
  public removeFile(): void {
    this.setPhoto(null);
    this.setFile(null);
  }

  private async getPhotoUrl(
    address: string,
    account: Account,
  ): Promise<string | null> {
    const { oldProfile } = this;
    const url: string | null = this.photo;
    if (url === null) return null;
    if (oldProfile.photo === url) return getAlephHashFromUrl(url);
    if (this.file === null) return null;
    // Upload the image
    const result: StoreSubmitResult = await store.submit(address, {
      fileobject: this.file,
      account: account,
      channel: alephConfig.channel,
      api_server: alephConfig.apiServer,
    });
    const { item_hash: hash } = result.content;
    return hash;
  }

  private replaceMetadataUrl(
    resources: ReadonlyArray<Resource>,
    value: string,
  ): ReadonlyArray<Resource> {
    return [
      ...resources.filter(
        ({ uri }: Resource): boolean => uri !== "metadata:url",
      ),
      {
        uri: "metadata:url",
        resource: value,
      },
    ];
  }
  /**
   *
   * @param wallet
   * @param item
   * @param metadataUrl this is actually a resource instead
   * @returns
   */
  public async submitToBlockchain(
    wallet: Wallet,
    item: NameItem,
    metadataUrl: string,
  ): Promise<void> {
    if (item.type === NameType.Domain) {
      try {
        // we are actually creating a special resource for starname app to read
        // it doesnt actually update a starname's metaDataUri prop
        const txResponse = await wallet.replaceAccountResources(
          "",
          item.domain,
          this.resources,
          this.replaceMetadataUrl(this.socialResources, metadataUrl),
          this.preferredAsset,
        );
        if (isTransactionFailure(txResponse))
          return Promise.reject(new TxError(txResponse));
        else if (isTransactionSuccess(txResponse)) return Promise.resolve();
      } catch (error) {
        if (isStargateClientSdkBroadcastError(error)) {
          return Promise.reject(TxError.fromStargateClientError(error));
        } else if (isRequestRejectedError(error))
          return Promise.reject(TxError.fromCode(TxRejected));
        return Promise.reject(new Error("unknown error"));
      }
    } else if (item.type === NameType.Account) {
      try {
        const txResponse = await wallet.replaceAccountResources(
          item.name,
          item.domain,
          this.resources,
          this.replaceMetadataUrl(this.socialResources, metadataUrl),
          this.preferredAsset,
        );
        if (isTransactionFailure(txResponse))
          return Promise.reject(new TxError(txResponse));
        else if (isTransactionSuccess(txResponse)) return Promise.resolve();
      } catch (error) {
        if (isStargateClientSdkBroadcastError(error)) {
          return Promise.reject(TxError.fromStargateClientError(error));
        } else if (isRequestRejectedError(error))
          return Promise.reject(TxError.fromCode(TxRejected));
        return Promise.reject(new Error("unknown error"));
      }
    } else {
      throw new Error("Cannot save your profile, an internal error occurred");
    }
  }

  @action.bound
  public async submit(wallet: Wallet, item: NameItem): Promise<void> {
    let metadataUrl = "";
    if (this.profileModified()) {
      const alephSigner: AlephSigner = new AlephSigner(wallet);
      const address: string = await wallet.getAddress();
      const starname: string = item.toString();
      const account: Account = await cosmos.from_external_signer({
        public_key: await wallet.getPublicKey(),
        address: address,
        name: starname,
        signer: alephSigner.signMessage as any,
      });
      const photo = await this.getPhotoUrl(address, account);
      const newProfile: OffChainProfile = {
        biography: this.biography,
        name: this.name,
        photo: photo,
      };
      const options: Options = {
        account: account,
        channel: alephConfig.channel,
        api_server: alephConfig.apiServer,
        storage_engine: "storage",
      };
      // We add a sleep for 500ms otherwise sometimes the Ledger doesn't display the next transaction to sign
      await new Promise<void>((resolve: () => void) => {
        setTimeout(resolve, 500);
      });
      // Save to aleph
      const result: AggregateSubmitResult = await aggregates.submit(
        address,
        starname,
        newProfile,
        options,
      );
      // We add a sleep for 500ms otherwise sometimes the Ledger doesn't display the next transaction to sign
      await new Promise<void>((resolve: () => void) => {
        setTimeout(resolve, 500);
      });
      metadataUrl = `aleph:${address}/${result.item_hash}`;
    }
    // Save on chain data
    await this.submitToBlockchain(wallet, item, metadataUrl);
  }

  @action.bound
  public removeSocialResource(type: SocialHandleType): void {
    const { socialResources } = this;
    this.socialResources = this.sortedSocialResources(
      socialResources.filter((resource: Resource): boolean => {
        const { uri } = resource;
        return uri !== "social:" + type && uri !== "social-claim:" + type;
      }),
    );
  }

  private getOriginalResource(
    matchingResource: Resource,
  ): Resource | undefined {
    const { originalSocialResources } = this;
    return originalSocialResources.find((resource: Resource): boolean => {
      return deepEqual(matchingResource, resource);
    });
  }

  @action.bound
  public addSocialResource(
    type: SocialHandleType,
    verification: SocialHandleVerification,
    resource: Resource,
  ): void {
    const { socialResources } = this;
    const existingResource: Resource | undefined =
      this.getOriginalResource(resource);
    // it already exists no need to add it again
    if (existingResource) return;
    const finalVerification: SocialHandleVerification = verification.verified
      ? verification
      : {
          url: null,
          verified: false,
        };
    // If not verified we do not add it
    if (!finalVerification.verified) {
      // Just do nothing please because this is not a
      // verified object
      return;
    }
    // filter out all existing resource related to this socialResource type
    // watch out for claims as well ;)
    const filtered = socialResources.filter((resource: Resource): boolean => {
      const { uri } = resource;
      return uri !== "social:" + type && uri !== "social-claim:" + type;
    });
    const claim: Resource =
      finalVerification.url !== null
        ? {
            uri: "social-claim:" + type,
            resource: finalVerification.url,
          }
        : ({} as Resource);
    this.socialResources = this.sortedSocialResources([
      // Non dupes
      ...filtered,
      // New stuff
      resource,
      claim,
    ]);
  }

  private sortedSocialResources(
    resources: Resource[],
  ): ReadonlyArray<Resource> {
    return resources
      .filter((resource: Resource): boolean => resource.uri !== undefined)
      .sort(({ uri: a }: Resource, { uri: b }: Resource): number =>
        a.localeCompare(b),
      );
  }

  private sortedResources(
    resources: ResourceInfo[],
  ): ReadonlyArray<ResourceInfo> {
    return resources.sort(
      (
        { asset: { name: a } }: ResourceInfo,
        { asset: { name: b } }: ResourceInfo,
      ): number => a.localeCompare(b),
    );
  }

  @action.bound
  public removeResource(resource: ResourceInfo): void {
    const { resources } = this;
    const index: number = resources.findIndex(
      (newResource: ResourceInfo): boolean => newResource.id === resource.id,
    );
    if (index !== -1) {
      this.setResources([
        ...resources.slice(0, index),
        ...resources.slice(index + 1),
      ]);
    }
  }

  @action.bound
  public addResource(symbol: string, address: string): void {
    const foundAsset = api.getAssetByTicker(symbol);
    if (foundAsset) {
      const newTarget = ProfileStore.createItemForAsset(foundAsset, address);
      if (!this.resources.includes(newTarget)) {
        this.setResources([...this.resources, newTarget]);
      }
    }
  }

  private updateResource = (
    which: ResourceInfo,
    what: Partial<ResourceInfo>,
  ): void => {
    const { resources } = this;
    const index: number = resources.findIndex(
      (each: ResourceInfo): boolean => each.id === which.id,
    );
    if (index !== -1) {
      this.setResources([
        ...resources.slice(0, index),
        {
          ...resources[index],
          ...what,
        },
        ...resources.slice(index + 1),
      ]);
    }
  };

  @action.bound
  public updateResourceAddress = (
    resource: ResourceInfo,
    address: string,
  ): void => {
    this.updateResource(resource, { address });
  };

  public updateResourceAsset = (
    resource: ResourceInfo,
    oldAsset: Asset,
    newAsset: Asset,
  ): void => {
    // Give time to the UI so that the menu is hidden first
    setTimeout((): void => {
      // Update the resource itself
      this.updateResource(resource, { asset: newAsset });
    }, 0);
  };

  private static getWalletConnectAddressReader(
    payload: string,
  ): WalletConnectAddressReader {
    if (StarnameWalletConnectAddressReader.isStarnamePayload(payload)) {
      return new StarnameWalletConnectAddressReader();
    } else {
      return new DefaultWalletConnectAddressReader();
    }
  }

  private async handleWalletConnectSession(
    payload: IInternalEvent,
  ): Promise<void> {
    const { params } = payload;
    if (params.length === 0) {
      throw new Error("did not receive any data from the wallet");
    }
    const session: IWalletConnectSession | undefined = params[0];
    if (session === undefined) {
      throw new Error("invalid message received from the wallet");
    }
    const { accounts } = session;
    if (accounts.length === 0) {
      throw new Error("there are no accounts in the session");
    }
    // Try to find the appropriate reader
    const reader: WalletConnectAddressReader | null =
      ProfileStore.getWalletConnectAddressReader(session.accounts[0]);
    const addresses: ReadonlyArray<WalletConnectAddressItem> =
      reader.readAddresses(session.accounts);
    this.onWalletConnectResponse(addresses);
  }

  public async addWithWalletConnect(): Promise<void> {
    const connector = new WalletConnect({
      ...config.walletConnect,
      qrcodeModal: QRCodeModal,
    });

    if (!connector.connected) {
      await connector.createSession();
      // I do not understand this :(
      connector.on("connect", (error, payload) => {
        if (error) {
          toast.show(strings.WALLET_CONNECT_ERROR, ToastType.Error);
        } else {
          this.handleWalletConnectSession(payload);
          // Close the connection
          connector.killSession();
        }
      });
      connector.on("session_update", (error, payload) => {
        if (error) {
          toast.show("Wallet Connect: Error updating session", ToastType.Error);
        } else {
          this.handleWalletConnectSession(payload);
          // Close the connection
          connector.killSession();
        }
      });
      connector.on("disconnect", (error) => {
        if (error) {
          toast.show(
            "Wallet Connect: Did not disconnect cleanly",
            ToastType.Error,
          );
        }
      });
    } else {
      toast.show(
        "Wallet Connect: We don't keep persistent connections but found one",
        ToastType.Error,
      );
    }
  }

  private static createItemForAsset(asset: Asset, address = ""): ResourceInfo {
    return {
      id: asset.symbol,
      address: address,
      asset: asset,
    };
  }

  @action.bound
  private addItemsFromWalletConnect(
    entries: ReadonlyArray<WalletConnectAddressItem>,
  ): void {
    const { resources } = this;
    const newItems: ReadonlyArray<any> = entries
      .map((item: WalletConnectAddressItem): ResourceInfo | null => {
        const { ticker } = item;
        const asset: Asset | undefined = api.getAssetByTicker(ticker);
        if (asset === undefined) {
          console.warn(`chain not found for asset: ${item.ticker}`);
          return null;
        }
        return ProfileStore.createItemForAsset(asset, item.address);
      })
      .filter((target: ResourceInfo | null) => target !== null);
    const assets: ReadonlyArray<string> = entries.map(
      ({ ticker }: WalletConnectAddressItem): string => ticker.toLowerCase(),
    );
    this.setResources([
      // Overwrite existing assets
      ...resources.filter(
        ({ asset: { "starname-uri": uri } }: ResourceInfo): boolean =>
          !assets.includes(uri.toLowerCase()),
      ),
      ...newItems,
    ]);
  }

  private onWalletConnectResponse(
    accounts: ReadonlyArray<WalletConnectAddressItem>,
  ): void {
    const close = modal.show(
      <WalletConnectAssetList
        items={accounts}
        onAddressesSelected={(
          addresses: ReadonlyArray<WalletConnectAddressItem>,
        ): void => {
          this.addItemsFromWalletConnect(addresses);
          // Also should close the modal
          close();
        }}
        onClose={() => close()}
      />,
    );
  }

  public getSocialHandle(type: SocialHandleType): SocialHandle {
    const { socialResources } = this;
    const resource: Resource | undefined = socialResources.find(
      (resource: Resource): boolean => resource.uri === "social:" + type,
    );
    if (resource === undefined) {
      return {
        value: "",
        verified: false,
      };
    } else {
      return {
        value: resource.resource,
        verified: true,
      };
    }
  }

  @action.bound
  public setPreferredAsset(value: string): void {
    this.preferredAsset = value;
  }

  public getNumberOfNeededSignatures(wallet: Wallet): number {
    const { signer } = wallet;
    switch (signer.type) {
      case SignerType.Ledger:
        if (this.photo !== null) {
          return 3;
        } else {
          return 2;
        }
      case SignerType.SeedPhrase:
      case SignerType.ViewOnly:
      case SignerType.Generic:
        return 0;
      case SignerType.Google:
      case SignerType.Keplr:
        return 1;
    }
  }
}

export const ProfileStoreContext = React.createContext<ProfileStore>(
  new ProfileStore(),
);
