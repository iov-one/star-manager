import { Divider, List } from "@material-ui/core";
import { AppSwitcherLink } from "components/ApplicationBar/components/AppSwitcherLink";
import { Drawer } from "components/ApplicationBar/components/Drawer";
import { SimpleLogoutButton } from "components/ApplicationBar/components/SimpleLogoutButton";
import { Block } from "components/block";
import { useWallet } from "contexts/walletContext";
import { observer } from "mobx-react";
import React from "react";
import { SignerType } from "signers/signerType";

import { Manage2faLink } from "../Manage2faLink";

export const RightPanel: React.FC = observer((): React.ReactElement => {
  const [isDrawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const wallet = useWallet();

  return (
    <Block
      className={"application-bar-right-panel"}
      onClick={(): void => setDrawerOpen(!isDrawerOpen)}
    >
      <i className={"fa fa-bars"} />
      <Drawer isOpen={isDrawerOpen}>
        <List>
          <AppSwitcherLink />
          <Divider />
          {wallet.getSignerType() === SignerType.Google ? (
            <Manage2faLink />
          ) : null}
          <SimpleLogoutButton />
        </List>
      </Drawer>
    </Block>
  );
});
