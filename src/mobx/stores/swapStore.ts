import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import detectEthereumProvider from "@metamask/detect-provider";
import MetaMaskOnboarding from "@metamask/onboarding";
import config from "config";
import erc20Abi from "contracts/erc20.abi.json";
import swapAbi from "contracts/swap.abi.json";
import { BigNumber, Signer, utils } from "ethers";
import { action, computed, observable } from "mobx";
import { getEthGasPriceForFastTransactions } from "utils/getEthGasPriceForFastTransactions";

import { AddressRegex, AddressResolver } from "./addressResolver";

const decimalSeparator = (0)
  .toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })
  .slice(-2, -1);

export enum SwapStatus {
  MetamaskNotInstalled = 1,
  MetamaskNotConnected = 2,
  CannotUseNetworkError = 4,
  NormalOperation = 8,
  Connecting = 16,
  Sending = 32,
  ChangingNetwork = 64,
  ChangingAccount = 128,
  FatalError = 256,
}

export class SwapStore extends AddressResolver {
  @observable amount = "";
  @observable tokenSymbol = "";
  @observable status = SwapStatus.MetamaskNotInstalled;

  private tokenContract: Contract | null = null;
  private swapContract: Contract | null = null;
  private account = "";
  private decimals = 18;
  private web3Provider: Web3Provider | null = null;
  private provider: any = null;

  constructor() {
    super();
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      this.setStatus(SwapStatus.MetamaskNotConnected);
      detectEthereumProvider({
        mustBeMetaMask: true,
      })
        .then((provider: any): Promise<void> => {
          // This is also a async method
          return this.setProvider(provider);
        })
        .then((): void => {});
    } else {
      this.setStatus(SwapStatus.MetamaskNotInstalled);
    }
  }

  @computed
  public get readyToSend(): boolean {
    const { address, amount } = this;
    if (!this.isValidNumber(amount)) return false;
    return AddressRegex.test(address);
  }

  @action.bound
  private setStatus(status: SwapStatus): void {
    this.status = status;
  }

  // These needs to be bound
  private onAccountsChanged = (accounts: ReadonlyArray<string>): void => {
    this.setStatus(this.status | SwapStatus.ChangingAccount);
    this.setAccounts(accounts)
      .catch((error: SwapStatus): void => {
        this.setStatus(this.status | error);
      })
      .finally((): void => {
        this.setStatus(this.status & ~SwapStatus.ChangingAccount);
      });
  };

  private onChainChanged = (chainId: string): void => {
    this.setStatus(this.status | SwapStatus.ChangingNetwork);
    this.setNetwork(Number(chainId))
      .then((): Promise<void> => this.connect())
      .catch((): void => {
        this.setStatus(this.status | SwapStatus.CannotUseNetworkError);
      })
      .finally((): void => {
        this.setStatus(this.status & ~SwapStatus.ChangingNetwork);
      });
  };

  @action.bound
  private async setProvider(provider: any): Promise<void> {
    this.provider = provider;
    // If it's null no further initialization is required
    if (provider === null) throw new Error("provider shall not be null");
    if (provider.isConnected()) {
      provider.on("accountsChanged", this.onAccountsChanged);
      provider.on("chainChanged", this.onChainChanged);
      const accounts: ReadonlyArray<string> = await provider.request({
        method: "eth_accounts",
      });
      try {
        // First setup the network
        await this.setNetwork(Number(provider.chainId));
        await this.setAccounts(accounts);
        // We got to the connected status
        this.setStatus(this.status & ~SwapStatus.MetamaskNotConnected);
      } catch (error: any) {
        this.setStatus(this.status | error);
      }
    } else {
      this.account = "";
    }
  }

  private async createSwapContract(provider: Signer): Promise<Contract> {
    const address: string = config.swapSmartContractAddress;
    return new Contract(address, swapAbi, provider);
  }

  private async createTokenContract(provider: Signer): Promise<Contract> {
    const { swapContract } = this;
    if (swapContract === null) throw new Error("swap contract not ready");
    const address: string = await swapContract.erc20ContractAddress();
    return new Contract(address, erc20Abi, provider);
  }

  private async setNetwork(chainId: number | null): Promise<void> {
    try {
      this.setStatus(this.status | SwapStatus.ChangingNetwork);
      if (chainId === null || chainId !== config.ethChainId) {
        throw SwapStatus.CannotUseNetworkError;
      }
      const web3Provider: Web3Provider = new Web3Provider(this.provider);
      // Create the contracts
      this.swapContract = await this.createSwapContract(
        web3Provider.getSigner(),
      );
      this.tokenContract = await this.createTokenContract(
        web3Provider.getSigner(),
      );
      this.web3Provider = web3Provider;
    } finally {
      this.setStatus(this.status & ~SwapStatus.ChangingNetwork);
    }
  }

  @action.bound
  private async setAccounts(accounts: ReadonlyArray<string>): Promise<void> {
    const { tokenContract } = this;
    if (accounts.length === 1 && tokenContract !== null) {
      this.tokenSymbol = await tokenContract.symbol();
      this.account = accounts[0];
      this.decimals = await tokenContract.decimals();
      // TODO: use allowance to set a maximum value
      //       for the input
      this.setStatus(SwapStatus.NormalOperation);
    } else {
      throw SwapStatus.MetamaskNotConnected;
    }
  }

  @action.bound
  private reset(): void {
    this.swapContract = null;
    this.tokenContract = null;
    this.tokenSymbol = "";
    this.account = "";
    this.decimals = 18;
    this.status = SwapStatus.MetamaskNotInstalled;
  }

  @action.bound
  public async connect(): Promise<void> {
    const { provider } = this;
    if (provider !== null) {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      return this.setAccounts(accounts);
    }
  }

  @action.bound
  public setAmount(amount: string): void {
    this.amount = amount;
  }

  private async checkAllowance(
    swapContract: Contract,
    tokenContract: Contract,
  ): Promise<void> {
    try {
      const allowance: BigNumber = await tokenContract.allowance(
        this.account,
        swapContract.address,
      );
      if (allowance.eq(BigNumber.from(0))) {
        await tokenContract.approve(
          swapContract.address,
          await tokenContract.totalSupply(),
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-throw-literal
      throw { code: 5001 };
    }
  }

  @action.bound
  public async sendTokens(): Promise<void> {
    this.setStatus(this.status | SwapStatus.Sending);
    // We must have some allowance
    try {
      const {
        swapContract,
        tokenContract,
        amount: originalAmount,
        decimals,
        web3Provider,
      } = this;
      if (
        tokenContract === null ||
        swapContract === null ||
        web3Provider === null
      ) {
        throw new Error("store not initialized, this should never happen");
      }
      await this.checkAllowance(swapContract, tokenContract);
      // Now try to send
      const amount: BigNumber = utils.parseUnits(
        originalAmount.replace(decimalSeparator, "."),
        decimals,
      );
      // Estimate gas
      const estimatedGas: BigNumber =
        await swapContract.estimateGas.logSendMemo(amount, this.address);
      await swapContract.logSendMemo(amount, this.address, {
        gasLimit: estimatedGas.gt(90000) ? 90000 : estimatedGas,
        gasPrice: await getEthGasPriceForFastTransactions(),
      });
    } finally {
      this.setStatus(this.status & ~SwapStatus.Sending);
    }
  }

  public toNumber(value: string): number {
    const { decimals } = this;
    const [integer, decimal] = value.split(decimalSeparator);
    if (decimal !== undefined && decimal.length > decimals) {
      return Number("nan");
    } else if (decimal === undefined) {
      return Number(integer);
    } else {
      return Number(integer + "." + decimal);
    }
  }

  public isValidNumber(value: string): boolean {
    const trimmed: string = value.trim();
    if (trimmed === "") return false;
    return !isNaN(this.toNumber(trimmed));
  }

  public static localizeAmount(value: string): string {
    return value.replace(".", decimalSeparator);
  }

  public static expectedNetworkName(): string {
    switch (config.ethChainId) {
      case 1:
        return "Main";
      case 4:
        return "Rinkeby";
      default:
        throw new Error(
          "please check the config as only the mainnet and rinkeby are supported",
        );
    }
  }

  @action.bound
  public resetSendForm(): void {
    this.address = "";
    this.addressOrStarname = "";
    this.amount = "";
  }
}

export default new SwapStore();
