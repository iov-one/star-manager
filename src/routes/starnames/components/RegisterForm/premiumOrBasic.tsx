import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { StarnameEdition } from "types/starnameEdition";

interface Props {
  readonly value: StarnameEdition;
  readonly onChange: (value: StarnameEdition) => void;
}

export const PremiumOrBasic: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  return (
    <Block className={"register-form-premium-basic-toggle"}>
      <button
        data-active={props.value === StarnameEdition.Premium}
        type={"button"}
        onClick={(): void => props.onChange(StarnameEdition.Premium)}
      >
        {locales.PREMIUM}
      </button>
      <button
        data-active={props.value === StarnameEdition.Basic}
        type={"button"}
        onClick={(): void => props.onChange(StarnameEdition.Basic)}
      >
        {locales.BASIC}
      </button>
    </Block>
  );
};
