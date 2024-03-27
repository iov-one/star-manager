import { Button, CircularProgress, lighten, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { SignInButtonCompletedCallback } from "types/signInMethod";

interface Props {
  readonly className?: string;
  readonly ready: boolean;
  readonly icons?: {
    on: string;
    off: string;
  };
  readonly onSignIn?: SignInButtonCompletedCallback;
  readonly label: string;
  readonly loading?: boolean;
}

const useStyles = makeStyles(({ palette: { primary } }: Theme) => ({
  container: {
    marginBottom: 8,
  },
  button: {
    cursor: "pointer",
    backgroundColor: lighten(primary.main, 0.85),
    color: primary.main,
    "&:hover": {
      backgroundColor: lighten(primary.main, 0.85),
      color: primary.main,
    },
    fontWeight: 600,
    borderRadius: 12,
  },
  icon: {
    width: 24,
    height: 24,
    lineHeight: "24px",
  },
  img: {
    height: "100%",
  },
}));

export const SignInButton: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<Props> & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, Props>(
  (props: Props, ref: React.Ref<HTMLButtonElement>): React.ReactElement => {
    const { icons, onSignIn } = props;
    const classes = useStyles();
    const buttonClasses: Array<string> = [classes.button];
    if (props.className !== undefined) buttonClasses.push(props.className);
    const onClick = React.useCallback((): void => {
      if (onSignIn !== undefined && props.ready) {
        onSignIn();
      }
    }, [onSignIn, props.ready]);
    if (icons === undefined) {
      return (
        <div className={classes.container}>
          <Button
            onClick={onClick}
            ref={ref}
            className={buttonClasses.join(" ")}
            fullWidth={true}
            variant={"contained"}
            disabled={!props.ready}
          >
            {props.loading ? <CircularProgress size={20} /> : props.label}
          </Button>
        </div>
      );
    } else {
      return (
        <div className={classes.container}>
          <Button
            className={buttonClasses.join(" ")}
            fullWidth={true}
            onClick={onClick}
            ref={ref}
            startIcon={
              !props.loading ? (
                <div className={classes.icon}>
                  <img
                    className={classes.img}
                    src={props.ready ? icons.on : icons.off}
                    alt={props.label}
                  />
                </div>
              ) : undefined
            }
            variant={"contained"}
            disabled={!props.ready}
          >
            {props.loading ? <CircularProgress size={20} /> : props.label}
          </Button>
        </div>
      );
    }
  },
);
