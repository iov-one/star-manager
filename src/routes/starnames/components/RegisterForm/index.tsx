import "./styles.scss";

import {
  FormHelperText,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Select,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import api from "api";
import shield from "assets/shield.svg";
import BasicButtons from "components/basicButtons";
import { Block } from "components/block";
import PageContent from "components/PageContent";
import toast, { ToastType } from "components/toast";
import TransactionDetails from "components/TransactionDetails";
import { TxResultToastContent } from "components/txResultToastContent";
import config from "config";
import {
  NEGATIVE_REGISTER_BUTTON_TESTID,
  POSITIVE_REGISTER_BUTTON_TESTID,
} from "constants/registerFormTestIds";
import { useWallet } from "contexts/walletContext";
import { FormStatus } from "forms";
import useStarnameValidator, { isEscrowData } from "hooks/useStarnameValidator";
import { useTxPromiseHandler } from "hooks/useTxPromiseHandler";
import { REGISTER_STARNAME_TOOLTIP } from "locales/componentStrings";
import locales from "locales/strings";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import {
  getPrice,
  // RegisterDomainTypes,
} from "routes/starnames/components/RegisterForm/helpers";
import { PremiumOrBasic } from "routes/starnames/components/RegisterForm/premiumOrBasic";
import { RegisterFormHeading } from "routes/starnames/components/RegisterForm/registerFormHeading";
import { selectTheme } from "routes/starnames/components/RegisterForm/selectTheme";
import { Star } from "routes/starnames/components/RegisterForm/star";
import { GasEstimatorContext } from "signers/gasEstimator";
import { GDriveCustodianContext } from "signers/gdrive/context";
import { GDriveCustodian } from "signers/gdrive/custodian";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { NameType } from "types/nameType";
import { isFee, PostTxResult } from "types/postTxResult";
import { StarnameEdition } from "types/starnameEdition";
import captureEvent from "utils/captureEvent";
import { handleTxError } from "utils/handleTxError";
import sendConfirmationEmail from "utils/sendConfirmationEmail";
import { ZERO_FEE } from "utils/zeroFee";

import EscrowDetails from "./EscrowDetails";

// enum DomainType {
//   Closed,
//   Open,
// }

interface Props extends RouteComponentProps<{ domain?: string }> {
  readonly domain?: string;
}

const RegisterForm: React.FC<Props> = (props: Props): React.ReactElement => {
  const { match } = props;
  const { domain: domainName } = match.params;
  const { starname: starnameDomains, community: communityDomains } =
    config.basicEditionDomains;
  const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
  const custodian = React.useContext<GDriveCustodian>(GDriveCustodianContext);

  const [handler] = useTxPromiseHandler();

  // FIXME: currently closed domains are restricted
  const [closed] = React.useState<boolean>(true);
  const [value, setValue] = React.useState<string>(
    sessionStore.urlQueriedStarname,
  );
  const [thinking, setThinking] = React.useState<boolean>(false);
  const [edition, setEdition] = React.useState<StarnameEdition>(
    StarnameEdition.Premium,
  );
  const [domain, setDomain] = React.useState<string>(
    domainName || starnameDomains[0],
  );
  const [fee, setFee] = React.useState(ZERO_FEE);
  // const [domainType] = React.useState<DomainType>(DomainType.Closed);

  const estimator = React.useContext<Wallet>(GasEstimatorContext);

  const type: NameType = React.useMemo((): NameType => {
    if (domainName !== undefined) return NameType.Account;
    if (edition === StarnameEdition.Premium) {
      return NameType.Domain;
    } else {
      return NameType.Account;
    }
  }, [edition, domainName]);

  const registeredStarname: string = React.useMemo((): string => {
    if (domainName) return `${value}*${domainName}`;
    switch (type) {
      case NameType.Account:
        return `${value}*${domain}`;
      case NameType.Domain:
        return `*${value}`;
    }
  }, [domain, domainName, type, value]);

  const { status, data, error } = useStarnameValidator(value, domain, type);
  const wallet: Wallet = useWallet();

  const createSubmitFn =
    (wallet: Wallet) => async (): Promise<PostTxResult> => {
      // if available from another user
      // generate escrow tx
      if (status === FormStatus.AvailableFromEscrow && isEscrowData(data)) {
        const {
          escrow: { id, price },
        } = data;
        return wallet.transferToEscrow(
          id,
          Amount.from(Math.ceil(parseFloat(price[0].amount))),
        );
      }
      if (type === NameType.Domain) {
        return wallet.registerDomain(
          value,
          closed ? "closed" : "open",
          status === FormStatus.AvailableAfterExpiry,
        );
      } else if (type === NameType.Account && domain !== undefined) {
        return wallet.registerAccount(
          value,
          domain,
          status === FormStatus.AvailableAfterExpiry,
        );
      } else {
        throw new Error("Type of domain is undefined");
      }
    };

  // React.useEffect(() => {
  //   setClosed(domainType === DomainType.Closed ? true : false);
  // }, [domainType]);

  // run only on status change
  React.useEffect(() => {
    const emulate = createSubmitFn(estimator);
    emulate().then((fee: PostTxResult | undefined): void => {
      if (isFee(fee)) {
        if (status === FormStatus.AvailableFromEscrow) {
          const apiFees = api.getFees();
          setFee({
            gas: fee.gas,
            amount: Amount.from(apiFees.transferToEscrow / apiFees.feeCoinPrice)
              .toCoins()
              .concat(fee.amount),
          });
        } else {
          setFee(fee);
        }
      }
    });
  }, [status]);

  const sendEmail = async (starname: string): Promise<void> => {
    if (wallet.getSignerType() === SignerType.Google) {
      const status = await sendConfirmationEmail(
        starname,
        custodian.getIdToken(),
      );
      if (!status) {
        console.error("failed sending email");
      }
    }
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    const { history } = props;
    const submit = createSubmitFn(wallet);
    event.preventDefault();
    setThinking(true);
    handler(submit())
      .then((txId): void => {
        toast.show(
          <TxResultToastContent
            txId={txId}
            text={
              (status === FormStatus.AvailableFromEscrow
                ? locales.PURCHASED_SUCCSSFULLY
                : locales.CREATED_SUCCESSFULLY) + registeredStarname
            }
          />,
          ToastType.Success,
        );
        sendEmail(registeredStarname);
        captureEvent(txId);
        sessionStore.setQueriedStarname(null);
        sessionStore
          .refreshAccounts()
          .then(() => {
            history.goBack();
          })
          .catch(console.warn);
      })
      .catch(handleTxError)
      .finally((): void => {
        setThinking(false);
      });
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setValue(value.toLowerCase());
  };

  const onDomainChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ): void => {
    const { value } = event.target;
    setDomain(value as string);
  };
  const price: Amount | undefined = React.useMemo((): Amount | undefined => {
    if (status === FormStatus.AvailableFromEscrow && isEscrowData(data)) {
      const {
        escrow: { price },
      } = data;
      return Amount.from(Math.ceil(parseFloat(price[0].amount)));
    }

    return getPrice(value, type, closed);
  }, [value, type, closed, status, data]);

  // const onDomainTypeChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ): void => {
  //   const { value } = event.target;
  //   const parsed = parseInt(value);
  //   setDomainType(parsed);
  // };

  return (
    <form onSubmit={handleSubmit}>
      <PageContent
        avatarColor={"primary"}
        width={"normal"}
        buttons={
          <BasicButtons
            thinking={thinking}
            primary={{
              label:
                status === FormStatus.AvailableFromEscrow
                  ? locales.PURCHASE
                  : locales.REGISTER,
              disabled: status > FormStatus.Valid,
              testId: POSITIVE_REGISTER_BUTTON_TESTID,
            }}
            secondary={{
              label: locales.CANCEL,
              disabled: thinking,
              testId: NEGATIVE_REGISTER_BUTTON_TESTID,
            }}
          />
        }
        icon={<img src={shield} alt={"shield"} />}
        transactionDetails={
          <TransactionDetails
            amount={price}
            fee={fee}
            disabled={status > FormStatus.Valid}
          />
        }
      >
        {!domainName ? (
          <PremiumOrBasic value={edition} onChange={setEdition} />
        ) : null}
        <Block width={"100%"}>
          <RegisterFormHeading
            tooltip={REGISTER_STARNAME_TOOLTIP}
            title={
              locales.REGISTER_YOUR_STARNAME +
              (edition === StarnameEdition.Premium ? "" : " (basic edition)")
            }
          />
          <Block className={"register-form-input-container"}>
            <OutlinedInput
              value={value}
              fullWidth={true}
              startAdornment={
                edition === StarnameEdition.Premium && !domainName ? (
                  <Star />
                ) : undefined
              }
              placeholder={locales.PLACEHOLDER_NAME_NEWSTARNAME}
              error={error !== undefined}
              spellCheck={false}
              disabled={thinking}
              onChange={onChange}
            />
            {type === NameType.Account ? (
              domainName !== undefined ? (
                <Typography
                  className={"register-form-input-readonly-domain-view"}
                >
                  *{domain}
                </Typography>
              ) : (
                <Block className={"register-form-input-domain-dropdown"}>
                  <ThemeProvider theme={selectTheme}>
                    <Select value={domain} onChange={onDomainChange}>
                      {starnameDomains.map(
                        (name: string): React.ReactElement => (
                          <MenuItem key={name} value={name}>
                            *{name}
                          </MenuItem>
                        ),
                      )}
                      {communityDomains.length > 0 ? (
                        <ListSubheader
                          className={
                            "register-form-input-domain-dropdown-subheader"
                          }
                        >
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
                          (name: string): React.ReactElement => (
                            <MenuItem key={name} value={name}>
                              *{name}
                            </MenuItem>
                          ),
                        )}
                    </Select>
                  </ThemeProvider>
                </Block>
              )
            ) : null}
          </Block>
          <FormHelperText error={status === FormStatus.Invalid}>
            {
              error
                ? error
                : "" /* This extra space prevents the form from jumping */
            }
          </FormHelperText>
          {isEscrowData(data) && <EscrowDetails escrow={data.escrow} />}
          {/* {type === NameType.Domain && (
            <Block className="register-form-more-options-container">
              <Accordion
                variant="outlined"
                disabled={status > FormStatus.Valid}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{locales.MORE_OPTIONS}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl
                    style={{ marginTop: -32 }}
                    disabled={status > FormStatus.Valid}
                  >
                    <FormLabel>
                      Want to register an open domain instead?
                    </FormLabel>
                    <RadioGroup
                      onChange={onDomainTypeChange}
                      value={domainType}
                    >
                      {RegisterDomainTypes.map((option) => (
                        <FormControlLabel
                          key={`register-domain-type-${option.value}`}
                          control={<Radio />}
                          value={option.value}
                          label={
                            option.value === DomainType.Closed
                              ? `(default) ${option.label}`
                              : option.label
                          }
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </AccordionDetails>
              </Accordion>
            </Block>
          )} */}
        </Block>
      </PageContent>
    </form>
  );
};

export default withRouter(RegisterForm);
