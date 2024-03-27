import "./styles.scss";

import { Button, Typography } from "@material-ui/core";
import { Block } from "components/block";
import deepEqual from "fast-deep-equal";
import locales from "locales/strings";
import React from "react";

const numbers = new Array(24)
  .fill(0)
  .map((value: number, index: number): number => value + index);

export const DisplayMnemonic: React.FC = (): React.ReactElement => {
  const [scrambled, setScrambled] = React.useState<ReadonlyArray<number>>(
    [...numbers].sort((): number => Math.random() - 0.5),
  );
  const [currentTab, setCurrentTab] = React.useState<number>(0);
  const [selection, setSelection] = React.useState<ReadonlyArray<number>>([]);
  const isReadyForSubmission = React.useMemo(
    (): boolean => deepEqual(selection, numbers),
    [selection],
  );
  React.useEffect((): void => {
    if (currentTab === 1) {
      setScrambled([...numbers].sort((): number => Math.random() - 0.5));
      setSelection([]);
    }
  }, [currentTab]);
  const onSelected = (which: number): void => {
    const index: number = selection.findIndex(
      (each: number): boolean => each === which,
    );
    if (index === -1) {
      setSelection([...selection, which]);
    } else {
      setSelection([
        ...selection.slice(0, index),
        ...selection.slice(index + 1),
      ]);
    }
  };
  return (
    <Block className={"google-drive-mnemonic"}>
      <Block
        className={[
          "google-drive-mnemonic-tab",
          ...(currentTab === 0 ? ["visible", "first"] : ["first"]),
        ].join(" ")}
      >
        <Block className={"google-drive-mnemonic-tab-content"}>
          <Typography variant={"h4"}>
            {locales.THIS_IS_YOUR_MNEMONIC}
          </Typography>
          <Typography variant={"subtitle1"}>
            {locales.PLEASE_WRITE_YOUR_MENMONIC_IN_PAPER}
          </Typography>
          <Block className={"google-drive-mnemonic-words"}>
            {numbers.map((key: number): React.ReactElement => {
              return (
                <div
                  key={key}
                  className={"google-drive-mnemonic-words-word selected"}
                  data-key={"word-" + key}
                />
              );
            })}
          </Block>
          {/* TODO : Handle cancel properly from Gdrive */}
          <Block className={"google-drive-mnemonic-buttons"}>
            <Button
              variant={"contained"}
              onClick={(): void => window.close()}
              data-button={"reject"}
            >
              {locales.CANCEL}
            </Button>
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={(): void => setCurrentTab(1)}
            >
              {locales.NEXT}
            </Button>
          </Block>
        </Block>
      </Block>
      <Block
        className={[
          "google-drive-mnemonic-tab",
          ...(currentTab === 1 ? ["visible", "second"] : ["second"]),
        ].join(" ")}
      >
        <Block className={"google-drive-mnemonic-tab-content"}>
          <Typography variant={"h4"}>
            {locales.PLEASE_CHECK_TO_CONFIRM}
          </Typography>
          <Typography variant={"subtitle1"}>
            {locales.CLICK_IN_THE_CORRECT_ORDER}
          </Typography>
          <Block className={"google-drive-mnemonic-words"}>
            {scrambled.map((key: number): React.ReactElement => {
              return (
                <div
                  key={key}
                  data-key={"word-" + key}
                  className={[
                    "google-drive-mnemonic-words-word",
                    ...(selection.includes(key) ? ["selected"] : []),
                  ].join(" ")}
                  onClick={(): void => onSelected(key)}
                />
              );
            })}
          </Block>
          <Block className={"google-drive-mnemonic-buttons"}>
            <Button
              variant={"contained"}
              onClick={(): void => setCurrentTab(0)}
            >
              {locales.BACK}
            </Button>
            <Button
              variant={"contained"}
              color={"primary"}
              disabled={!isReadyForSubmission}
              data-button={"accept"}
            >
              {locales.DONE}
            </Button>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};
