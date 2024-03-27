import { CertificateParser } from "@iov/certificate-parser";

import { SocialNetwork } from "./socialNetwork";

export interface SocialNetworkCertificate {
  network: SocialNetwork;
  certificate: CertificateParser;
}
