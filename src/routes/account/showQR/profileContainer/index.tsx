import "./style.scss";

import { Block } from "components/block";
import React from "react";

interface Props {
  icon: React.ReactNode;
}

const ProfileContainer = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<Props>
>((props, ref) => {
  return (
    <Block className={"profile-container"} ref={ref}>
      <Block className={"avatar"}>{props.icon}</Block>
      {props.children}
    </Block>
  );
});

export default ProfileContainer;
