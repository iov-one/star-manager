import api from "api";

const apiBase = "https://api.coingecko.com/api/v3";

export interface CoinGeckoCoin {
  id: string;
  name: string;
  symbol: string;
}

interface CurrentPrice {
  usd: string;
}

interface CoinGeckoMarketPrice {
  market_data: {
    current_price: CurrentPrice;
  };
}

interface SimpleCoinGeckoConversionResult {
  [key: string]: {
    [key: string]: number;
  };
}

const getCoinGeckoCoin = (
  coins: ReadonlyArray<CoinGeckoCoin>,
  symbol: string,
): CoinGeckoCoin | undefined => {
  if (coins.length === 0) {
    return undefined;
  }
  const asset = api.getAssetByTicker(symbol);
  if (!asset) return undefined;
  if (!asset.coingeckoId) return undefined;
  return coins.find((_coin) => _coin.id === asset.coingeckoId);
};

const toQueryString = (object: any): string => {
  const entries: ReadonlyArray<[string, any]> = Object.entries(object);
  return (
    "?" +
    entries
      .map(([key, value]: [string, any]): string => key + "=" + value)
      .join("&")
  );
};

export interface Task<T> {
  execute(): Promise<T>;
  abort(): void;
}

const get = <T>(url: string): Task<T> => {
  const controller = new AbortController();
  const signal: AbortSignal = controller.signal;
  const request = new Request(url, { signal });
  return {
    execute: async (): Promise<T> => {
      const response: Response = await fetch(request);
      return response.json();
    },
    abort: (): void => controller.abort(),
  };
};

export const getCoinsList = (): Task<ReadonlyArray<CoinGeckoCoin>> => {
  return get(apiBase + "/coins/list");
};

export const getConversionCoinGeckoPrice = (
  list: ReadonlyArray<CoinGeckoCoin>,
  symbol: string,
  fiat: string,
): Task<number> => {
  if (list.length === 0) {
    return {
      execute: async (): Promise<number> => 0,
      abort: (): void => undefined,
    };
  }
  const coinGeckoCoin: CoinGeckoCoin | undefined = getCoinGeckoCoin(
    list,
    symbol,
  );
  if (coinGeckoCoin !== undefined) {
    const options = {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: true,
      developer_data: false,
      sparkline: false,
    };
    const url = apiBase + "/coins/" + coinGeckoCoin.id + toQueryString(options);
    const task: Task<CoinGeckoMarketPrice> = get(url);
    return {
      execute: async (): Promise<number> => {
        const price: CoinGeckoMarketPrice = await task.execute();
        // Make it nice to look at ;)
        const { market_data } = price;
        // Extract the one we're interested in
        return +market_data.current_price[
          fiat.toLowerCase() as keyof CurrentPrice
        ];
      },
      abort: (): void => {
        task.abort();
      },
    };
  } else {
    // FIXME: what?
    return {
      execute: (): Promise<number> => {
        return new Promise((resolve, reject) => {
          void resolve;
          reject("Unable to fetch for this coin.");
        });
      },
      abort: (): void => undefined,
    };
  }
};

export const getSimpleConversionPrice = (
  coinGeckoId = "starname",
  vsCurrencies = ["usd"],
): Task<SimpleCoinGeckoConversionResult> => {
  return get<SimpleCoinGeckoConversionResult>(
    apiBase +
      `/simple/price?ids=${coinGeckoId}&vs_currencies=${vsCurrencies.join()}`,
  );
};
