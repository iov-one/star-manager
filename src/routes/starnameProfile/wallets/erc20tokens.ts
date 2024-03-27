import SUPPORTED_ERC20_TOKENS from "config/supportedErc20Tokens";

export const erc20Tokens: {
  [name: string]: string;
} = SUPPORTED_ERC20_TOKENS.filter((_token) => !!_token.contractAddress).reduce(
  (
    map,
    token,
  ): {
    [name: string]: string;
  } => {
    const { symbol } = token;
    return {
      ...map,
      [symbol.toLowerCase()]: token.contractAddress,
    };
  },
  {},
);
