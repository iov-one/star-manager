import { CertificateParser } from "@iov/certificate-parser";
import config from "config";

interface VerificationResponse {
  valid: boolean;
  reason?: string;
}

const verifyCertificate = (
  certificate: CertificateParser,
  checkTrust = true,
): VerificationResponse => {
  // check integrity
  if (!certificate.checkIntegrity())
    return {
      valid: false,
      reason: "Invalid certificate",
    };
  // check validity
  if (new Date() > certificate.getExpireDate())
    return {
      valid: false,
      reason: "Expired certificate",
    };
  // check trust
  if (checkTrust) {
    const { id, public_key } = certificate.getCertifier();
    if (
      !config.turstedCertifiers.find(
        ({ id: _id, public_key: _pubKey }) =>
          _id === id && _pubKey === public_key,
      )
    )
      return {
        valid: false,
        reason: "Untrusted certificate",
      };
  }
  return {
    valid: true,
  };
};

export default verifyCertificate;
