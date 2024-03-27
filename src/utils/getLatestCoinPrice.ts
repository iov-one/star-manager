const getLatestCoinPrice = async (
  coinGeckoId = "starname",
  fiatCurrency = "usd",
): Promise<number> => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=${fiatCurrency}`,
  );
  const data = await response.json();
  return data[coinGeckoId][fiatCurrency];
};

export default getLatestCoinPrice;
