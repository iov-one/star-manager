import "./styles.scss";

import { Block } from "components/block";
import { Spinner } from "components/Spinner";
import { LOADING_SCREEN_TESTID } from "constants/commonTestIds";
import React from "react";

export const LoadingView: React.FC = (): React.ReactElement => {
  return (
    <Block data-testid={LOADING_SCREEN_TESTID} className={"loading-view"}>
      <Spinner size={64} />
    </Block>
  );
};
