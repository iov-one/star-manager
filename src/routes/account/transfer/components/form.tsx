import {
  FormHelperText,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Block } from "components/block";
import strings from "locales/strings";
import locales from "locales/strings";
import { observer } from "mobx-react";
import React from "react";
import { NameType } from "types/nameType";

import {
  AccountTransferFlagOptions,
  DomainTransferFlagOptions,
} from "../helpers";

interface Props {
  readonly type: NameType;
  readonly error: string | undefined;
  readonly recipient: string;
  readonly executing: boolean;
  readonly domainType?: string;
  readonly onRecipientChange: (recipient: string) => void;
  readonly onTransferFlagChange: (flag: 0 | 1 | 2) => void;
}

export const TransferForm: React.FC<Props> = observer(
  (props: Props): React.ReactElement => {
    const getDefaultFlag = (): 0 | 1 | 2 => {
      if (props.type === NameType.Account) return 1;
      if (!props.domainType) return 0;
      return props.domainType === "open" ? 2 : 0;
    };

    const [flag, setFlag] = React.useState<0 | 1 | 2>(getDefaultFlag() || 0);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = event.target;
      props.onRecipientChange(value);
    };

    const onFlagChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = event.target;
      setFlag(parseInt(value) as any);
    };

    React.useEffect(() => {
      props.onTransferFlagChange(flag);
    }, [flag]);

    return (
      <Paper className={"account-operation-view-form-paper"}>
        <Block className={"account-operation-view-form-content"}>
          <Typography variant={"h4"}>
            {locales.TRANSFER_ASK_FOR_NEW_OWNER}
          </Typography>
          <Block marginTop={24}>
            <Typography variant={"subtitle1"} component={"span"}>
              {locales.TRANSFER_NEW_OWNER_ADDRESS_OR_STARNAME}
            </Typography>
          </Block>
          <Block marginTop={8}>
            <TextField
              name={"recipient"}
              disabled={props.executing}
              error={props.error !== undefined}
              value={props.recipient}
              onChange={onChange}
              placeholder={locales.STARNAME_OR_ADDRESS}
              margin={"none"}
              autoFocus={true}
              fullWidth={true}
            />
            {props.type === NameType.Domain &&
            props.domainType === "open" ? null : (
              <Accordion variant="outlined">
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{strings.MORE_OPTIONS}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl style={{ marginTop: -32 }}>
                    {props.type === NameType.Domain ? (
                      <React.Fragment>
                        <FormLabel>{strings.SELECT_TRANSFER_FLAG}</FormLabel>
                        <RadioGroup onChange={onFlagChange} value={flag}>
                          {DomainTransferFlagOptions.map((option) => (
                            <FormControlLabel
                              key={`domain-transfer-flag-${option.value}`}
                              control={<Radio />}
                              value={option.value}
                              label={
                                getDefaultFlag() === option.value
                                  ? `(default) ${option.label}`
                                  : option.label
                              }
                            />
                          ))}
                        </RadioGroup>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <FormLabel>{strings.RESET_DATA}</FormLabel>
                        <RadioGroup onChange={onFlagChange} value={flag}>
                          {AccountTransferFlagOptions.map((option) => (
                            <FormControlLabel
                              key={`account-transfer-flag-${option.value}`}
                              control={<Radio />}
                              value={option.value}
                              label={
                                getDefaultFlag() === option.value
                                  ? `(default) ${option.label}`
                                  : option.label
                              }
                            />
                          ))}
                        </RadioGroup>
                      </React.Fragment>
                    )}
                  </FormControl>
                </AccordionDetails>
              </Accordion>
            )}
            <FormHelperText error={props.error !== undefined}>
              {
                props.error !== undefined
                  ? props.error
                  : " " /* This extra space prevents the form from jumping */
              }
            </FormHelperText>
          </Block>
        </Block>
      </Paper>
    );
  },
);
