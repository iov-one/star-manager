import { useRedirectIfNotPopup } from "hooks/useRedirectIfNotPopup";
import QueryString from "query-string";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";

const InstagramAuthPopup = (props: RouteComponentProps): null => {
  useRedirectIfNotPopup(props.history);

  React.useEffect(() => {
    const params = QueryString.parse(window.location.search);
    if (params.error) {
      const errorMessage =
        params.error_description || "Login failed. Please try again.";
      window.opener &&
        window.opener.postMessage(
          {
            error: params.error,
            errorMessage,
          },
          window.location.origin,
        );
      // Close if user denied login
      if (params.error === "user_denied") {
        window.close();
      }
    }
    if (params.code) {
      window.opener &&
        window.opener.postMessage(
          { code: params.code },
          window.location.origin,
        );
      window.close();
    }
  }, []);

  return null;
};

export default withRouter(InstagramAuthPopup);
