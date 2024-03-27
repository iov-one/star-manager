import { createTheme, Theme } from "@material-ui/core";
import { getInputStyle } from "routes/starnames/components/RegisterForm/helpers";
import parentTheme from "theme";

const fonts: string = ['"Muli"', "sans-serif"].join(", ");
const inputStyle = getInputStyle(parentTheme);

export const selectTheme: Theme = createTheme({
  overrides: {
    MuiOutlinedInput: {
      root: {
        fontFamily: fonts,
        ...inputStyle,
        fontWeight: 600,
        paddingLeft: 8,
        height: 50,
        padding: 0,
      },
      notchedOutline: {
        top: 0,
        height: 50,
        border: "none",
      },
    },
    MuiSelect: {
      outlined: {
        borderRadius: "0px 4px 4px 0px",
      },
      select: {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        "&:focus": {
          borderBottomRightRadius: 5,
          borderTopRightRadius: 5,
        },
      },
      selectMenu: {
        fontFamily: fonts,
        ...inputStyle,
        fontWeight: 600,
        fontSize: 20,
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
    MuiMenuItem: {
      root: {
        fontFamily: fonts,
        ...inputStyle,
        fontWeight: 600,
      },
    },
  },
  props: {
    MuiSelect: {
      variant: "outlined",
    },
  },
});
