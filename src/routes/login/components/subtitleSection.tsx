import { makeStyles, Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";

interface Props {
  readonly children: string;
}

const useStyles = makeStyles({
  text: {
    fontWeight: 300,
  },
});

const SubtitleSection = ({ children }: Props): React.ReactElement => {
  const classes = useStyles();
  return (
    <Block width={498} marginBottom={32}>
      <Typography
        variant={"h6"}
        color={"textSecondary"}
        className={classes.text}
      >
        {children}
      </Typography>
    </Block>
  );
};

export default SubtitleSection;
