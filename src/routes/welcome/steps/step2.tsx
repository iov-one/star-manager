import strings from "locales/strings";
import { WelcomeStore, WelcomeStoreContext } from "mobx/stores/welcomeStore";
import { observer } from "mobx-react";
import React from "react";
import styles from "routes/welcome/styles.module.scss";
import { toClassName } from "styles/toClassName";

interface Props {
  readonly title: string;
}

export const Step2: React.FC<Props> = observer((): React.ReactElement => {
  const store = React.useContext<WelcomeStore>(WelcomeStoreContext);
  const { words } = store;

  const scrambled = React.useMemo(
    (): ReadonlyArray<string> =>
      words
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value),
    [words],
  );

  const activateWord = (word: string): void => store.toggleWord(word);

  React.useEffect((): void => {
    store.resetSelection();
  }, [store]);

  return (
    <div>
      <h1>{strings.WELCOME_FLOW_STEP2_TITLE}</h1>
      <h4>{strings.WELCOME_FLOW_STEP2_MESSAGE}</h4>
      <div className={styles.mnemonic}>
        {scrambled.map(
          (word: string): React.ReactElement => (
            <span
              key={word}
              onClick={(): void => activateWord(word)}
              className={toClassName(styles.mnemonicWord, {
                [styles.inactiveWord]: !store.isWordSelected(word),
              })}
            >
              {word}
            </span>
          ),
        )}
      </div>
    </div>
  );
});
