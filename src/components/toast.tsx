import { Typography } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { Block } from "components/block";
import React from "react";
import ReactDOM from "react-dom";
import theme from "theme";

const toastDisplayTime = 4;
export enum ToastType {
  Error = "error",
  Success = "success",
  Warning = "warning",
}

type CloseFn = () => void;

const colors: { [key in ToastType]: string } = {
  [ToastType.Error]: "#f17f5c",
  [ToastType.Success]: "#09d69e",
  [ToastType.Warning]: "#ffb96b",
};

const icons: { [key in ToastType]: string } = {
  [ToastType.Error]: "/assets/icons/toast-error.svg",
  [ToastType.Success]: "/assets/icons/toast-success.svg",
  [ToastType.Warning]: "/assets/icons/toast-warning.svg",
};

const styles = {
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
    width: 64,
    height: 64,
    backgroundColor: "white",
    borderRadius: 32,
  },
  image: {
    display: "block",
    maxWidth: 24,
    maxHeight: 24,
  },
  text: {
    color: "white",
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: "132%",
    padding: 16,
  },
  closeX: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
};

const toast = {
  show: (
    message: string | React.ReactElement,
    type: ToastType,
    time = toastDisplayTime,
  ): CloseFn => {
    const { body } = document;
    // remove any existing element(s)
    const elements = document.getElementsByClassName("alert-toast");
    Array.from(elements).forEach((element) => {
      body.removeChild(element);
    });
    const element: HTMLDivElement = document.createElement("div");
    // Prepare the class for styling
    element.setAttribute("class", ["alert-toast", type].join(" "));
    // Append before rendering
    body.appendChild(element);
    // Set the timer for auto-removing toast
    const timer = setTimeout(() => {
      close();
    }, 1000 * time);
    // Close function
    const close: CloseFn = (): void => {
      clearTimeout(timer);
      body.removeChild(element);
    };
    // Render it now
    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <Block
          display={"flex"}
          flexDirection={"row"}
          width={"100%"}
          height={"100%"}
          backgroundColor={colors[type]}
          padding={24}
          alignItems={"center"}
        >
          <div style={styles.icon}>
            <img src={icons[type]} alt={type} style={styles.image} />
          </div>
          <Typography component={"div"} style={styles.text}>
            {message}
          </Typography>
          <div style={styles.closeX} onClick={close}>
            <img
              src={"/assets/icons/toast-x.svg"}
              alt={type}
              style={styles.image}
            />
          </div>
        </Block>
      </ThemeProvider>,
      element,
    );
    return close;
  },
};

export default toast;
