import { Button, makeStyles, Typography } from "@material-ui/core";
import drive from "assets/google-drive.svg";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import theme from "theme";

interface Props {
  ready: boolean;
}

const useStyles = makeStyles(() => ({
  heading: {
    fontWeight: "normal",
  },
  icon: {
    width: 24,
    height: 24,
    lineHeight: "24px",
  },
  image: {
    height: "100%",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2.5),
  },
  bottomNote: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  noticePanel: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.primary.light,
    boxSizing: "border-box",
    borderRadius: 5,
    width: 600,
    height: "fit-content",
    padding: "20px 24px 8px",
  },
}));

const PrePermissionsNotice = React.forwardRef<HTMLButtonElement, Props>(
  (
    props: React.PropsWithRef<Props>,
    ref: React.Ref<HTMLButtonElement>,
  ): React.ReactElement => {
    const classes = useStyles();
    return (
      <Block
        backgroundColor={theme.palette.background.paper}
        textAlign={"center"}
        className={classes.noticePanel}
      >
        <Typography align={"center"} variant={"h6"} className={classes.heading}>
          {locales.PRE_GOOGLE_LOGIN_NOTICE_CONTENT}
        </Typography>
        <div className={classes.buttonContainer}>
          <Button
            startIcon={
              <div className={classes.icon}>
                <img
                  className={classes.image}
                  src={drive}
                  alt={"google-drive"}
                />
              </div>
            }
            ref={ref}
            disabled={!props.ready}
            variant={"contained"}
          >
            {locales.PRE_GOOGLE_LOGIN_NOTICE_CONTINUE_BUTTON}
          </Button>
        </div>
        <div className={classes.bottomNote}>
          <Typography
            style={{ fontStyle: "italic" }}
            align={"center"}
            variant={"caption"}
          >
            {locales.PRE_GOOGLE_LOGIN_NOTICE_NOTE}
          </Typography>
        </div>
      </Block>
    );
  },
);

export default PrePermissionsNotice;
