import { makeStyles, Theme, Typography } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import { Block } from "components/block";
import React, { PropsWithChildren } from "react";

const useStyles = makeStyles((theme: Theme) => ({
  panel: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.primary.light,
    boxSizing: "border-box",
    borderRadius: 5,
  },
}));

export interface Props {
  readonly text: string;
}

export const GenericBillboard: React.FC<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>,
): React.ReactElement => {
  const classes = useStyles();
  const theme = useTheme<Theme>();

  return (
    <Block
      backgroundColor={theme.palette.background.paper}
      width={450}
      height={250}
      padding={64}
      textAlign={"center"}
      className={classes.panel}
    >
      {props.children}
      <Block marginTop={32}>
        <Typography variant={"subtitle1"} align={"center"}>
          {props.text}
        </Typography>
      </Block>
    </Block>
  );
};
