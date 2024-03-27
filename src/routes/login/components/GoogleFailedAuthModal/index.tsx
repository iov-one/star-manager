import "./style.scss";

import { Button, Typography } from "@material-ui/core";
import barrier from "assets/barrier.svg";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import theme from "theme";

interface Props {
  content: React.ReactNode;
  close: () => void;
}

const GoogleAuthFailedDialog = (props: Props): React.ReactElement => {
  return (
    <Block
      backgroundColor={theme.palette.background.paper}
      className={"auth-failed-container"}
    >
      <img src={barrier} alt={"barrier"} />
      <Typography variant={"subtitle2"} align={"center"}>
        {props.content}
      </Typography>

      <div className={"button-container"}>
        <Button onClick={props.close} variant={"contained"}>
          {locales.UNDERSTOOD}
        </Button>
      </div>
    </Block>
  );
};

export default GoogleAuthFailedDialog;
