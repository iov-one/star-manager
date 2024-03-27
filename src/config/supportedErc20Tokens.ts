import { Erc20Token } from "types/erc20Token";

const SUPPORTED_ERC20_TOKENS: ReadonlyArray<Erc20Token> = [
  {
    symbol: "ALEPH",
    contractAddress: "0x27702a26126e0B3702af63Ee09aC4d1A084EF628",
  },
  {
    symbol: "BAT",
    contractAddress: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
  },
  {
    symbol: "BNB",
    contractAddress: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  },
  {
    symbol: "COMP",
    contractAddress: "0xc00e94cb662c3520282e6f5717214004a7f26888",
  },
  {
    symbol: "DAI",
    contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  {
    symbol: "EOS",
    contractAddress: "0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0",
  },
  {
    symbol: "LINK",
    contractAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
  },
  {
    symbol: "OKB",
    contractAddress: "0x75231f58b43240c9718dd58b4967c5114342a86c",
  },
  {
    symbol: "REN",
    contractAddress: "0x408e41876cccdc0f92210600ef50372656052a38",
  },
  {
    symbol: "REQ",
    contractAddress: "0x8f8221afbb33998d8584a2b05749ba73c37a938a",
  },
  {
    symbol: "SHIB",
    contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  },
  {
    symbol: "TRX",
    contractAddress: "0xe1be5d3f34e89de342ee97e6e90d405884da6c67",
  },
  {
    symbol: "USDC",
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  {
    symbol: "USDT",
    contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  },
  {
    symbol: "WBTC",
    contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  },
];

export default SUPPORTED_ERC20_TOKENS;
