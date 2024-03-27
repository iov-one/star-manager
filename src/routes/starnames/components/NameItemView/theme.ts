import { ThemeOptions } from "@material-ui/core";
import theme from "theme";

const options: ThemeOptions = {
  ...theme,

  overrides: {
    MuiMenuItem: {
      root: {
        fontSize: 17,
        lineHeight: "44px",
        height: 44,
        color: theme.palette.primary.main,
        paddingLeft: 8,
        paddingRight: 24,
        fontWeight: 600,
      },
    },
  },
};

export default options;
