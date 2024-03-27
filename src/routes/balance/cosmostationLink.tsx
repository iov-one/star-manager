import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";

const CosmostationLink = (): React.ReactElement => {
  return (
    <Block className={"cosmostation-integration"}>
      <Typography className={"note"} align={"center"}>
        {"*" + locales.COSMOSTATION_WALLET_NOTE}
      </Typography>
      <Typography className={"links"} align={"center"}>
        Get it on{" "}
        <a
          href={
            "https://play.google.com/store/apps/details?id=wannabit.io.cosmostaion"
          }
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          Google play
        </a>{" "}
        or{" "}
        <a
          href={"https://itunes.apple.com/app/cosmostation/id1459830339"}
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          App Store
        </a>
      </Typography>
    </Block>
  );
};

export default CosmostationLink;
