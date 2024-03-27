import { useRedirectIfNotPopup } from "hooks/useRedirectIfNotPopup";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";

const TokensCreditResult = (props: RouteComponentProps): null => {
  useRedirectIfNotPopup(props.history);

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (window.opener) {
      const isSuccess = query.get("credit-success");
      const isCancelled = query.get("credit-cancelled");
      const sessionId = query.get("session_id");
      window.opener.postMessage(
        {
          success: isSuccess,
          cancelled: isCancelled,
          sessionId,
        },
        window.location.origin,
      );
      window.close();
    }
  }, []);

  return null;
};

export default withRouter(TokensCreditResult);
