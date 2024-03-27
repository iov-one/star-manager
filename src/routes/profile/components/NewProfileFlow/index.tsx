import "./styles.scss";

import { Button, Typography } from "@material-ui/core";
import { Block } from "components/block";
import modal from "components/modal";
// import toast, { ToastType } from "components/toast";
import { NEW_PROFILE_SCREEN_TESTID } from "constants/readonlyProfileViewTestIds";
// import { useWallet } from "contexts/walletContext";
import locales from "locales/strings";
// import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import React from "react";
import { Link, useHistory } from "react-router-dom";

// import { RequestFreeStarname } from "routes/profile/components/RequestFreeStarname";
// import { GDriveCustodianContext } from "signers/gdrive/context";
// import { GDriveCustodian } from "signers/gdrive/custodian";
// import { Wallet } from "signers/wallet";
import FreeStarnameServiceUnavailable from "./components/FreeStarnameServiceMaintenance";

export const NewProfileFlow: React.FC = (): React.ReactElement => {
  // const custodian: GDriveCustodian = React.useContext<GDriveCustodian>(
  //   GDriveCustodianContext,
  // );
  // const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
  const history = useHistory();
  // const wallet: Wallet = useWallet();
  const onStartGetFreeStarnameFlow = (): void => {
    // const onRegistered = async (): Promise<void> => {
    //   await sessionStore.refreshAccounts();
    //   toast.show(locales.FREE_STARNAME_SUCCESS_TOAST, ToastType.Success);
    //   close();
    // };
    // This look weird, but it's correct :/
    const close = modal.show(
      // <RequestFreeStarname
      //   wallet={wallet}
      //   custodian={custodian}
      //   onRegistered={onRegistered}
      //   onClose={(): void => close()}
      // />,
      <FreeStarnameServiceUnavailable
        close={() => {
          close();
          history.push("/manager/register");
        }}
      />,
    );
  };

  return (
    <Block
      data-testid={NEW_PROFILE_SCREEN_TESTID}
      className={"new-profile-flow"}
    >
      <Typography color={"primary"} variant={"h3"}>
        {locales.WELCOME_TO_STARNAME}
      </Typography>
      <Typography variant={"overline"} component={"span"}>
        {locales.WHAT_IS_STARNAME_BRIEF}
      </Typography>
      <Block className={"new-profile-flow-text-and-buttons"}>
        <Typography variant={"subtitle1"} component={"span"}>
          {locales.GET_STARTED_BY_FREE_STARNAME}
        </Typography>
        <Block className={"new-profile-flow-buttons"}>
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={onStartGetFreeStarnameFlow}
          >
            {locales.CONTINUE}
          </Button>

          <Block height={24} />
          <Link to={"/manager/register"}>
            {locales.NO_THANKS_PROCEED_TO_THE_MANAGER_PLEASE}
          </Link>
        </Block>
      </Block>
    </Block>
  );
};
