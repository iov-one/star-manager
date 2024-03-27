import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import { Tooltip } from "components/Tooltip";
import React from "react";
import { TooltipInfo } from "types/tooltipInfo";

interface Props {
  tooltip: TooltipInfo;
  title: string;
}
export const RegisterFormHeading: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { tooltip } = props;
  return (
    <Block display={"flex"} justifyContent={"space-between"} marginBottom={8}>
      <Typography variant={"subtitle2"}>{props.title}</Typography>
      <Tooltip maxWidth={320} label={tooltip.label}>
        <Tooltip.Content title={tooltip.title}>
          <Typography
            variant={"body2"}
            color={"textSecondary"}
            align={"center"}
          >
            {tooltip.content}
          </Typography>
        </Tooltip.Content>
      </Tooltip>
    </Block>
  );
};
