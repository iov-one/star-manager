import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  lighten,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/styles";
import { Block } from "components/block";
import locales from "locales/strings";
import { ViewOnlySignInStore } from "mobx/stores/viewOnlySignInStore";
import { observer } from "mobx-react";
import React from "react";

interface Props {
  disabled: boolean;
  onSignIn: (address: string) => void;
}

const useAccordion = makeStyles(({ palette }: Theme) => ({
  root: {
    color: palette.text.primary,
    borderColor: lighten(palette.primary.main, 0.85),
    borderRadius: 4,
    padding: 0,
    "&::before": {
      content: "none",
    },
  },
}));

const useStyles = makeStyles({
  input: {
    width: "100%",
  },
});

export const ViewOnlyButton: React.FC<Props> = observer(
  (props: Props): React.ReactElement => {
    const [store] = React.useState<ViewOnlySignInStore>(
      new ViewOnlySignInStore(),
    );
    const accordion = useAccordion();
    const classes = useStyles();
    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = event.target;
      store.setValue(value);
    };
    const onGoClick = (): void => {
      if (store.address === null) {
        throw new Error("the user is not supposed to click now");
      } else {
        // We are 100% sure that address isn't null
        props.onSignIn(store.address);
      }
    };
    const isValidAddress = (address: string): boolean => {
      if (address === null || address === undefined) return false;
      return address.length !== 0;
    };

    return (
      <Accordion
        classes={accordion}
        disabled={props.disabled}
        variant={"outlined"}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant={"subtitle1"}>
            {locales.VIEW_ONLY_MODE}
          </Typography>
        </AccordionSummary>
        <form onSubmit={onGoClick}>
          <AccordionDetails>
            <Block padding={16} width={"100%"}>
              <Block marginBottom={16}>
                <Typography variant={"subtitle1"}>
                  {locales.VIEW_ONLY_MODE_TEXTFIELD}
                </Typography>
              </Block>
              <TextField
                autoFocus={true}
                value={store.value}
                className={classes.input}
                onChange={onChange}
              />
            </Block>
          </AccordionDetails>
          <AccordionActions>
            <Button
              color={"primary"}
              disabled={!isValidAddress(store.address)}
              type="submit"
            >
              {locales.VIEW_ONLY_MODE_SUBMIT}
            </Button>
          </AccordionActions>
        </form>
      </Accordion>
    );
  },
);
