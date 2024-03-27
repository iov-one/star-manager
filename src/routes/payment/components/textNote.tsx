import { TextField, Typography } from "@material-ui/core";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";

interface Props {
  readonly value: string;
  readonly disabled: boolean;
  readonly onChange: (value: string) => void;
}

const TextNote: React.FC<Props> = (props: Props): React.ReactElement => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    props.onChange(value);
  };
  return (
    <Block width={"100%"} display={"flex"} flexDirection={"column"}>
      <Typography color={"textPrimary"} variant={"subtitle2"}>
        {locales.NOTE}
      </Typography>
      <Block marginTop={8}>
        <TextField
          placeholder={locales.TEXTNOTE_OPTIONAL_MESSAGE}
          margin={"none"}
          disabled={props.disabled}
          rows={"2"}
          value={props.value}
          onChange={onChange}
          multiline={true}
          fullWidth={true}
        />
      </Block>
    </Block>
  );
};

export default TextNote;
