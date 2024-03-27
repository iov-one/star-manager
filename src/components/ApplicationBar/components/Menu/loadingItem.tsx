import { Spinner } from "components/Spinner";
import React from "react";

interface Props {}

export const LoadingItem: React.FC<Props> = React.forwardRef(
  (): React.ReactElement => {
    return (
      <div className={"application-bar-menu-loading-item"}>
        <Spinner size={32} />
      </div>
    );
  },
);
