import "./styles.scss";

import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  Typography,
} from "@material-ui/core";
import { AccountBalanceWallet, Close } from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import { LoadingButton } from "@mui/lab";
import { Tab, Tabs } from "@mui/material";
import api from "api";
import { Block } from "components/block";
import { LoadingView } from "components/LoadingView";
import toast, { ToastType } from "components/toast";
import { TxResultToastContent } from "components/txResultToastContent";
import { useWallet } from "contexts/walletContext";
import { BondStatus } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { useTxPromiseHandler } from "hooks/useTxPromiseHandler";
import locales from "locales/strings";
import { DelegationStoreContext } from "mobx/stores/delegationStore";
import { observer } from "mobx-react";
import React from "react";
import { Amount } from "types/amount";
import { Validator } from "types/delegationValidator";
import { handleTxError } from "utils/handleTxError";

import DelegationDialog from "./Dialog";
import StakedValidatorsHeader from "./StakedValidators/StakedValidatorHeader";
import StakedValidatorRow from "./StakedValidators/StakedValidatorRow";
import ValidatorRow from "./ValidatorRow";
import VTableHeader from "./VTableHeader";
import VTablePagination from "./VTablePagination";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`validators-tabpanel-${index}`}
      aria-labelledby={`validators-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

enum ValidatorsTab {
  Delegations,
  Top,
  Inactive,
}

const StakingDashboard = observer((): React.ReactElement => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [claiming, setClaiming] = React.useState<boolean>(false);
  const [resultValidators, setResultValidators] = React.useState<
    ReadonlyArray<Validator>
  >([]);

  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(25);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [validatorAlertDialog, setValidatorAlertDialog] = React.useState<{
    open: boolean;
    validator?: Validator;
  }>({
    open: false,
  });
  const [tab, setTab] = React.useState<ValidatorsTab>(ValidatorsTab.Top);

  const store = React.useContext(DelegationStoreContext);
  const wallet = useWallet();
  const [handler] = useTxPromiseHandler();

  const totalVotingPower = React.useMemo(() => {
    return store.validators
      .filter((v) => !v.jailed)
      .reduce((acc, val) => acc + Number(val.tokens), 0);
  }, [store.validators]);

  const getDelegationToValidator = React.useCallback(
    (validator: Validator): Amount => {
      const foundDelegation = store.userDelegations.find(
        ({ delegation }) =>
          delegation.validator_address === validator.operator_address,
      );
      return foundDelegation
        ? Amount.from(Number(foundDelegation.balance.amount))
        : Amount.fromValue(0);
    },
    [store.userDelegations],
  );

  const getRewardFromValidator = React.useCallback(
    (validator: Validator): Amount => {
      const mainToken = api.getMainToken();
      const foundReward = store.userRewards
        .find((_rew) => _rew.validator_address === validator.operator_address)
        ?.reward.find((_coin) => _coin.denom === mainToken.subunitName);
      return foundReward
        ? Amount.from(Number(foundReward.amount))
        : Amount.fromValue(0);
    },
    [store.validators],
  );

  const getValidatorVotingPowerPercentage = React.useCallback(
    (validator: Validator): number => {
      return (Number(validator.tokens) / totalVotingPower) * 100;
    },
    [totalVotingPower],
  );

  const hasDelegatedToValidator = React.useCallback(
    (validator: Validator): boolean => {
      const found = store.userDelegations.find(
        ({ delegation }) =>
          delegation.validator_address === validator.operator_address,
      );
      return !!found;
    },
    [store.userDelegations],
  );

  React.useEffect(() => {
    wallet.getAddress().then(store.setAddress).catch(console.warn);
  }, [wallet]);

  React.useEffect((): (() => void) | undefined => {
    setLoading(true);
    const task = api.getValidators();
    task
      .run()
      .then((validators) => {
        store.setValidators(validators);
      })
      .catch(console.warn)
      .finally((): void => setLoading(false));

    return () => {
      task.abort();
    };
  }, []);

  React.useEffect((): (() => void) | void => {
    if (store.validators.length === 0) return;
    const task = store.initializeLogos(store.validators);
    void task.run();

    return () => {
      task.abort();
    };
  }, [store.validators]);

  React.useEffect(() => {
    store.resetDialogState();
  }, []);

  React.useEffect(() => {
    const getUserBalanceTask = api.getBalance(store.address);
    const getUserDelegationsTask = api.getUserDelegations(store.address);
    const getUserRewardsTask = api.getUserRewards(store.address);

    getUserBalanceTask
      .run()
      .then((balances) => {
        if (balances.length > 0) store.setUserBalance(balances[0].amount);
        else store.setUserBalance(Amount.fromValue(0));
      })
      .catch(console.warn);

    getUserDelegationsTask
      .run()
      .then(store.setUserDelegations)
      .catch(console.warn);

    getUserRewardsTask.run().then(store.setUserRewards).catch(console.warn);

    return () => {
      getUserBalanceTask.abort();
      getUserDelegationsTask.abort();
      getUserRewardsTask.abort();
    };
  }, [store.refreshData, store.address]);

  React.useEffect(() => {
    if (store.userDelegations.length > 0) setTab(ValidatorsTab.Delegations);
    else setTab(ValidatorsTab.Top);
  }, [store.userDelegations]);

  const showDelegationDialog = (
    validator: Validator,
    powerCheck = true,
  ): void => {
    if (
      powerCheck &&
      !hasDelegatedToValidator(validator) &&
      getValidatorVotingPowerPercentage(validator) > 10
    ) {
      setValidatorAlertDialog({
        open: true,
        validator,
      });
      return;
    }
    setValidatorAlertDialog({ open: false });
    store.setCurrentValidator(validator);
    setDialogOpen(true);
  };

  const handleBannerClose = (): void => {
    store.setBannerVisible(false);
  };

  const handleClaimRewardsClick = React.useCallback((): void => {
    if (store.userDelegations.length === 0) return;
    setClaiming(true);
    handler(
      wallet.claimReward(
        store.userDelegations.map((_d) => _d.delegation.validator_address),
      ),
    )
      .then((txId) => {
        store.toggleRefresh();
        toast.show(
          <TxResultToastContent
            txId={txId}
            text={locales.SUCCESSFULLY_CLAIMED_REWARDS}
          />,
          ToastType.Success,
        );
      })
      .catch(handleTxError)
      .finally(() => setClaiming(false));
  }, [store.userDelegations]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setTab(newValue);
  };

  React.useEffect(() => {
    switch (tab) {
      case ValidatorsTab.Delegations:
        setResultValidators(
          store.validators.filter(hasDelegatedToValidator).sort((a, b) => {
            return getDelegationToValidator(a).getFractionalValue() >
              getDelegationToValidator(b).getFractionalValue()
              ? -1
              : 1;
          }),
        );
        break;
      case ValidatorsTab.Top:
        setResultValidators(
          store.validators
            .filter(
              (_v) => _v.status === BondStatus[BondStatus.BOND_STATUS_BONDED],
            )
            .filter((_v) => !hasDelegatedToValidator(_v)),
        );
        break;
      case ValidatorsTab.Inactive:
        setResultValidators(
          store.validators
            .filter(
              (_v) => _v.status === BondStatus[BondStatus.BOND_STATUS_UNBONDED],
            )
            .filter((_v) => !hasDelegatedToValidator(_v)),
        );
    }
  }, [tab, store.validators]);

  return loading ? (
    <LoadingView />
  ) : (
    <>
      <Block className={"staking-container"}>
        <Block className="staking-top-alert-container">
          <Collapse in={store.bannerVisible}>
            <Alert
              action={
                <IconButton onClick={handleBannerClose} color="inherit">
                  <Close />
                </IconButton>
              }
              className={"rewards-banner top-alert"}
              variant={"filled"}
              severity={"info"}
            >
              <AlertTitle>{locales.REWARDS_BANNER_TITLE}</AlertTitle>
              {locales.REWARDS_BANNER_CONTENT}
            </Alert>
          </Collapse>
          {tab === ValidatorsTab.Inactive && (
            <Alert severity="warning" className="top-alert">
              <AlertTitle>{locales.STAKING_INACTIVE_WARNING_TITLE}</AlertTitle>
              {locales.STAKING_INACTIVE_WARNING_CONTENT}
            </Alert>
          )}
        </Block>
        {store.totalRewards.amount > 0 && (
          <Paper variant="outlined" className="claim-rewards-container">
            <Block className="total-staked-display-container">
              <Typography variant="button" style={{ fontWeight: "bold" }}>
                {locales.TOTAL_STAKED}
              </Typography>
              <Typography variant="button">
                {store.totalStaked.format(true)}
              </Typography>
            </Block>
            <LoadingButton
              startIcon={<AccountBalanceWallet />}
              loading={claiming}
              loadingPosition="start"
              variant="contained"
              size="small"
              onClick={handleClaimRewardsClick}
            >
              {locales.CLAIM_REWARDS} {store.totalRewards.format(true)}
            </LoadingButton>
          </Paper>
        )}
        <Block className={"validators-table-content"}>
          <Tabs variant="fullWidth" value={tab} onChange={handleTabChange}>
            {store.userDelegations.length > 0 && (
              <Tab
                label={locales.MY_DELEGATIONS}
                value={ValidatorsTab.Delegations}
              />
            )}
            <Tab label={locales.TOP_VALIDATORS} value={ValidatorsTab.Top} />
            <Tab
              label={locales.INACTIVE_VALIDATORS}
              value={ValidatorsTab.Inactive}
            />
          </Tabs>
          {store.userDelegations.length > 0 && (
            <TabPanel value={tab} index={ValidatorsTab.Delegations}>
              <Table>
                <StakedValidatorsHeader />
                <TableBody>
                  {(rowsPerPage > 0
                    ? resultValidators.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                    : resultValidators
                  ).map((validator) => (
                    <StakedValidatorRow
                      delegationToValidator={getDelegationToValidator(
                        validator,
                      )}
                      showDelegationDialog={showDelegationDialog}
                      logo={
                        store.validatorsLogos[validator.description.identity]
                      }
                      rewardFromValidator={getRewardFromValidator(validator)}
                      validator={validator}
                      key={validator.operator_address}
                    />
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          )}
          <TabPanel value={tab} index={ValidatorsTab.Top}>
            <Table>
              <VTableHeader />
              <TableBody>
                {(rowsPerPage > 0
                  ? resultValidators.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage,
                    )
                  : resultValidators
                ).map((validator) => (
                  <ValidatorRow
                    key={validator.operator_address}
                    validator={validator}
                    showDelegationDialog={showDelegationDialog}
                    logo={store.validatorsLogos[validator.description.identity]}
                  />
                ))}
              </TableBody>
            </Table>
          </TabPanel>
          <TabPanel value={tab} index={ValidatorsTab.Inactive}>
            <Table>
              <VTableHeader />
              <TableBody>
                {(rowsPerPage > 0
                  ? resultValidators.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage,
                    )
                  : resultValidators
                ).map((validator) => (
                  <ValidatorRow
                    key={validator.operator_address}
                    validator={validator}
                    showDelegationDialog={showDelegationDialog}
                    logo={store.validatorsLogos[validator.description.identity]}
                  />
                ))}
              </TableBody>
            </Table>
          </TabPanel>
          <VTablePagination
            validatorsCount={resultValidators.length}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
          />
        </Block>
      </Block>
      <Dialog open={validatorAlertDialog.open}>
        <DialogTitle>{locales.ATTENTION}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {locales.DELEGATION_TO_TOP_VALIDATORS_ALERT_CONTENT}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setValidatorAlertDialog({
                open: false,
              })
            }
          >
            {locales.CANCEL}
          </Button>
          <Button
            onClick={() => {
              if (!validatorAlertDialog.validator) return;
              showDelegationDialog(validatorAlertDialog.validator, false);
            }}
            disabled={!validatorAlertDialog.validator}
            variant="contained"
            color="primary"
          >
            {locales.DELEGATE_ANYWAY}
          </Button>
        </DialogActions>
      </Dialog>
      <DelegationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
});

export default StakingDashboard;
