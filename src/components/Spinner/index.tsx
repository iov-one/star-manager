import "./styles.scss";

import { Block } from "components/block";
import { Tick } from "components/Spinner/tick";
import React from "react";

interface Props {
  readonly size?: number;
  readonly className?: string;
}

export const Spinner: React.FC<Props> = (props: Props): React.ReactElement => {
  const ticks: ReadonlyArray<any> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const { size = window.innerWidth / 6 } = props;
  return (
    <Block width={size} height={size} className={props.className}>
      <Block className={"spinner container"}>
        {ticks.map(
          (_: any, index: number): React.ReactElement => (
            <Tick key={index} number={index} />
          ),
        )}
      </Block>
    </Block>
  );
};
