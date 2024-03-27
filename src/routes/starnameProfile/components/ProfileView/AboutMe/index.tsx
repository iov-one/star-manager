import "./style.scss";

import {
  CertificateParser,
  SupportedServiceTypes,
} from "@iov/certificate-parser";
import React from "react";
import { AccountInfo } from "types/profile";
import { Resource } from "types/resourceInfo";
import { SocialItem } from "types/socialItem";
import { isSocialNetwork, SocialNetwork } from "types/socialNetwork";
import { SocialNetworkCertificate } from "types/socialNetworkCertificate";
import matchCertifierEntity from "utils/matchCertifiedEntity";
import verifyCertificate from "utils/verifyCertificate";

import { SocialHandleList } from "./socialHandleList";

interface Props {
  readonly accountData: AccountInfo;
}

const toSocialNetworkType = (type: SupportedServiceTypes): SocialNetwork => {
  switch (type) {
    case "web":
      return SocialNetwork.Website;
    case "twitter":
      return SocialNetwork.Twitter;
    case "instagram":
      return SocialNetwork.Instagram;
  }
};

const toSocialNetworkCertificate = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  value: any,
): SocialNetworkCertificate | null => {
  if (typeof value !== "string") return null;
  try {
    const parsed = new CertificateParser(
      Buffer.from(value, "base64").toString(),
    );
    const socialType = toSocialNetworkType(parsed.getServiceType());
    if (!socialType) return null;
    return {
      certificate: parsed,
      network: socialType,
    };
  } catch (error) {
    console.warn("invalid certificate structure");
  }
  return null;
};

export const AboutMeComponent: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { accountData } = props;

  const [stubClass, setStubClass] = React.useState<string>("stub");

  const handles: ReadonlyArray<SocialItem> =
    React.useMemo((): ReadonlyArray<SocialItem> => {
      const {
        accountData: { resources, certificates },
      } = props;
      if (resources === null) return [];
      const socialHandleCertificates = certificates.reduce(
        (acc, certificate) => {
          const socialCertificate = toSocialNetworkCertificate(certificate);
          if (socialCertificate) {
            acc.push(socialCertificate);
          }
          return acc;
        },
        Array<SocialNetworkCertificate>(),
      );
      type ResourceMap = Record<string, SocialItem>;
      const items: ResourceMap = {}; // populated in reduce()
      resources
        .filter((resource: Resource): boolean => {
          const { uri } = resource;
          if (!uri.startsWith("social:")) {
            return false;
          }
          const fragments: ReadonlyArray<string> = uri.split(":");
          if (fragments.length < 2) return false;
          return isSocialNetwork(fragments[1]);
        })
        .reduce((accumulator: ResourceMap, resource: Resource): ResourceMap => {
          const { uri } = resource;
          const fragments: ReadonlyArray<string> = uri.split(":");
          const network = fragments[1];
          const record = accumulator[network] || {
            network: network as SocialNetwork,
          };
          // social network name (handle)
          record.name = resource.resource;
          record.certified = false;
          // now check for certificate
          const relatedCertificate = socialHandleCertificates.find(
            (cert) => cert.network === network,
          );
          if (relatedCertificate) {
            // check integrity, validity, trust for this certificate
            const { valid, reason } = verifyCertificate(
              relatedCertificate.certificate,
            );
            // FIXME: actually warn user somehow
            // warn user about reason
            if (reason) console.warn(reason);
            if (valid) {
              // now match entity
              record.certified = matchCertifierEntity(
                relatedCertificate,
                resource.resource,
              );
            }
          }
          accumulator[network] = record;

          return accumulator;
        }, items);
      return Object.values(items);
    }, [props]);

  React.useEffect(() => {
    if (accountData.biography || handles.length > 0) setStubClass("");
  }, [handles.length, accountData.biography]);
  return (
    <div className="about-me-container">
      <div className={"sub-heading about-me"}>
        <h1 className={stubClass}>About Me</h1>
      </div>
      <div className={["information", stubClass].join(" ")}>
        <div className={"biography"}>{accountData.biography}</div>
        <div className={"social-handles"}>
          <SocialHandleList handles={handles} />
        </div>
      </div>
    </div>
  );
};
