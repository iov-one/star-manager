import React from "react";

interface Props {
  readonly number: number;
}

export const Tick: React.FC<Props> = (props: Props): React.ReactElement => {
  return <div className={"tick"} data-number={props.number} />;
};
