import React from "react";
import styles from "routes/welcome/stepper/styles.module.scss";
import { toClassName } from "styles/toClassName";

interface Props {
  readonly title: string;
  readonly ordinal: number;
  readonly active: boolean;
}

export const StepIndicator: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  return (
    <div
      className={toClassName(styles.stepIndicator, {
        [styles.active]: props.active,
      })}
    >
      <div className={styles.ordinal}>{props.ordinal}</div>
      <div className={styles.title}>{props.title}</div>
    </div>
  );
};
