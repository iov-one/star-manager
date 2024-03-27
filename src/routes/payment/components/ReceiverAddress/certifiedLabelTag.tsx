import { Typography } from "@material-ui/core";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import tickIcon from "assets/green-tick.svg";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";

const useStyles = makeStyles({
  icon: {
    lineHeight: "16px",
    height: 16,
  },
  iconContainer: {
    height: 16,
    lineHeight: "16px",
    marginRight: 8,
  },
});

export const CertifiedLabelTag: React.FC<{ validated: boolean }> = (props: {
  validated: boolean;
}): React.ReactElement | null => {
  const classes = useStyles();
  if (props.validated) {
    return (
      <Block display={"flex"} alignItems={"center"} marginLeft={"auto"}>
        <Block className={classes.iconContainer}>
          <img className={classes.icon} alt={"tick"} src={tickIcon} />
        </Block>
        <Typography color={"primary"} variant={"subtitle2"}>
          {locales.VERIFIED_ADDRESS}
        </Typography>
      </Block>
    );
  } else {
    return <Typography variant={"subtitle2"}> </Typography>;
  }
};
