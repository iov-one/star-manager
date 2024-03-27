import "./style.scss";

import { Button, Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";
import theme from "theme";

interface Props {
  close: () => void;
}

const FreeStarnameServiceUnavailable = (props: Props): React.ReactElement => {
  return (
    <Block
      backgroundColor={theme.palette.background.paper}
      className={"service-unavailable-container"}
    >
      <Typography variant={"h6"} align={"center"} className={"title"}>
        {"Ooops! Free *starnames with Google are currently unavailable"}
      </Typography>

      <Typography variant={"subtitle2"} align={"center"} gutterBottom>
        {`Don't worry, you can still proceed and register a *starname for a small
        fee.`}
      </Typography>

      <hr />

      <Block className={"pricing-info-container"}>
        <Block>
          <span>Basic</span> *starname costs less than 2 IOV
        </Block>
        <Block>
          <span>Premium</span> *starname starts at 70 IOV
        </Block>
      </Block>

      <Block className={"button-container"}>
        <Button onClick={props.close} variant={"contained"} color={"primary"}>
          {"Register a *starname"}
        </Button>
      </Block>
    </Block>
  );
};

export default FreeStarnameServiceUnavailable;
