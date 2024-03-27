import config from "config";
import { ScoreChainBTCResult } from "types/scoreChainResult";

const generateBTCScore = async (
  address: string,
  btcAddress: string,
): Promise<ScoreChainBTCResult> => {
  const response = await fetch(`${config.scoreChainApiUrl}btc/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      starAddress: address,
      btcAddress,
    }),
  });
  const data = await response.json();
  return data;
};

export default generateBTCScore;
