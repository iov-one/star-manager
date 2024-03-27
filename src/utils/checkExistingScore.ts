import config from "config";
import { ScoreChainBTCResult } from "types/scoreChainResult";

const checkExistingBTCScore = async (
  address: string,
  btcAddress: string,
): Promise<ScoreChainBTCResult> => {
  const response = await fetch(
    `${config.scoreChainApiUrl}btc/score/${address}/${btcAddress}`,
  );
  const data = await response.json();
  return data;
};

export default checkExistingBTCScore;
