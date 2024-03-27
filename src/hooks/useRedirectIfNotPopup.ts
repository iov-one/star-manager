import { History } from "history";
import React from "react";

export const useRedirectIfNotPopup = (
  history: History,
  close = false,
): void => {
  React.useEffect(
    (): void => {
      if (window.opener !== null && window.opener !== window) {
        if (close) {
          window.close();
        }
      } else {
        // Means we do not show this
        history.replace("/");
      }
    } /* We intentionally don't pass dependencies because this is suppose to run always */,
  );
};
