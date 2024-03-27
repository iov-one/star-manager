import config from "config";
import { TwitterClaimVerificationResponse } from "types/genericSocialClaimVerificationResponse";

const twitterClaimVerifier = async (
  handle: string,
  starname: string,
): Promise<TwitterClaimVerificationResponse> => {
  const response = await fetch(
    `${config.twitterVerifierUrl}check-claim/${handle}/${starname}`,
  );
  const data = await response.json();
  return data;
};

export default twitterClaimVerifier;
