import "./styles.scss";

import Paper from "@material-ui/core/Paper";
import { Block } from "components/block";
import React, { PropsWithChildren } from "react";
import { toClassName } from "styles/toClassName";

interface Props {
  readonly id?: string;
  readonly icon: React.ReactNode;
  readonly avatarColor?: "primary" | "accent";
  readonly width?: "narrow" | "normal" | "wide";
  readonly buttons?: React.ReactNode;
  readonly transactionDetails?: React.ReactNode;
}

const PageContent: React.FC<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>,
): React.ReactElement => {
  return (
    <Block className={"page-content-container"}>
      <Block
        className={toClassName("paper-container centered", {
          [props.width ?? ""]: true,
        })}
      >
        <Paper variant={"outlined"}>
          <Block className={"content"}>
            <Block
              className={toClassName("avatar", {
                [props.avatarColor ?? ""]: true,
              })}
            >
              {props.icon}
            </Block>
            {props.children}
          </Block>
        </Paper>
        <Block className={"details"}>{props.transactionDetails}</Block>
        <Block className={"buttons"}>{props.buttons}</Block>
      </Block>
    </Block>
  );
};

export default PageContent;
