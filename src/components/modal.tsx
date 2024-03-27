import { ThemeProvider } from "@material-ui/core";
import React from "react";
import ReactDOM from "react-dom";
import theme from "theme";

type CloseFn = () => void;

const modal = {
  show: (component: React.ReactElement): CloseFn => {
    const { body } = document;
    const element: HTMLDivElement = document.createElement("div");
    // Make it the modal container element
    element.setAttribute("class", "modal-container-updated");
    // We must add it to the body before rendering
    body.appendChild(element);
    // Render it, util it's closed
    ReactDOM.render(
      <ThemeProvider theme={theme}>{component}</ThemeProvider>,
      element,
    );
    return () => {
      // This is the close function
      if (element.parentNode === body) {
        body.removeChild(element);
      }
    };
  },
};

export default modal;
