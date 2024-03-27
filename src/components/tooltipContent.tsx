import { Theme, Typography, useTheme } from "@material-ui/core";
import { Block } from "components/block";
import React, { PropsWithChildren } from "react";

interface Props {
  header?: React.ReactElement;
  title: string;
}

export const TooltipContent: React.FC<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>,
): React.ReactElement => {
  const theme: Theme = useTheme();
  return (
    <Block
      backgroundColor={"white"}
      maxWidth={350}
      borderRadius={5}
      className={"elevated"}
      borderWidth={1}
      borderStyle={"solid"}
      borderColor={theme.palette.primary.light}
    >
      <Block padding={32}>
        {props.header}
        <Block marginTop={8} marginBottom={8}>
          <Typography variant={"subtitle1"} align={"center"}>
            {props.title}
          </Typography>
        </Block>
        {props.children}
      </Block>
    </Block>
  );
};

export type ContentProps = Props;
