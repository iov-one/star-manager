import config from "config";
import { BigNumber, utils } from "ethers";
import { toQueryString } from "utils/queryString";

interface GasPrice {
  readonly result: {
    readonly FastGasPrice: string;
  };
}

const URL =
  config.etherscanAPIUrl +
  "?" +
  toQueryString({
    module: "gastracker",
    action: "gasoracle",
    apikey: config.etherscanAPIKey,
  });
export const getEthGasPriceForFastTransactions =
  async (): Promise<BigNumber> => {
    const response: Response = await fetch(URL);
    const data: GasPrice = await response.json();
    const { result } = data;
    return utils.parseUnits(result.FastGasPrice, "gwei");
  };
