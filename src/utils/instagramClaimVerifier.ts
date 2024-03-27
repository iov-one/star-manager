import config from "config";
import { InstagramClaimVerificationResponse } from "types/genericSocialClaimVerificationResponse";

const instagramClaimVerifier = async (
  handle: string,
  starname: string,
): Promise<InstagramClaimVerificationResponse> => {
  const response = await fetch(
    `${config.instagramConfig.requestUrl}check-claim/${handle}/${starname}`,
  );
  const data: InstagramClaimVerificationResponse = await response.json();
  return data;
};

export default instagramClaimVerifier;
