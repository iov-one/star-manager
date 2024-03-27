import { createTheme, lighten } from "@material-ui/core";
import { palette } from "theme/palette";

const fonts: string = ['"Muli"', "sans-serif"].join(", ");

export const dimensions: { [key: string]: number | string } = {
  headerHeight: 0,
  menuWidth: 280,
};

export default createTheme({
  palette: palette,
  typography: {
    fontFamily: fonts,
    subtitle2: {
      fontFamily: fonts,
      fontWeight: 500,
      fontSize: 14,
      letterSpacing: 0.66667,
      lineHeight: "18px",
    },
    subtitle1: {
      fontFamily: fonts,
      fontWeight: 600,
      fontSize: 16,
      lineHeight: "20px",
    },
    h4: {
      fontSize: 24,
      fontWeight: 600,
      fontFamily: fonts,
      lineHeight: "30px",
    },
    h5: {
      fontSize: 20,
      fontWeight: 600,
      fontFamily: fonts,
    },
    h6: {
      fontSize: 19,
      fontWeight: 600,
      fontFamily: fonts,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        height: 45,
        fontWeight: 600,
        borderRadius: 4,
        textTransform: "none",
        fontSize: 16,
      },
      label: {
        height: 45,
        lineHeight: "45px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      text: {
        backgroundColor: palette.primary.light,
      },
    },
    MuiFormControl: {
      root: {
        display: "flex",
        marginTop: 8,
        marginBottom: 8,
      },
    },
    MuiFormLabel: {
      root: {
        color: palette.text.primary,
        fontSize: 14,
        marginTop: 8,
        marginBottom: 8,
      },
    },
    MuiOutlinedInput: {
      notchedOutline: {
        borderRadius: 5,
        borderColor: palette.primary.light,
        "&#disabled": {
          borderColor: "red",
        },
        top: 0,
      },
      adornedEnd: {
        fontSize: 20,
        lineHeight: "50px",
      },
      multiline: {
        padding: 15,
      },
      inputMultiline: {
        lineHeight: "25px",
        // Minimum 3 lines
        minHeight: "75px",
      },
      input: {
        padding: "0 15px",
        height: 50,
        lineHeight: "50px",
        fontSize: 20,
        "&:-webkit-autofill::first-line": {
          fontFamily: fonts,
          fontSize: 20,
        },
      },
    },
    MuiList: {
      root: {
        display: "list-item",
      },
    },
    MuiListItem: {
      root: {
        backgroundColor: "inherit",
        border: "none",
        listStyle: "disc inside",
        fontSize: "1.6rem",
        color: palette.text.primary,
      },
    },
    MuiLink: {
      root: {
        cursor: "pointer",
        textDecoration: "underline",
      },
      underlineHover: {
        textDecoration: "underline",
      },
    },
    MuiSelect: {
      outlined: {
        border: 0,
      },
      selectMenu: {
        paddingLeft: 11,
        paddingRight: 11,
        fontSize: 16,
        background: "#f7f7f7",
      },
      iconOutlined: {
        right: 0,
      },
      icon: {
        fill: palette.primary.main,
      },
    },
    MuiTab: {
      root: {
        padding: "6px 0",
        "@media(min-width: 880px)": {
          minWidth: 0,
        },
      },
      wrapper: {
        textTransform: "none",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: "18px",
        color: palette.text.primary,
      },
    },
    MuiTabs: {
      indicator: {
        top: "50%",
        marginTop: 12 /* line-height + 3 */,
        height: 4,
        borderRadius: 2,
        backgroundColor: palette.primary.main,
      },
    },
    MuiFormHelperText: {
      root: {
        marginTop: 8,
        fontFamily: fonts,
        fontSize: 14,
        lineHeight: "18px",
        fontWeight: 600,
        letterSpacing: 0.666667,
      },
    },
    MuiPaper: {
      elevation1: {
        boxShadow: `0px 4px 16px -5px ${lighten(palette.primary.main, 0.5)}`,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.info.main,
      },
      elevation0: {
        border: "none",
        background: "none",
      },
      outlined: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.primary.light,
      },
      rounded: {
        borderRadius: 5,
      },
    },
    MuiAccordion: {
      root: {
        border: "none",
        backgroundColor: "transparent",
        boxShadow: "none",
        "&::before": {
          content: "none",
        },
      },
    },
    MuiAccordionSummary: {
      root: {
        minHeight: undefined,
        justifyContent: "center",
        height: 45,
        "&$expanded": {
          height: 45,
          minHeight: 0,
        },
      },
      expandIcon: {
        width: 32,
        height: 32,
      },
      content: {
        flexGrow: 0,
        minHeight: undefined,
        height: 45,
        alignItems: "center",
        margin: 0,
        "&$expanded": {
          margin: 0,
        },
      },
    },
    MuiAccordionDetails: {
      root: {
        marginTop: 24,
        padding: 0,
      },
    },
  },
  props: {
    MuiButton: {
      disableRipple: true,
      disableElevation: true,
    },
    MuiTextField: {
      variant: "outlined",
    },
    MuiSelect: {
      variant: "outlined",
    },
    MuiTab: {
      disableRipple: true,
    },
  },
});
