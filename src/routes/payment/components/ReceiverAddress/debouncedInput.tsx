import { OutlinedInput } from "@material-ui/core";
import { Spinner } from "components/Spinner";
import React from "react";

interface Props {
  readonly placeholder: string;
  readonly disabled: boolean;
  readonly fullWidth: boolean;
  readonly showSpinner: boolean;
  readonly onChange: (value: string) => void;
}

export const DebouncedInput: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { onChange } = props;
  const [internalValue, setInternalValue] = React.useState<string>("");
  const onChangeProxy = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setInternalValue(value);
  };
  React.useEffect((): (() => void) => {
    const timer = setTimeout((): void => {
      onChange(internalValue);
    }, 400);
    return (): void => {
      clearTimeout(timer);
    };
  }, [internalValue, onChange]);
  return (
    <OutlinedInput
      placeholder={props.placeholder}
      disabled={props.disabled}
      fullWidth={props.fullWidth}
      margin={"none"}
      endAdornment={props.showSpinner ? <Spinner size={24} /> : null}
      onChange={onChangeProxy}
    />
  );
};
