import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";

interface Props {
  readonly render?: () => React.ReactElement;
  readonly value?: string;
  readonly label: string;
}

export const Field: React.FC<Props> = (props: Props): React.ReactElement => {
  const { render, value = "", label } = props;
  return (
    <Block
      className={"google-signer-request-authorization-to-sign-content-field"}
    >
      <Block
        className={
          "google-signer-request-authorization-to-sign-content-field-label"
        }
      >
        <Typography variant={"subtitle2"}>{label}</Typography>
      </Block>
      <Block
        className={
          "google-signer-request-authorization-to-sign-content-field-value"
        }
      >
        {render !== undefined ? (
          render()
        ) : (
          <Typography variant={"subtitle1"}>{value}</Typography>
        )}
      </Block>
    </Block>
  );
};
