import "./style.scss";

import locales from "locales/strings";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { ICONS } from "routes/starnameProfile/Assets";

import CustomText from "../CustomText";

interface Props extends RouteComponentProps {
  readonly enabled: boolean;
  readonly onClick?: () => void;
}

const BackButton: React.FC<Props> = (props: Props): React.ReactElement => {
  const { history } = props;
  return (
    <div
      className={"back-button"}
      onClick={
        props.onClick
          ? props.onClick
          : props.enabled
          ? (): void => history.goBack()
          : () => {}
      }
    >
      {props.enabled ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={ICONS.BACK}
            alt={"back"}
            className={"image"}
            width={11}
            height={17}
          />
          <CustomText className={"text"}>{locales.BACK}</CustomText>
        </div>
      ) : null}
    </div>
  );
};

export default withRouter(BackButton);
