import { List, ListItem, Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";
import { palette } from "theme/palette";

interface Props {
  entries: string[];
}

export const ItemizedHelpView: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { entries } = props;
  return (
    <Block
      marginTop={32}
      padding={32}
      backgroundColor={palette.secondary.light}
      borderLeftWidth={4}
      borderLeftStyle={"solid"}
      borderLeftColor={palette.accent.main}
    >
      <List disablePadding>
        {entries.map(
          (text: string): React.ReactElement => (
            <ListItem key={text} disableGutters>
              <Typography color={"textPrimary"} variant={"subtitle1"}>
                {text}
              </Typography>
            </ListItem>
          ),
        )}
      </List>
    </Block>
  );
};
