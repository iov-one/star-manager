import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import { Spinner } from "components/Spinner";
import locales from "locales/strings";
import React, { PropsWithChildren } from "react";

interface Props {
  readonly loading: boolean;
  readonly empty: boolean;
}

export const ContentWrapper: React.FC<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>,
): React.ReactElement => {
  if (props.loading) {
    return (
      <Block className={"balance-view-title empty"}>
        <Typography variant={"subtitle1"}>
          <Block className={"balance-view-title-loading"}>
            <Spinner size={24} />
            <Block className={"balance-view-title-loading-text"}>
              {locales.LOADING_BALANCES}
            </Block>
          </Block>
        </Typography>
      </Block>
    );
  } else if (props.empty) {
    return (
      <Block className={"balance-view-title empty"}>
        <Typography variant={"subtitle1"}>
          <Block className={"balance-view-title-loading"}>
            <Block className={"balance-view-title-loading-text"}>
              {locales.YOU_HAVE_NO_CURRENCIES}
            </Block>
          </Block>
        </Typography>
      </Block>
    );
  } else {
    return <>{props.children}</>;
  }
};
