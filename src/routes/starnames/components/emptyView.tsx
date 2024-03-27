import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import { REGISTER_STARNAME_TOOLTIP } from "locales/componentStrings";
import locales from "locales/strings";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import { MANAGER_BASE_ROUTE } from "routes/paths";
import { NoStarnameHeader } from "routes/starnames/components/RegisterForm/noStarnameHeader";

interface Props extends RouteComponentProps {}

const texts: { title: string; message: string; sample: string } = {
  title: locales.REGISTER_YOUR_STARNAME,
  message: REGISTER_STARNAME_TOOLTIP.content,
  sample: locales.STARNAME_SAMPLE,
};

const EmptyView: React.FC<Props> = (): React.ReactElement => {
  const strings: {
    title: string;
    message: string;
    sample: string;
  } = texts;
  // const wallet = useWallet();
  // if (wallet.getSignerType() === SignerType.Google) {
  //   return (
  //     <Block className={"generic-name-view-new-profile-flow"}>
  //       <NewProfileFlow />
  //     </Block>
  //   );
  // } else {
  //   return (
  //     <Block className={"generic-name-view-empty-message"}>
  //       <Block className={"generic-name-view-empty-message-content"}>
  //         <NoStarnameHeader sample={strings.sample} />
  //         <Typography
  //           className={"generic-name-view-empty-message-content-title"}
  //           variant={"subtitle1"}
  //         >
  //           {strings.title}
  //         </Typography>
  //         <Block className={"generic-name-view-empty-message-content-text"}>
  //           <Typography variant={"body2"} color={"textSecondary"}>
  //             {strings.message}
  //           </Typography>
  //         </Block>
  //         <Link
  //           to={MANAGER_BASE_ROUTE + "/register"}
  //           style={{ textDecoration: "none" }}
  //         >
  //           <Typography variant={"subtitle1"} color={"primary"}>
  //             {locales.REGISTER_NOW}
  //           </Typography>
  //         </Link>
  //       </Block>
  //     </Block>
  //   );
  // }
  return (
    <Block className={"generic-name-view-empty-message"}>
      <Block className={"generic-name-view-empty-message-content"}>
        <NoStarnameHeader sample={strings.sample} />
        <Typography
          className={"generic-name-view-empty-message-content-title"}
          variant={"subtitle1"}
        >
          {strings.title}
        </Typography>
        <Block className={"generic-name-view-empty-message-content-text"}>
          <Typography variant={"body2"} color={"textSecondary"}>
            {strings.message}
          </Typography>
        </Block>
        <Link
          to={MANAGER_BASE_ROUTE + "/register"}
          style={{ textDecoration: "none" }}
        >
          <Typography variant={"subtitle1"} color={"primary"}>
            {locales.REGISTER_NOW}
          </Typography>
        </Link>
      </Block>
    </Block>
  );
};

export default withRouter(EmptyView);
