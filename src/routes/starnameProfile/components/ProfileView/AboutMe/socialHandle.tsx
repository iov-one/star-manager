import { Tooltip } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router";
import { SocialNetwork } from "types/socialNetwork";

interface Props {
  readonly handle?: string | null;
  readonly certified: boolean;
  readonly network: SocialNetwork;
}

const BaseUrls: {
  [key in SocialNetwork]: string;
} = {
  [SocialNetwork.Twitter]: "https://twitter.com/",
  [SocialNetwork.Github]: "https://github.com/",
  [SocialNetwork.Telegram]: "https://t.me/",
  [SocialNetwork.Discord]: "",
  [SocialNetwork.Website]: "",
  [SocialNetwork.Instagram]: "https://instagram.com/",
};

export const SocialHandle: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const { handle, network, certified } = props;
  const { starname } = useParams<{ starname: string }>();

  const ownedBy = React.useMemo(() => {
    return starname ?? "this starname";
  }, [starname]);

  const url: string | undefined = React.useMemo((): string | undefined => {
    if (network === SocialNetwork.Discord) {
      return undefined;
    } else {
      return BaseUrls[network] + handle;
    }
  }, [network, handle]);

  if (handle === undefined || handle === null || handle === "") {
    return null;
  }

  return network === SocialNetwork.Website && url ? (
    certified ? (
      <Tooltip title={`Certified and owned by ${ownedBy}`}>
        <div className="handle">
          <i className={"fas fa-globe"} />
          <a
            href={
              url.startsWith("http://") || url.startsWith("https://")
                ? url
                : `http://${url}`
            }
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <span className={"social-website"}>
              {handle}
              <i className={"fa fa-check-circle verified"} />
            </span>
          </a>
        </div>
      </Tooltip>
    ) : (
      <div className="handle">
        <i className={"fas fa-globe"} />
        <a
          href={
            url.startsWith("http://") || url.startsWith("https://")
              ? url
              : `http://${url}`
          }
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          <span className={"social-website"}>{handle}</span>
        </a>
      </div>
    )
  ) : certified ? (
    <Tooltip title={`Certified and owned by ${ownedBy}`}>
      <div className="handle">
        <i className={"fab fa-" + network} />
        <a href={url} target={"_blank"} rel={"noopener noreferrer"}>
          <span>
            {handle}
            <i className={"fa fa-check-circle verified"} />
          </span>
        </a>
      </div>
    </Tooltip>
  ) : (
    <div className="handle">
      <i className={"fab fa-" + network} />
      <a href={url} target={"_blank"} rel={"noopener noreferrer"}>
        <span>{handle}</span>
      </a>
    </div>
  );
};
