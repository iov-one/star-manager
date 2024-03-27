import { StdSignature, StdSignDoc } from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { OfflineSigner } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  createVestingAminoConverters,
} from "@cosmjs/stargate";
import { SigningStargateClient } from "@cosmjs/stargate/build/signingstargateclient";
import { MsgsAndMemo } from "aleph-js";
import api from "api";
import config, { TokenLike } from "config";
import {
  getAllOtherAutoChains,
  getAllSupportedChains,
  getChainSymbol,
} from "config/supportedChains";
import { TxRejected } from "constants/errorCodes";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { FAVORITE_ASSET_URI } from "genericConstants";
import { Task } from "logic/httpClient";
import {
  MsgCreateEscrow,
  MsgRefundEscrow,
  MsgTransferToEscrow,
  MsgUpdateEscrow,
} from "proto/iov/escrow/v1beta1/tx";
import {
  MsgAddAccountCertificate,
  MsgDeleteAccount,
  MsgDeleteAccountCertificate,
  MsgDeleteDomain,
  MsgRegisterAccount,
  MsgRegisterDomain,
  MsgRenewAccount,
  MsgRenewDomain,
  MsgReplaceAccountMetadata,
  MsgReplaceAccountResources,
  MsgTransferAccount,
  MsgTransferDomain,
} from "proto/iov/starname/v1beta1/tx";
import { Signer } from "signers/signer";
import { SignerType } from "signers/signerType";
import { StarnameRegistry, TxType } from "signers/starnameRegistry";
import { AddressGroup } from "types/addressGroup";
import { customStarnameAminoTypes } from "types/aminoTypes";
import { Amount } from "types/amount";
import { IResponsePage } from "types/apiPage";
import { Balance } from "types/balance";
import { StdMap } from "types/map";
import { NameItem } from "types/nameItem";
import { Pager } from "types/pager";
import { PostTxResult } from "types/postTxResult";
import { Resource, ResourceInfo } from "types/resourceInfo";
import { ITransaction as Transaction } from "types/transaction";
import { Tx } from "types/tx";
import { WalletChainConfig } from "types/walletChains";
import { estimateFee } from "utils/estimateFee";

export class Wallet {
  public readonly signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  protected async signAndBroadcast(
    msgsAndMemo: MsgsAndMemo,
  ): Promise<PostTxResult> {
    try {
      const txRaw = await this.signMsgsAndMemo(msgsAndMemo);
      const bytes = Uint8Array.from(TxRaw.encode(txRaw).finish());
      return api.rpcPostTx(bytes);
    } catch (exception: any) {
      if (exception.message !== "Request rejected") {
        throw exception;
      } else {
        return {
          transactionHash: "",
          height: 0,
          code: TxRejected,
          rawLog: "",
          amount: [],
          events: [],
          gas: "",
        };
      }
    }
  }

  private async signWithSigner(
    signer: OfflineSigner,
    msgsAndMemo: MsgsAndMemo,
  ): Promise<TxRaw> {
    const { messages, memo } = msgsAndMemo;
    const address = await this.getAddress();
    const fee = estimateFee(messages);
    const registry = new StarnameRegistry();

    const defaultAminoTypes = {
      ...createAuthzAminoConverters(),
      ...createBankAminoConverters(),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
      ...createStakingAminoConverters(""),
      ...createIbcAminoConverters(),
      ...createFeegrantAminoConverters(),
      ...createVestingAminoConverters(),
    };

    const client = await SigningStargateClient.connectWithSigner(
      config.rpcUrl,
      signer,
      {
        registry,
        aminoTypes: new AminoTypes({
          ...defaultAminoTypes,
          ...customStarnameAminoTypes,
        }),
      },
    );

    return client.sign(address, messages, fee, memo);
  }

  public async signMsgsAndMemo(msgsAndMemo: MsgsAndMemo): Promise<TxRaw> {
    const { signer } = this;
    return this.signWithSigner(signer.getOfflineSigner(), msgsAndMemo);
  }

  public getPublicKey(): Promise<string> {
    const { signer } = this;
    return signer.getPublicKey();
  }

  public async getAddress(): Promise<string> {
    const { signer } = this;
    return signer.getAddress();
  }

  private getSigner(): Signer {
    return this.signer;
  }

  public getBalances(): Task<ReadonlyArray<Balance>> {
    const signer: Signer = this.getSigner();
    const taskContainer: { task: Task<ReadonlyArray<Balance>> | undefined } = {
      task: undefined,
    };

    return {
      run: async (): Promise<ReadonlyArray<Balance>> => {
        const task: Task<ReadonlyArray<Balance>> = api.getBalance(
          await signer.getAddress(),
        );
        taskContainer.task = task;
        // Run parent task now?
        return task.run();
      },
      abort: (): void => {
        const { task } = taskContainer;
        if (task !== undefined) {
          task.abort();
        }
      },
    };
  }

  public getTransactions(
    page: Pager,
  ): Task<StdMap<IResponsePage<Transaction>>> {
    const signer: Signer = this.getSigner();
    const parent: {
      task: Task<StdMap<IResponsePage<Transaction>>> | undefined;
    } = { task: undefined };

    return {
      run: async (): Promise<StdMap<IResponsePage<Transaction>>> => {
        const address: string = await signer.getAddress();
        const task = api.getTransactions(address, page);
        // Export outside the function
        parent.task = task;
        // Run it
        return task.run();
      },
      abort: (): void => {
        const { task } = parent;
        if (task !== undefined) {
          task.abort();
        }
      },
    };
  }
  private static buildPreferredAssetItem(
    preferredAsset: string,
  ): ReadonlyArray<Resource> {
    if (preferredAsset === "") return [];
    return [
      {
        uri: FAVORITE_ASSET_URI,
        resource: preferredAsset,
      },
    ];
  }

  public async replaceDomainResources(
    domain: string,
    targets: ReadonlyArray<ResourceInfo>,
    profile: ReadonlyArray<Resource>,
    preferredAsset: string,
  ): Promise<PostTxResult> {
    const address = await this.getAddress();
    const message: Tx<MsgReplaceAccountResources> = {
      typeUrl: TxType.Starname.ReplaceAccountResources,
      value: {
        domain: domain,
        name: "",
        newResources: [
          ...targets.map(
            ({ asset, address }: ResourceInfo): Resource => ({
              uri: asset["starname-uri"],
              resource: address,
            }),
          ),
          ...Wallet.buildPreferredAssetItem(preferredAsset),
          ...profile,
        ],
        owner: address,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  private sanitizeResources(
    resources: ReadonlyArray<Resource>,
  ): Array<Resource> {
    return resources
      .map((item: Resource): Resource => {
        const value: string = item.resource;
        return {
          uri: item.uri,
          resource: value.trim(),
        };
      })
      .filter(({ resource: value }: Resource): boolean => value !== "");
  }

  public async replaceAccountResources(
    name: string,
    domain: string,
    targets: ReadonlyArray<ResourceInfo>,
    profile: ReadonlyArray<Resource>,
    preferredAsset: string,
  ): Promise<PostTxResult> {
    const address = await this.getAddress();
    const message: Tx<MsgReplaceAccountResources> = {
      typeUrl: TxType.Starname.ReplaceAccountResources,
      value: {
        domain: domain,
        name: name,
        newResources: this.sanitizeResources([
          ...targets.map(
            ({ asset, address }: ResourceInfo): Resource => ({
              uri: asset["starname-uri"],
              resource: address,
            }),
          ),
          ...Wallet.buildPreferredAssetItem(preferredAsset),
          ...profile,
        ]),
        owner: address,
        payer: "",
      },
    };
    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }
  // TODO: maybe decide a fixed object for certificate
  // Ex: {cert: {certifier: {"pub_key": "", ...}, entity: {...}}, signature: ""}
  /**
   *
   * @param name
   * @param domain
   * @param certificate A stringified JSON object
   * @returns PostTxResult
   */
  public async addAccountCertificate(
    name: string,
    domain: string,
    certificate: string,
  ): Promise<PostTxResult> {
    const owner = await this.getAddress();
    const addAccountCertificateMsg: Tx<MsgAddAccountCertificate> = {
      typeUrl: TxType.Starname.AddAccountCertificate,
      value: {
        domain,
        name,
        owner,
        newCertificate: fromBase64(Buffer.from(certificate).toString("base64")),
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [addAccountCertificateMsg],
      memo: "",
    });
  }

  /**
   *
   * @param name
   * @param domain
   * @param b64Certificate - A base64 encoded JSON certificate
   * @returns PostTxResult
   */
  public async deleteAccountCertificate(
    name: string,
    domain: string,
    b64Certificate: string,
  ): Promise<PostTxResult> {
    const owner = await this.getAddress();
    const deleteAccountCertificateMsg: Tx<MsgDeleteAccountCertificate> = {
      typeUrl: TxType.Starname.DeleteAccountCertificate,
      value: {
        name,
        domain,
        deleteCertificate: fromBase64(b64Certificate),
        owner,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [deleteAccountCertificateMsg],
      memo: "",
    });
  }

  public async createEscrow(
    amount: Amount,
    item: NameItem,
    deadline: Date,
  ): Promise<PostTxResult> {
    if (this.getSignerType() === SignerType.Ledger)
      throw new Error("ledger unsupported");
    const address = await this.getAddress();
    const createEscrowMsg: Tx<MsgCreateEscrow> = {
      typeUrl: TxType.Escrow.CreateEscrow,
      value: {
        seller: address,
        feePayer: "",
        price: [...amount.toCoins()],
        deadline: Math.floor(deadline.getTime() / 1000),
        object: NameItem.constructTransferrableObjectFromItem(item),
      },
    };
    return this.signAndBroadcast({
      messages: [createEscrowMsg],
      memo: "",
    });
  }

  public async updateEscrow(
    id: string,
    newAmount: Amount,
    newDeadline: Date,
    newSeller: string,
  ): Promise<PostTxResult> {
    if (this.getSignerType() === SignerType.Ledger)
      throw new Error("ledger unsupported");
    const address = await this.getAddress();
    const updateEscrowMsg: Tx<MsgUpdateEscrow> = {
      typeUrl: TxType.Escrow.UpdateEscrow,
      value: {
        id,
        feePayer: "",
        price: [...newAmount.toCoins()],
        deadline: Math.floor(newDeadline.getTime() / 1000),
        seller: newSeller,
        updater: address,
      },
    };

    return this.signAndBroadcast({
      messages: [updateEscrowMsg],
      memo: "",
    });
  }

  public async transferToEscrow(
    id: string,
    amount: Amount,
  ): Promise<PostTxResult> {
    if (this.getSignerType() === SignerType.Ledger)
      throw new Error("ledger unsupported");

    const address = await this.getAddress();

    const transferToEscrowMsg: Tx<MsgTransferToEscrow> = {
      typeUrl: TxType.Escrow.TransferToEscrow,
      value: {
        id,
        feePayer: "",
        amount: [...amount.toCoins()],
        sender: address,
      },
    };

    return this.signAndBroadcast({
      messages: [transferToEscrowMsg],
      memo: "",
    });
  }

  public async deleteEscrow(id: string): Promise<PostTxResult> {
    if (this.getSignerType() === SignerType.Ledger)
      throw new Error("ledger unsupported");
    const address = await this.getAddress();
    const refundEscrowMsg: Tx<MsgRefundEscrow> = {
      typeUrl: TxType.Escrow.RefundEscrow,
      value: {
        id,
        sender: address,
        feePayer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [refundEscrowMsg],
      memo: "",
    });
  }

  public async registerDomain(
    domain: string,
    type: "closed" | "open" = "closed",
    expired = false,
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const registerDomainMessage: Tx<MsgRegisterDomain> = {
      typeUrl: TxType.Starname.RegisterDomain,
      value: {
        name: domain,
        admin: address,
        domainType: type,
        payer: "",
        broker: api.getBroker(),
      },
    };
    const defaultAssetUri = api.getDefaultAssetURI();
    const resources: Array<Resource> = [
      {
        uri: defaultAssetUri,
        resource: address,
      },
    ];
    try {
      const otherResources = await this.getOtherChainResources();
      resources.push(...otherResources);
    } catch (error) {
      console.warn(error);
    }
    const resourcesMessage: Tx<MsgReplaceAccountResources> = {
      typeUrl: TxType.Starname.ReplaceAccountResources,
      value: {
        name: "",
        domain: domain,
        owner: address,
        payer: "",
        newResources: this.sanitizeResources(resources),
      },
    };

    return this.signAndBroadcast({
      messages: [
        ...(expired
          ? [
              {
                typeUrl: TxType.Starname.DeleteDomain,
                value: {
                  domain: domain,
                  owner: address,
                  payer: "",
                },
              },
            ]
          : []),
        registerDomainMessage,
        resourcesMessage,
      ],
      memo: "",
    });
  }

  public static createResourcesFromAddressGroup = (
    addressGroup: AddressGroup,
    chains: ReadonlyArray<WalletChainConfig>,
  ): Array<Resource> => {
    const resources: Array<Resource> = Object.keys(addressGroup).map(
      (chainId) => {
        const foundChain = chains.find(
          (_chain) => _chain.chainInfo.chainId === chainId,
        );
        if (!foundChain)
          throw new Error(`edge case, no chain with chainId: ${chainId}`);
        return {
          uri: `asset:${getChainSymbol(foundChain).toLowerCase()}`,
          // signers sends it on 0th index
          resource: addressGroup[chainId][0].address,
        };
      },
    );
    return resources;
  };

  public getOtherChainResources = async (
    walletChains = getAllOtherAutoChains(),
  ): Promise<ReadonlyArray<Resource>> => {
    switch (this.getSignerType()) {
      case SignerType.Keplr:
      case SignerType.Google:
      case SignerType.SeedPhrase: {
        // Now request signer to provide addressGroup ( for chains )
        try {
          const addressGroup = await this.signer.getAddressGroup(walletChains);
          const resources = Wallet.createResourcesFromAddressGroup(
            addressGroup,
            walletChains,
          );
          return resources;
        } catch (error) {
          console.warn(error);
        }
        break;
      }
      default:
        return [];
    }
    return [];
  };

  public getCommunitySpecificChain = (
    domain: string,
  ): WalletChainConfig | null => {
    const communityDomainAssetMap = config.basicEditionDomains.community.find(
      (domainAss) => domainAss.domain === domain,
    );
    if (!communityDomainAssetMap) return null;
    const foundChain = getAllSupportedChains().find((chain) => {
      if (communityDomainAssetMap.symbol) {
        return (
          getChainSymbol(chain) === communityDomainAssetMap.symbol.toUpperCase()
        );
      } else return false;
    });
    return foundChain ?? null;
  };

  public async registerAccount(
    name: string,
    domain: string,
    expired = false,
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const chainResources: Array<Resource> = [];
    // Set default resource first
    chainResources.push({
      uri: api.getDefaultAssetURI(),
      resource: address,
    });

    try {
      const communitySpecificChain = this.getCommunitySpecificChain(domain);
      const otherChainResources = await this.getOtherChainResources(
        communitySpecificChain
          ? getAllOtherAutoChains().concat(communitySpecificChain)
          : getAllOtherAutoChains(),
      );
      chainResources.push(...otherChainResources);
    } catch (error) {
      console.warn("Failure getting otherChainResources");
    }
    const registerAccountMsg: Tx<MsgRegisterAccount> = {
      typeUrl: TxType.Starname.RegisterAccount,
      value: {
        domain: domain,
        name: name,
        owner: address,
        registerer: address,
        resources: chainResources,
        broker: api.getBroker(),
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [
        ...(expired
          ? [
              {
                typeUrl: TxType.Starname.DeleteAccount,
                value: {
                  domain,
                  name,
                  owner: address,
                  payer: "",
                },
              },
            ]
          : []),
        registerAccountMsg,
      ],
      memo: "",
    });
  }

  /**
   *
   * @param domain
   * @param recipient
   * @param flag 0 - wipes everything, 1 - update accounts owned by prev admin with new admin and rest unchanged, 2 - unchanged
   * @returns
   */
  public async transferDomain(
    domain: string,
    recipient: string,
    flag: 0 | 1 | 2 = 0,
  ): Promise<PostTxResult> {
    const message: Tx<MsgTransferDomain> = {
      typeUrl: TxType.Starname.TransferDomain,
      value: {
        domain: domain,
        owner: await this.getAddress(),
        newAdmin: recipient,
        transferFlag: flag,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  public async transferAccount(
    name: string,
    domain: string,
    recipient: string,
    reset = true,
  ): Promise<PostTxResult> {
    const address = await this.getAddress();
    const message: Tx<MsgTransferAccount> = {
      typeUrl: TxType.Starname.TransferAccount,
      value: {
        name: name,
        domain: domain,
        owner: address,
        newOwner: recipient,
        reset,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  public async deleteDomain(domain: string): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const message: Tx<MsgDeleteDomain> = {
      typeUrl: TxType.Starname.DeleteDomain,
      value: {
        domain: domain,
        owner: address,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  public async deleteAccount(
    name: string,
    domain: string,
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const message: Tx<MsgDeleteAccount> = {
      typeUrl: TxType.Starname.DeleteAccount,
      value: {
        name: name,
        domain: domain,
        owner: address,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  public async renewDomain(domain: string): Promise<PostTxResult> {
    const message: Tx<MsgRenewDomain> = {
      typeUrl: TxType.Starname.RenewDomain,
      value: {
        domain: domain,
        signer: await this.getAddress(),
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  public async renewAccount(
    name: string,
    domain: string,
  ): Promise<PostTxResult> {
    const address = await this.getAddress();
    const message: Tx<MsgRenewAccount> = {
      typeUrl: TxType.Starname.RenewAccount,
      value: {
        domain: domain,
        name: name,
        signer: address,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  public async delegateAmount(
    validatorAddress: string,
    amount: Amount,
    memo = "",
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const message: Tx<MsgDelegate> = {
      typeUrl: TxType.Staking.Delegate,
      value: {
        delegatorAddress: address,
        validatorAddress: validatorAddress,
        amount: amount.toCoins()[0],
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: memo,
    });
  }

  public async unDelegateAmount(
    validatorAddress: string,
    amount: Amount,
    memo = "",
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const message: Tx<MsgUndelegate> = {
      typeUrl: TxType.Staking.Undelegate,
      value: {
        delegatorAddress: address,
        validatorAddress: validatorAddress,
        amount: amount.toCoins()[0],
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: memo,
    });
  }

  public async redelegateAmount(
    validatorSource: string,
    validatorDestination: string,
    amount: Amount,
    memo = "",
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const message: Tx<MsgBeginRedelegate> = {
      typeUrl: TxType.Staking.BeginRedelegate,
      value: {
        delegatorAddress: address,
        validatorSrcAddress: validatorSource,
        validatorDstAddress: validatorDestination,
        amount: amount.toCoins()[0],
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: memo,
    });
  }

  public async claimReward(
    validatorAddresses: ReadonlyArray<string>,
    memo = "",
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const composeMessage = (
      validatorAddr: string,
    ): Tx<MsgWithdrawDelegatorReward> => {
      return {
        typeUrl: TxType.Distribution.WithdrawDelegatorReward,
        value: {
          delegatorAddress: address,
          validatorAddress: validatorAddr,
        },
      };
    };

    return this.signAndBroadcast({
      messages: validatorAddresses.map(composeMessage),
      memo,
    });
  }

  public async sendPayment(
    token: TokenLike,
    recipient: string,
    amount: number,
    memo = "",
  ): Promise<PostTxResult> {
    const address: string = await this.getAddress();
    const uiov: number = amount * token.subunitsPerUnit;
    const message: Tx<MsgSend> = {
      typeUrl: TxType.Bank.Send,
      value: {
        fromAddress: address,
        toAddress: recipient,
        amount: [
          {
            amount: uiov.toFixed(0),
            denom: token.subunitName,
          },
        ],
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: memo,
    });
  }

  public async setMetadataURI(
    name: string,
    domain: string,
    uri: string | null,
  ): Promise<PostTxResult> {
    const address = await this.getAddress();
    const message: Tx<MsgReplaceAccountMetadata> = {
      typeUrl: TxType.Starname.ReplaceAccountMetadata,
      value: {
        domain: domain,
        name: name,
        newMetadataUri: uri !== null ? uri : "",
        owner: address,
        payer: "",
      },
    };

    return this.signAndBroadcast({
      messages: [message],
      memo: "",
    });
  }

  public getSignerType(): SignerType {
    const { signer } = this;
    return signer.type;
  }

  public async signAlephMessage(signDoc: StdSignDoc): Promise<StdSignature> {
    const { signer } = this;
    const response = await signer.signAlephMessage(
      await this.getAddress(),
      signDoc,
    );

    return response.signature;
  }
}
