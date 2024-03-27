import { Bech32Address } from "@keplr-wallet/cosmos";
import config from "config";
import { WalletChainConfig } from "types/walletChains";

const defaultChain = {
  native: true,
  txExplorer: "https://www.mintscan.io/starname/txs/{txHash}",
  chainInfo: {
    rpc: "https://rpc-iov.keplr.app",
    rest: "https://lcd-iov.keplr.app",
    chainId: "iov-mainnet-ibc",
    chainName: "Starname",
    stakeCurrency: {
      coinDenom: "IOV",
      coinMinimalDenom: "uiov",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 234,
    },
    bech32Config: Bech32Address.defaultBech32Config("star"),
    currencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
      },
    ],
    features: ["ibc-transfer"],
  },
};

const SUPPORTED_OTHER_WALLET_CHAINS: ReadonlyArray<WalletChainConfig> = [
  {
    native: true,
    txExplorer: "https://www.mintscan.io/osmosis/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/osmosis",
      rest: "https://lcd-osmosis.keplr.app",
      chainId: "osmosis-1",
      chainName: "Osmosis",
      stakeCurrency: {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("osmo"),
      currencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
        },
        {
          coinDenom: "ION",
          coinMinimalDenom: "uion",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0,
            average: 0,
            high: 0.025,
          },
        },
      ],
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/akash/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/akash",
      rest: "https://lcd-akash.keplr.app",
      chainId: "akashnet-2",
      chainName: "Akash",
      stakeCurrency: {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("akash"),
      currencies: [
        {
          coinDenom: "AKT",
          coinMinimalDenom: "uakt",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "AKT",
          coinMinimalDenom: "uakt",
          coinDecimals: 6,
        },
      ],
      coinType: 118,
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/crypto-org/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/cryptoorgchain",
      rest: "https://lcd-crypto-org.keplr.app/",
      chainId: "crypto-org-chain-mainnet-1",
      chainName: "Crypto.org",
      stakeCurrency: {
        coinDenom: "CRO",
        coinMinimalDenom: "basecro",
        coinDecimals: 8,
      },
      bip44: {
        coinType: 394,
      },
      bech32Config: Bech32Address.defaultBech32Config("cro"),
      currencies: [
        {
          coinDenom: "CRO",
          coinMinimalDenom: "basecro",
          coinDecimals: 8,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "CRO",
          coinMinimalDenom: "basecro",
          coinDecimals: 8,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/cosmos/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/cosmoshub",
      rest: "https://lcd-cosmoshub.keplr.app",
      chainId: "cosmoshub-4",
      chainName: "Cosmos Hub",
      stakeCurrency: {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("cosmos"),
      currencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        },
      ],
      coinType: 118,
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    native: true,
    txExplorer: "https://regen.aneka.io/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/regen",
      rest: "https://lcd-regen.keplr.app",
      chainId: "regen-1",
      chainName: "Regen Network",
      stakeCurrency: {
        coinDenom: "REGEN",
        coinMinimalDenom: "uregen",
        coinDecimals: 6,
      },
      bip44: { coinType: 118 },
      bech32Config: Bech32Address.defaultBech32Config("regen"),
      currencies: [
        {
          coinDenom: "REGEN",
          coinMinimalDenom: "uregen",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "REGEN",
          coinMinimalDenom: "uregen",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/persistence/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/persistence",
      rest: "https://lcd-persistence.keplr.app",
      chainId: "core-1",
      chainName: "Persistence",
      stakeCurrency: {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 750,
      },
      bech32Config: Bech32Address.defaultBech32Config("persistence"),
      currencies: [
        {
          coinDenom: "XPRT",
          coinMinimalDenom: "uxprt",
          coinDecimals: 6,
        },
        {
          coinDenom: "PSTAKE",
          coinMinimalDenom:
            "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
          coinDecimals: 18,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "XPRT",
          coinMinimalDenom: "uxprt",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/sentinel/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/sentinel",
      rest: "https://lcd-sentinel.keplr.app",
      chainId: "sentinelhub-2",
      chainName: "Sentinel",
      stakeCurrency: {
        coinDenom: "DVPN",
        coinMinimalDenom: "udvpn",
        coinDecimals: 6,
      },
      bip44: { coinType: 118 },
      bech32Config: Bech32Address.defaultBech32Config("sent"),
      currencies: [
        {
          coinDenom: "DVPN",
          coinMinimalDenom: "udvpn",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "DVPN",
          coinMinimalDenom: "udvpn",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/iris/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/irisnet",
      rest: "https://lcd-iris.keplr.app",
      chainId: "irishub-1",
      chainName: "IRISnet",
      stakeCurrency: {
        coinDenom: "IRIS",
        coinMinimalDenom: "uiris",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("iaa"),
      currencies: [
        {
          coinDenom: "IRIS",
          coinMinimalDenom: "uiris",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "IRIS",
          coinMinimalDenom: "uiris",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/sifchain/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/sifchain",
      rest: "https://api-int.sifchain.finance",
      chainId: "sifchain-1",
      chainName: "Sifchain",
      stakeCurrency: {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("sif"),
      currencies: [
        {
          coinDenom: "ROWAN",
          coinMinimalDenom: "rowan",
          coinDecimals: 18,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "ROWAN",
          coinMinimalDenom: "rowan",
          coinDecimals: 18,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer:
      "https://secretnodes.com/secret/chains/secret-4/transactions/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/secretnetwork",
      rest: "https://lcd-secret.keplr.app",
      chainId: "secret-4",
      chainName: "Secret Network",
      stakeCurrency: {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 529,
      },
      bech32Config: Bech32Address.defaultBech32Config("secret"),
      currencies: [
        {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
        },
      ],
      coinType: 118,
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/kava/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/kava",
      rest: "https://api.data.kava.io",
      chainId: "kava_2222-10",
      chainName: "Kava",
      stakeCurrency: {
        coinDenom: "KAVA",
        coinMinimalDenom: "ukava",
        coinDecimals: 6,
      },
      bip44: { coinType: 459 },
      alternativeBIP44s: [{ coinType: 118 }],
      bech32Config: Bech32Address.defaultBech32Config("kava"),
      currencies: [
        {
          coinDenom: "KAVA",
          coinMinimalDenom: "ukava",
          coinDecimals: 6,
        },
        {
          coinDenom: "SWP",
          coinMinimalDenom: "swp",
          coinDecimals: 6,
        },
        {
          coinDenom: "USDX",
          coinMinimalDenom: "usdx",
          coinDecimals: 6,
        },
        {
          coinDenom: "HARD",
          coinMinimalDenom: "hard",
          coinDecimals: 6,
        },
        {
          coinDenom: "BNB",
          coinMinimalDenom: "bnb",
          coinDecimals: 8,
        },
        {
          coinDenom: "BTCB",
          coinMinimalDenom: "btcb",
          coinDecimals: 8,
        },
        {
          coinDenom: "BUSD",
          coinMinimalDenom: "busd",
          coinDecimals: 8,
        },
        {
          coinDenom: "XRPB",
          coinMinimalDenom: "xrpb",
          coinDecimals: 8,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "KAVA",
          coinMinimalDenom: "ukava",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0,
            average: 0.001,
            high: 0.25,
          },
        },
      ],
      coinType: 459,
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/certik/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/shentu",
      rest: "https://azuredragon.noopsbycertik.com",
      chainId: "shentu-2.2",
      chainName: "Certik",
      stakeCurrency: {
        coinDenom: "CTK",
        coinMinimalDenom: "uctk",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("certik"),
      currencies: [
        {
          coinDenom: "CTK",
          coinMinimalDenom: "uctk",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "CTK",
          coinMinimalDenom: "uctk",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer", "ibc-go"],
    },
  },
  {
    native: false,
    txExplorer: "https://www.mintscan.io/bitcanna/txs/{txHash}",
    chainInfo: {
      chainId: "bitcanna-1",
      chainName: "Bitcanna mainnet",
      rpc: "https://rpc.cosmos.directory/bitcanna",
      rest: "https://lcd.bitcanna.io",
      stakeCurrency: {
        coinDenom: "BCNA",
        coinMinimalDenom: "ubcna",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("bcna"),
      currencies: [
        {
          coinDenom: "BCNA",
          coinMinimalDenom: "ubcna",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "BCNA",
          coinMinimalDenom: "ubcna",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      coinType: 118,
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/juno/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/juno",
      rest: "https://lcd-juno.keplr.app",
      chainId: "juno-1",
      chainName: "Juno",
      stakeCurrency: {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("juno"),
      currencies: [
        {
          coinDenom: "JUNO",
          coinMinimalDenom: "ujuno",
          coinDecimals: 6,
        },
        {
          type: "cw20",
          contractAddress:
            "juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
          coinDenom: "NETA",
          coinMinimalDenom:
            "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr:NETA",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "JUNO",
          coinMinimalDenom: "ujuno",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: false,
    txExplorer: "https://www.mintscan.io/bitsong/txs/{txHash}",
    chainInfo: {
      chainId: "bitsong-2b",
      chainName: "BitSong Mainnet",
      rpc: "https://rpc.cosmos.directory/bitsong",
      rest: "https://lcd.explorebitsong.com",
      stakeCurrency: {
        coinDenom: "BTSG",
        coinMinimalDenom: "ubtsg",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 639,
      },
      bech32Config: Bech32Address.defaultBech32Config("bitsong"),
      currencies: [
        {
          coinDenom: "BTSG",
          coinMinimalDenom: "ubtsg",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "BTSG",
          coinMinimalDenom: "ubtsg",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      coinType: 639,
      features: ["ibc-transfer"],
    },
  },
  {
    native: false,
    txExplorer: "https://www.mintscan.io/chihuahua/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/chihuahua",
      rest: "https://api.chihuahua.wtf",
      chainId: "chihuahua-1",
      chainName: "Chihuahua",
      stakeCurrency: {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("chihuahua"),
      currencies: [
        {
          coinDenom: "HUAHUA",
          coinMinimalDenom: "uhuahua",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "HUAHUA",
          coinMinimalDenom: "uhuahua",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.025,
            average: 0.03,
            high: 0.035,
          },
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  // TODO: do something about it, this one is actually terra-classic now
  // {
  //   native: false,
  //   txExplorer: "https://finder.terra.money/columbus-5/tx/{txHash}",
  //   chainInfo: {
  //     rpc: "https://rpc-columbus.keplr.app",
  //     rest: "https://lcd-columbus.keplr.app",
  //     chainId: "columbus-5",
  //     chainName: "Terra",
  //     stakeCurrency: {
  //       coinDenom: "LUNA",
  //       coinMinimalDenom: "uluna",
  //       coinDecimals: 6,
  //     },
  //     bip44: {
  //       coinType: 330,
  //     },
  //     bech32Config: Bech32Address.defaultBech32Config("terra"),
  //     currencies: [
  //       {
  //         coinDenom: "LUNA",
  //         coinMinimalDenom: "uluna",
  //         coinDecimals: 6,
  //       },
  //       {
  //         coinDenom: "UST",
  //         coinMinimalDenom: "uusd",
  //         coinDecimals: 6,
  //       },
  //       {
  //         coinDenom: "KRT",
  //         coinMinimalDenom: "ukrw",
  //         coinDecimals: 6,
  //       },
  //     ],
  //     feeCurrencies: [
  //       {
  //         coinDenom: "LUNA",
  //         coinMinimalDenom: "uluna",
  //         coinDecimals: 6,
  //       },
  //       {
  //         coinDenom: "UST",
  //         coinMinimalDenom: "uusd",
  //         coinDecimals: 6,
  //       },
  //     ],
  //     gasPriceStep: {
  //       low: 0.015,
  //       average: 0.015,
  //       high: 0.015,
  //     },
  //     features: ["ibc-transfer"],
  //   },
  // },
  {
    native: false,
    txExplorer: "https://likecoin.bigdipper.live/transactions/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/likecoin",
      rest: "https://mainnet-node.like.co",
      chainId: "likecoin-mainnet-2",
      chainName: "LikeCoin",
      stakeCurrency: {
        coinDenom: "LIKE",
        coinMinimalDenom: "nanolike",
        coinDecimals: 9,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("cosmos"),
      currencies: [
        {
          coinDenom: "LIKE",
          coinMinimalDenom: "nanolike",
          coinDecimals: 9,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "LIKE",
          coinMinimalDenom: "nanolike",
          coinDecimals: 9,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: false,
    txExplorer: "https://www.mintscan.io/rizon/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/rizon",
      rest: "http://seed-1.mainnet.rizon.world:1317",
      chainId: "titan-1",
      chainName: "RIZON",
      stakeCurrency: {
        coinDenom: "ATOLO",
        coinMinimalDenom: "uatolo",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("rizon"),
      currencies: [
        {
          coinDenom: "ATOLO",
          coinMinimalDenom: "uatolo",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "ATOLO",
          coinMinimalDenom: "uatolo",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: true,
    txExplorer: "https://blockscan.ixo.world/transactions/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/impacthub",
      rest: "https://lcd-impacthub.keplr.app",
      chainId: "impacthub-3",
      chainName: "IXO",
      stakeCurrency: {
        coinDenom: "IXO",
        coinMinimalDenom: "uixo",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("ixo"),
      currencies: [
        {
          coinDenom: "IXO",
          coinMinimalDenom: "uixo",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "IXO",
          coinMinimalDenom: "uixo",
          coinDecimals: 6,
        },
      ],
      features: ["ibc-transfer"],
    },
  },
  {
    native: false,
    txExplorer: "https://www.mintscan.io/evmos/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc.cosmos.directory/evmos",
      rest: "https://lcd-evmos.keplr.app/",
      chainId: "evmos_9001-2",
      chainName: "Evmos",
      stakeCurrency: {
        coinDenom: "EVMOS",
        coinMinimalDenom: "aevmos",
        coinDecimals: 18,
        coinGeckoId: "evmos",
      },
      bip44: {
        coinType: 60,
      },
      bech32Config: Bech32Address.defaultBech32Config("evmos"),
      currencies: [
        {
          coinDenom: "EVMOS",
          coinMinimalDenom: "aevmos",
          coinDecimals: 18,
          coinGeckoId: "evmos",
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "EVMOS",
          coinMinimalDenom: "aevmos",
          coinDecimals: 18,
          coinGeckoId: "evmos",
          gasPriceStep: {
            low: 25000000000,
            average: 25000000000,
            high: 40000000000,
          },
        },
      ],
      features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
    },
  },
  {
    native: true,
    txExplorer: "https://www.mintscan.io/omniflix/txs/{txHash}",
    chainInfo: {
      rpc: "https://rpc-omniflixhub.keplr.app",
      rest: "https://lcd-omniflixhub.keplr.app",
      chainId: "omniflixhub-1",
      chainName: "OmniFlix",
      stakeCurrency: {
        coinDenom: "FLIX",
        coinMinimalDenom: "uflix",
        coinDecimals: 6,
      },
      bip44: {
        coinType: 118,
      },
      bech32Config: Bech32Address.defaultBech32Config("omniflix"),
      currencies: [
        {
          coinDenom: "FLIX",
          coinMinimalDenom: "uflix",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "FLIX",
          coinMinimalDenom: "uflix",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.001,
            average: 0.0025,
            high: 0.025,
          },
        },
      ],
      features: [],
    },
  },
];

const getAllSupportedChains = (): ReadonlyArray<WalletChainConfig> => {
  return SUPPORTED_OTHER_WALLET_CHAINS.concat(defaultChain);
};

const getAllOtherAutoChains = (): ReadonlyArray<WalletChainConfig> => {
  return SUPPORTED_OTHER_WALLET_CHAINS.reduce((acc, chain) => {
    if (
      config.autoChains.find((_autoSymbol) => {
        return chain.chainInfo.currencies.find(
          (_cur) => _cur.coinDenom === _autoSymbol,
        );
      })
    ) {
      acc.push(chain);
    }
    return acc;
  }, Array<WalletChainConfig>());
};

const getChainSymbol = (chain: WalletChainConfig): string => {
  const { chainInfo } = chain;
  // exception for Terra
  if (chainInfo.chainName === "Terra") return "UST";
  return chainInfo.currencies[0].coinDenom.toUpperCase();
};

export {
  SUPPORTED_OTHER_WALLET_CHAINS,
  defaultChain,
  getAllSupportedChains,
  getAllOtherAutoChains,
  getChainSymbol,
};
