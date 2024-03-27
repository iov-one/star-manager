import { lighten, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Block } from "components/block";
import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: window.innerWidth > 780 ? "initial" : "none",
  },
  rect1: {
    opacity: 0.4,
    transform: "rotate(165deg)",
    position: "absolute",
    backgroundColor: lighten(theme.palette.primary.main, 0.5),
    width: 330,
    height: 330,
    left: -235,
    top: -120,
    borderRadius: 30,
  },
  rect2: {
    transform: "rotate(165deg)",
    position: "absolute",
    backgroundColor: lighten(theme.palette.primary.main, 0.85),
    width: 330,
    height: 330,
    left: -190,
    top: -95,
    borderRadius: 30,
  },
  rect3: {
    transform: "rotate(-60deg)",
    position: "absolute",
    backgroundColor: lighten(theme.palette.primary.main, 0.85),
    width: 390,
    height: 390,
    bottom: -300,
    right: -140,
    borderRadius: 30,
  },
}));

export const SignInDecoration: React.FC = (): React.ReactElement => {
  const classes = useStyles();
  return (
    <Block className={classes.container}>
      <Block className={classes.rect2} />
      <Block className={classes.rect1} />
      <Block className={classes.rect3} />
    </Block>
  );
};
