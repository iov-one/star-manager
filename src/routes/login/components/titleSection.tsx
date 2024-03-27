import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";

interface Props {
  readonly primaryTitle: string;
  readonly secondaryTitle: string;
}

const TitleSection = ({
  primaryTitle,
  secondaryTitle,
}: Props): React.ReactElement => {
  return (
    <Block className={"sign-in-form-form-border-title"}>
      <Typography
        className={"sign-in-form-form-border-title"}
        color={"primary"}
        component={"span"}
      >
        {primaryTitle}{" "}
      </Typography>
      <Typography color={"textSecondary"} component={"h1"}>
        {secondaryTitle}
      </Typography>
    </Block>
  );
};

export default TitleSection;
