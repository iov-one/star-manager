import { darken, lighten, makeStyles, Theme } from "@material-ui/core";
import { ImageLoader } from "hooks/useImageLoader";

export default makeStyles(({ palette }: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    marginTop: 120,
    backgroundColor: palette.secondary.dark,
    color: palette.primary.contrastText,
    padding: 24,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  content: {
    backgroundColor: palette.background.paper,
    padding: 24,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  field: {
    marginTop: 16,
    width: "100%",
  },
  defaultInput: {
    flex: 1,
    width: "100%",
    background: "rgba(0, 0, 0, 0.05)",
    borderRadius: 5,
    overflow: "hidden",
    "& input, & textarea": {
      backgroundColor: "transparent",
    },
    "& fieldset": {
      border: "none",
    },
  },
  verifyButton: {
    width: 100,
    background: "none",
    height: 50,
    marginLeft: 8,
    "& img": {
      width: 24,
      height: 24,
    },
  },
  defaultInputLabel: {
    marginBottom: 8,
  },
  sectionTitle: {
    margin: 24,
    textAlign: "center",
  },
  nameInput: {
    width: "100%",
    paddingRight: 24,
    paddingLeft: 24,
    lineHeight: "52px",
    "& input": {
      background: darken(palette.secondary.dark, 0.075),
      border: "none",
      borderRadius: 5,
      color: palette.primary.contrastText,
      fontSize: 34,
      fontWeight: 600,
      textAlign: "center",
    },
    "& fieldset": {
      border: "none",
    },
  },
  form: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: 40,
  },
  leftPanel: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  starname: {
    margin: 12,
    textAlign: "center",
  },
  imageSpinner: {
    display: (props: ImageLoader): string => (props.loaded ? "none" : "flex"),
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    zIndex: 1,
    "& div": {
      width: 48,
      height: 48,
      borderWidth: 6,
      borderTopColor: "rgba(0, 0, 0, 0.15)",
      borderLeftColor: "rgba(0, 0, 0, 0.15)",
      borderStyle: "solid",
      borderColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 24,
      animationName: "spin",
      animationDuration: "1s",
      animationIterationCount: "infinite",
      animationTimingFunction: "linear",
    },
  },
  image: {
    position: "relative",
    overflow: "hidden",
    width: 160,
    height: 160,
    margin: "auto",
    // -(80 + parent padding -> 24)
    marginTop: -104,
    borderRadius: 80,
    background: "linear-gradient(180deg, #787DF7 0%, #9BDEF3 100%)",
    "& img": {
      position: "absolute",
      left: 15,
      top: 15,
      opacity: (props: ImageLoader): number | undefined =>
        props ? (props.loaded ? 1 : 0.3) : 0,
      borderRadius: 65,
      overflow: "hidden",
      width: 130,
      height: 130,
    },
  },
  buttonBox: {
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#b292c3",
    color: palette.primary.contrastText,
    "&:hover": {
      backgroundColor: darken("#b292c3", 0.15),
    },
    "&:disabled": {
      opacity: 0.5,
      color: lighten(palette.text.primary, 0.6),
      backgroundColor: palette.primary.light,
    },
  },
  button: {
    width: 300,
    height: 40,
    marginTop: 16,
  },
  addRemoveButton: {
    display: "block",
    backgroundColor: palette.success.main,
    color: palette.primary.contrastText,
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "1%",
    lineHeight: "26px",
    paddingLeft: 16,
    paddingRight: 16,
    margin: "auto",
    marginTop: 24,
    minWidth: "40%",
    "&:disabled": {
      opacity: 0.2,
      color: palette.primary.contrastText,
    },
  },
  optionalTag: {
    fontSize: 12,
    color: palette.info.contrastText,
    margin: 16,
  },
}));
