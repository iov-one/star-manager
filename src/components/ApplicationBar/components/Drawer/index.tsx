import "./styles.scss";

import { Block } from "components/block";
import React from "react";
import ReactDOM from "react-dom";

interface Props {
  readonly isOpen: boolean;
}

export const Drawer: React.FC<React.PropsWithChildren<Props>> = (
  props: React.PropsWithChildren<Props>,
) => {
  const { isOpen } = props;
  const classes = ["application-drawer"];
  if (isOpen) classes.push("open");
  return ReactDOM.createPortal(
    <Block className={classes.join(" ")}>{props.children}</Block>,
    document.body,
  );
};
