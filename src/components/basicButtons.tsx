import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Block } from "components/block";
import { Spinner } from "components/Spinner";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";

export interface ButtonSpec {
  disabled: boolean;
  label: string;
  testId?: string;
  htmlColor?: string;
}

interface Props extends RouteComponentProps {
  primary?: ButtonSpec;
  secondary?: ButtonSpec;
  thinking?: boolean;
}

const useStyles = makeStyles(() => ({
  primaryButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const Buttons: React.FC<Props> = (props: Props): React.ReactElement => {
  const styles = useStyles();
  const {
    primary = { disabled: false, label: "Submit" },
    secondary = { disabled: false, label: "Cancel" },
    thinking,
  } = props;
  const onCancel = (): void => {
    const { history } = props;
    history.goBack();
  };
  return (
    <Block marginBottom={24}>
      <Block>
        <Button
          style={
            primary.htmlColor
              ? { backgroundColor: primary.htmlColor }
              : undefined
          }
          className={styles.primaryButton}
          type={"submit"}
          disabled={primary.disabled || thinking}
          variant={"contained"}
          color={"primary"}
          data-testid={primary.testId}
          fullWidth={true}
        >
          {!thinking ? primary.label : <Spinner size={24} />}
        </Button>
      </Block>
      <Block marginTop={12}>
        <Button
          style={
            secondary.htmlColor
              ? { backgroundColor: primary.htmlColor }
              : undefined
          }
          fullWidth={true}
          disabled={secondary.disabled || thinking}
          color={"primary"}
          data-testid={secondary.testId}
          onClick={onCancel}
        >
          {secondary.label}
        </Button>
      </Block>
    </Block>
  );
};

export default withRouter(Buttons);
