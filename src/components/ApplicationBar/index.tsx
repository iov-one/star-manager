import "./styles.scss";

import logo from "assets/logo.webp";
import { RightPanel } from "components/ApplicationBar/components/RightPanel";
import { Block } from "components/block";
import { observer } from "mobx-react";
import React from "react";

export const ApplicationBar: React.FC = observer((): React.ReactElement => {
  return (
    <Block className={"application-bar"}>
      <Block className={"application-logo"}>
        <img src={logo} alt={"logo"} />
      </Block>
      <RightPanel />
    </Block>
  );
});
