import {
  Button,
  FormHelperText,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Select,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import { Block } from "components/block";
import { Spinner } from "components/Spinner";
import config from "config";
import { POSITIVE_REQUEST_FREE_STARNAME_BUTTON_TESTID } from "constants/requestFreeStarnameTestIds";
import locales from "locales/strings";
import {
  RequestFreeStarnameStore,
  RequestFreeStarnameStoreContext,
} from "mobx/stores/requestFreeStarnameStore";
import { observer } from "mobx-react";
import React from "react";
import styles from "routes/profile/components/RequestFreeStarname/styles.module.scss";
import { selectTheme } from "routes/starnames/components/RegisterForm/selectTheme";
import { GDriveCustodian } from "signers/gdrive/custodian";
import { Wallet } from "signers/wallet";
import { toClassName } from "styles/toClassName";

interface Props {
  readonly wallet: Wallet;
  readonly custodian: GDriveCustodian;
  readonly onClose: () => void;
  readonly onRegistered: () => void;
}

export const RequestFreeStarname: React.FC<Props> = observer(
  (props: Props): React.ReactElement => {
    const store = React.useContext<RequestFreeStarnameStore>(
      RequestFreeStarnameStoreContext,
    );
    const {
      name,
      starname,
      starnameHelperText,
      error,
      queryingStarname,
      validStarname,
      requesting,
      isFormComplete,
    } = store;
    const { onRegistered } = props;
    const { starname: starnameDomains, community: communityDomains } =
      config.basicEditionDomains;
    React.useEffect((): (() => void) | void => {
      return store.queryStarname();
    }, [starname, store]);
    store.setOnSuccessHandler(onRegistered);
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = event.currentTarget;
      // Save the new value
      store.setName(value.toLowerCase());
    };

    const onDomainChange = (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
    ): void => {
      const { value } = event.target;
      store.setDomain(value as string);
    };

    return (
      <Block
        className={toClassName(styles.content, {
          requesting: requesting,
        })}
      >
        <form>
          <fieldset className={styles.group} disabled={requesting}>
            <Block className={styles.groupTitle}>
              <Typography variant={"h4"}>
                {locales.FREE_STARNAME_WINDOW_TITLE}
              </Typography>
            </Block>
            <Block className={styles.field}>
              <label htmlFor={"starname"}>
                {locales.FREE_STARNAME_INPUT_QUESTION}
              </label>
              <Block className={styles.container}>
                <OutlinedInput
                  fullWidth={true}
                  placeholder={locales.FREE_STARNAME_INPUT_PLACEHOLDER}
                  value={name}
                  disabled={requesting}
                  onChange={onNameChange}
                />
                <Block className={styles.dropdown}>
                  <ThemeProvider theme={selectTheme}>
                    <Select value={store.domain} onChange={onDomainChange}>
                      {starnameDomains.map(
                        (domain: string): React.ReactElement => (
                          <MenuItem key={domain} value={domain}>
                            *{domain}
                          </MenuItem>
                        ),
                      )}
                      {communityDomains.length > 0 ? (
                        <ListSubheader className={styles.dropdownSubHeader}>
                          {locales.COMMUNITY}
                        </ListSubheader>
                      ) : null}

                      {[
                        ...communityDomains.map(
                          (domainAss) => domainAss.domain,
                        ),
                      ]
                        .sort((a, b) => a.localeCompare(b))
                        .map(
                          (domain: string): React.ReactElement => (
                            <MenuItem key={domain} value={domain}>
                              *{domain}
                            </MenuItem>
                          ),
                        )}
                    </Select>
                  </ThemeProvider>
                </Block>
              </Block>
              <FormHelperText component={"div"} error={error}>
                <Block
                  className={toClassName(styles.helper, {
                    [styles.valid]: validStarname,
                  })}
                >
                  <Block className={styles.helperIcon}>
                    {queryingStarname ? (
                      <Spinner size={16} />
                    ) : error ? (
                      <i className={"fa fa-exclamation-circle"} />
                    ) : validStarname ? (
                      <i className={"fa fa-check-circle"} />
                    ) : (
                      <i className={"fa fa-icon-sign-blank"} />
                    )}
                  </Block>
                  <Block className={styles.helperText}>
                    {starnameHelperText}
                  </Block>
                </Block>
              </FormHelperText>
            </Block>
            <Block className={styles.buttonsBox}>
              <Button
                disabled={requesting}
                variant={"text"}
                onClick={props.onClose}
              >
                {locales.CANCEL}
              </Button>
              <Button
                disabled={queryingStarname || requesting || !isFormComplete}
                variant={"contained"}
                color={"primary"}
                data-testid={POSITIVE_REQUEST_FREE_STARNAME_BUTTON_TESTID}
                onClick={(): void =>
                  store.requestFreeStarname(props.custodian, props.wallet)
                }
              >
                {requesting ? <Spinner size={22} /> : locales.CREATE}
              </Button>
            </Block>
          </fieldset>
        </form>
      </Block>
    );
  },
);
