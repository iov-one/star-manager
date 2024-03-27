import { SocialNetwork } from "types/socialNetwork";
import { SocialNetworkCertificate } from "types/socialNetworkCertificate";

const matchCertifierEntity = (
  certificate: SocialNetworkCertificate,
  value: string,
): boolean => {
  const { certificate: cert, network } = certificate;
  switch (network) {
    case SocialNetwork.Website: {
      const cleanedValue = value.replace(/(^\w+:|^)\/\//, "");
      const webInfo = cert.getWebsiteInfo();
      // can never be the case
      if (!webInfo) return false;
      return webInfo.host === cleanedValue;
    }
    case SocialNetwork.Twitter: {
      const twitterInfo = cert.getTwitterClaimInfo();
      if (!twitterInfo) return false;
      return twitterInfo.handle === value;
    }
    case SocialNetwork.Discord:
    case SocialNetwork.Github:
    case SocialNetwork.Instagram:
    case SocialNetwork.Telegram:
      return false;
  }
};

export default matchCertifierEntity;
