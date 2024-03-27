import { CertificateParser } from "@iov/certificate-parser";
import { NameItem } from "types/nameItem";

const certificateFromData = (
  data: string,
  b64?: boolean,
): CertificateParser | null => {
  try {
    return new CertificateParser(b64 !== undefined && b64 ? atob(data) : data);
  } catch (error) {
    console.warn("Unsupported certificate");
  }
  return null;
};

const checkAccountMatch = (
  item: NameItem,
  certificate: CertificateParser,
): boolean => {
  const { address, starname } = certificate.getStarnameInfo();
  return starname === item.toString() && item.getValue().owner === address;
};

export { certificateFromData, checkAccountMatch };
