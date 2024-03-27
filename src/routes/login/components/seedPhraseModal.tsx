import "./style.scss";

import {
  Button,
  FormHelperText,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { validateMnemonic } from "bip39";
import { Block } from "components/block";
import strings from "locales/strings";
import locales from "locales/strings";
import React from "react";
import { WELCOME } from "routes/paths";

interface Props {
  readonly onSignIn: (phrase: string) => void;
  readonly onCancel: () => void;
}

export const SeedPhraseModal: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const [seedPhrase, setSeedPhrase] = React.useState<string>("");
  const [isValidPhrase, setIsValidPhrase] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const onSubmit = (): void => {
    props.onSignIn(seedPhrase);
  };
  React.useEffect((): (() => void) => {
    const timeout = setTimeout((): void => checkSeedPhrase(seedPhrase), 500);
    return (): void => {
      clearTimeout(timeout);
    };
  }, [seedPhrase]);
  const checkSeedPhrase = (phrase: string): void => {
    const wordCount = phrase.split(/[\s\t ]+/).length;
    if (wordCount < 12 && wordCount % 3 !== 0) {
      setIsValidPhrase(false);
      setHasError(false);
    } else {
      const isValid = validateMnemonic(phrase);
      setIsValidPhrase(isValid);
      setHasError(!isValid);
    }
  };
  const onTextChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSeedPhrase(event.target.value);
  };
  return (
    <Paper elevation={5}>
      <Block className={"seed-phrase-container"}>
        <Typography variant={"h6"}>
          {strings.PLEASE_INPUT_YOUR_SEED_PHRASE}
        </Typography>
        <TextField
          multiline={true}
          spellCheck={false}
          onChange={onTextChange}
        />
        {hasError ? (
          <FormHelperText error={true}>
            <Block className={"seed-phrase-error"}>
              {strings.PLEASE_CHECK_THAT_THERE_IS_NO_TYPO_OR_MISSING_WORDS}
            </Block>
          </FormHelperText>
        ) : null}
        <Block className={"seed-phrase-buttons-box"}>
          <Button onClick={props.onCancel}>{strings.CANCEL}</Button>
          {seedPhrase ? (
            <Button
              variant={"contained"}
              color={"primary"}
              disabled={!isValidPhrase}
              onClick={onSubmit}
            >
              {strings.CONTINUE}
            </Button>
          ) : (
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={() => window.location.assign(WELCOME)}
            >
              {locales.OR_CREATE_NEW_ACCOUNT}
            </Button>
          )}
        </Block>
      </Block>
    </Paper>
  );
};
