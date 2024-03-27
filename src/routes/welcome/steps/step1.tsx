import strings from "locales/strings";
import React from "react";
import styles from "routes/welcome/styles.module.scss";

interface Props {
  readonly words: ReadonlyArray<string>;
  readonly title: string;
}

export const Step1: React.FC<Props> = (props: Props): React.ReactElement => {
  const { words } = props;
  return (
    <div>
      <h1>{strings.WELCOME_FLOW_STEP1_TITLE}</h1>
      <h4>{strings.WELCOME_FLOW_STEP1_MESSAGE}</h4>
      <div className={styles.mnemonic}>
        {words.map(
          (word: string): React.ReactElement => (
            <span key={word} className={styles.mnemonicWord}>
              {word}
            </span>
          ),
        )}
      </div>
    </div>
  );
};
