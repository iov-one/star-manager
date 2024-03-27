import createPalette, {
  Palette,
  PaletteColor,
} from "@material-ui/core/styles/createPalette";

interface CustomPalette extends Palette {
  accent: PaletteColor;
}

const basePalette: Palette = createPalette({
  action: {
    disabledBackground: "#e3e3e3",
    disabled: "#c1c1c1",
  },
  primary: {
    main: "#5b72b7",
    dark: "#3a50a1",
    contrastText: "#ffffff",
    light: "#e3e3e3",
  },
  secondary: {
    main: "#cdc1e6",
    dark: "#5b6ce1",
    contrastText: "#555555",
    light: "#f7f7f7",
  },
  info: {
    main: "#405182",
    contrastText: "#7F8286",
    dark: "#b292c3",
    light: "#ae90c3",
  },
  success: {
    main: "#69aeff",
  },
  text: {
    primary: "#131e40",
    secondary: "#abadb0",
    hint: "#b9bfcc",
  },
  error: {
    // main: "#ffb968",
    main: "#f44336",
  },
  background: {
    default: "#f0f3f7",
    paper: "white",
  },
});

export const palette: CustomPalette = {
  ...basePalette,
  accent: {
    main: "#eebf40",
    dark: "#ce9f00",
    light: "#fecf80",
    contrastText: "#000000",
  },
};
