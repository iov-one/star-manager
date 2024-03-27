import { makeStyles, Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";

const useStyles = makeStyles({
  starnameHeader: {},
});

interface Props {
  sample: string;
}

export const NoStarnameHeader: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const classes = useStyles();
  return (
    <Block
      className={classes.starnameHeader}
      borderRadius={40}
      height={36}
      width={145}
    >
      <Typography
        variant={"subtitle1"}
        color={"primary"}
        style={{ lineHeight: "36px" }}
      >
        {props.sample}
      </Typography>
    </Block>
  );
};
