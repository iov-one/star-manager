import config from "config";

export const fund = async (address: string): Promise<void> => {
  const result = await fetch(`${config.faucetUrl}/credit?address=${address}`);
  if (result.status !== 200) {
    throw new Error(result.statusText);
  }
};
