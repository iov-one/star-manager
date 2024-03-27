import { Button, Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";

interface Props {
  readonly onBack: () => void;
}

export const Tab2: React.FC<Props> = (props: Props): React.ReactElement => {
  return (
    <Block className={"google-signer-request-authorization-to-sign-content"}>
      <Block className={"google-signer-request-authorization-toolbar"}>
        <Button variant={"text"} onClick={props.onBack}>
          <i className={"fa fa-angle-left"} /> <Typography>Back</Typography>
        </Button>
      </Block>
      <Block
        className={
          "google-signer-request-authorization-to-sign-content-transaction"
        }
      >
        <div data-key={"transaction"} />
      </Block>
    </Block>
  );
};
