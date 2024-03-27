import config from "config";

const checkScoreChainUser = async (starAddress: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${config.scoreChainApiUrl}btc/check/${starAddress}`,
    );
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.warn(error);
  }
  return false;
};

export default checkScoreChainUser;
