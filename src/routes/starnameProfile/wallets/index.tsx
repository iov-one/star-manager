import {
  calculateFee,
  GasPrice,
  isDeliverTxFailure,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import assets, { Asset } from "@iov/asset-directory";
import { Keplr } from "@keplr-wallet/types";
import detectEthereumProvider from "@metamask/detect-provider";
import keplrLogo from "assets/keplr-on.svg";
import metamaskFox from "assets/metamask-fox.svg";
import myDogeLogo from "assets/mydoge.png";
import { utils } from "ethers";
import { PaymentWallets } from "types/paymentWallets";

import bitpayIcon from "../../../assets/starnameProfile/Icons/bitpay-mark-round.svg";
import { cosmosTokens } from "./cosmosTokens";
import erc20Abi from "./erc20.abi.json";
import { erc20Tokens } from "./erc20tokens";

export interface WalletUri {
  readonly name: string;
  readonly label: string;
  readonly isAvailableForAsset: (asset: string) => boolean;
  readonly link: (
    asset: string,
    address: string,
    amount: number,
    starname: string,
  ) => string | Promise<void | string>;
  readonly icon: string;
}

declare global {
  interface Window {
    readonly keplr: any;
    readonly getOfflineSigner: (chainId: string) => any;
  }
}

const getTrustwalletId = (assetName: string): string => {
  const foundAsset: Asset | undefined = assets.find((asset: Asset): boolean => {
    const { symbol } = asset;
    return symbol.toLowerCase() === assetName.toLowerCase();
  });
  if (foundAsset && foundAsset["trustwallet-uid"]) {
    return "&asset=" + foundAsset["trustwallet-uid"];
  } else {
    return "";
  }
};

const trustWallet: WalletUri = {
  name: PaymentWallets.TrustWallet,
  label: "Trust Wallet",
  isAvailableForAsset: (asset: string): boolean => !!getTrustwalletId(asset),
  link: (asset: string, address: string, amount: number): string =>
    `https://link.trustwallet.com/send?address=${address}${getTrustwalletId(
      asset,
    )}&amount=${amount}`,
  icon: "https://gblobscdn.gitbook.com/spaces%2F-LeGDgApX5LA1FGVGo-z%2Favatar.png?alt=media",
};

const bitPay: WalletUri = {
  name: PaymentWallets.BitPay,
  label: "bitpay",
  isAvailableForAsset: (asset: string): boolean =>
    asset === "btc" || asset === "eth",
  link: (asset: string, address: string, amount: number): string =>
    `bitpay:${address}?coin=${asset.toUpperCase()}&amount=${amount}`,
  icon: bitpayIcon,
};

const myDoge: WalletUri = {
  name: PaymentWallets.MyDoge,
  label: "MyDoge Wallet",
  isAvailableForAsset: (asset: string): boolean => asset === "doge",
  link: (
    _asset: string,
    address: string,
    amount: number,
    starname: string,
  ): string =>
    `dogecoin:${address}?amount=${amount}&label=${starname}&message=For ${starname}`,
  icon: myDogeLogo,
};

const paytomat: WalletUri = {
  name: PaymentWallets.PayTomat,
  label: "PAYTOMAT",
  isAvailableForAsset: (asset: string): boolean =>
    asset === "btc" || asset === "eth",
  link: (asset: string, address: string, amount: number): string =>
    `paytomat:?coin=${asset.toUpperCase()}&address=${address}&amount=${amount}`,
  icon: "https://paytomat.com/assets/img/favicons/favicon_96x96.png",
};

const meta: WalletUri = {
  name: PaymentWallets.MetaMask,
  label: "Metamask",
  isAvailableForAsset: (asset: string): boolean => {
    return asset === "eth" || asset in erc20Tokens;
  },
  link: async (
    asset: string,
    address: string,
    amount: number,
  ): Promise<void> => {
    const provider: any = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    if (!provider) throw new Error("could not initialize metamask");
    if (!provider.isConnected()) throw new Error("metamask is not connected");
    await provider.request({
      method: "eth_requestAccounts",
    });
    const web3Provider = new Web3Provider(provider);
    const signer = web3Provider.getSigner();
    if (asset === "eth") {
      const ethAmount = utils.parseEther(amount.toString());
      await web3Provider.send("eth_sendTransaction", [
        {
          from: provider.selectedAddress,
          to: address,
          value: ethAmount.toHexString(),
        },
      ]);
    } else {
      // Because we are only showing the button if the asset is in
      // the erc20Tokens map, we don't fear it not being there
      const contractAddress: string = erc20Tokens[asset];
      const contract = new Contract(contractAddress, erc20Abi, signer);
      const decimals: number = await (async (): Promise<number> => {
        try {
          return contract.decimals();
        } catch {
          // Could mean that the contract was not found or invalid
          return 0;
        }
      })();
      const amountInSmallestUnit = utils.parseUnits(
        amount.toString(),
        decimals,
      );
      contract.transfer(address, amountInSmallestUnit);
    }
  },
  icon: metamaskFox,
};

const keplr: WalletUri = {
  name: PaymentWallets.Keplr,
  label: "Keplr",
  isAvailableForAsset: (asset: string): boolean =>
    cosmosTokens[asset] !== undefined,
  link: async (
    asset: string,
    address: string,
    amount: number,
  ): Promise<void | string> => {
    if (!window.getOfflineSigner || !window.keplr) {
      // keplr not installed
      return Promise.reject(new Error("Keplr extension is not installed"));
    } else {
      const chainInfo = cosmosTokens[asset];
      const { keplr }: { keplr: Keplr } = window;
      await keplr.enable(chainInfo.chainId);
      const offlineSigner = keplr.getOfflineSigner(chainInfo.chainId);
      const accounts = await offlineSigner.getAccounts();
      const account = accounts[0];
      const client = await SigningStargateClient.connectWithSigner(
        chainInfo.rpc,
        offlineSigner,
      );
      const txResponse = await client.sendTokens(
        account.address,
        address,
        [
          {
            denom: chainInfo.currencies[0].coinMinimalDenom,
            amount: Math.round(
              amount * Math.pow(10, chainInfo.currencies[0].coinDecimals),
            ).toString(),
          },
        ],
        calculateFee(
          200000,
          GasPrice.fromString(
            `2${chainInfo.feeCurrencies[0].coinMinimalDenom}`,
          ),
        ),
      );
      if (isDeliverTxFailure(txResponse)) {
        return Promise.reject(new Error(txResponse.rawLog));
      } else {
        return Promise.resolve(txResponse.transactionHash);
      }
    }
  },
  icon: keplrLogo,
};

// const terra: WalletUri = {
//   name: PaymentWallets.Terra,
//   icon: "https://lh3.googleusercontent.com/sDakRf5fEv5g7llLBlmHJQtUuyym7IWBdtZC3hJnr1d1vocEdN43OYci6zV62mpfjRWSofW1tuzDYettqHEK5xpl=w128-h128-e365-rj-sc0x00ffffff",
//   label: "Terra Station (Beta)",
//   isAvailableForAsset: (asset: string) => asset === "ust" || asset === "luna",
//   link: (): Promise<string | void> => {
//     throw new Error("implemented internally");
//   },
// };

const wallets: {
  readonly mobile: ReadonlyArray<WalletUri>;
  readonly desktop: ReadonlyArray<WalletUri>;
} = {
  mobile: [trustWallet, bitPay, paytomat, myDoge],
  desktop: [trustWallet, meta, keplr],
};
export default wallets;
