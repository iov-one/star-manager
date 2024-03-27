import "./style.scss";

import { LoadingView } from "components/LoadingView";
import React from "react";

const StarnameProfileLoading = (): React.ReactElement => {
  return (
    <div className="profile-view-loading-container">
      <LoadingView />
    </div>
  );
};

export default StarnameProfileLoading;
