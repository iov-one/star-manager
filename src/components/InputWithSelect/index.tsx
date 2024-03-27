import {
  makeStyles,
  OutlinedInput,
  OutlinedInputProps,
  ThemeProvider,
} from "@material-ui/core";
import React from "react";
import { selectTheme } from "routes/starnames/components/RegisterForm/selectTheme";

interface Props {
  selectComponent: React.ReactNode;
}

const useStyles = makeStyles({
  adornedEnd: {
    paddingRight: 0,
  },
});

const InputWithSelect = (
  props: Props & Omit<OutlinedInputProps, "endAdornment">,
): React.ReactElement => {
  const classes = useStyles();
  const { selectComponent, ...inputProps } = props;
  const { classes: providedClasses } = inputProps;
  return (
    <OutlinedInput
      {...inputProps}
      classes={{
        ...providedClasses,
        adornedEnd: classes.adornedEnd,
      }}
      endAdornment={
        <ThemeProvider theme={selectTheme}>{selectComponent}</ThemeProvider>
      }
    />
  );
};

export default InputWithSelect;
