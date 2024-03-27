import "./styles.scss";

import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import api from "api";
import walletSvg from "assets/wallet.svg";
import { Block } from "components/block";
import { LedgerShowAddressButton } from "components/LedgerShowAddressButton";
import PageContent from "components/PageContent";
import toast, { ToastType } from "components/toast";
import { useWallet } from "contexts/walletContext";
import strings from "locales/strings";
import locales from "locales/strings";
import { Task } from "logic/httpClient";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { AddressList } from "routes/balance/addressList";
import { BalancesList } from "routes/balance/balancesList";
import { Separator } from "routes/balance/separator";
import { RECEIVE_PAYMENT_ROUTE, SEND_PAYMENT_ROUTE } from "routes/paths";
import { Wallet } from "signers/wallet";
import { Balance } from "types/balance";
import { Reward } from "types/rewardsResponse";
import { Unbonding } from "types/unbondingsResponse";
import { Delegation } from "types/userDelegationsResponse";
import { handleTxError } from "utils/handleTxError";

import { ContentWrapper } from "./contentWrapper";
import CosmostationLink from "./cosmostationLink";

const BalanceView: React.FC<RouteComponentProps> = observer(
  (props: RouteComponentProps): React.ReactElement => {
    const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
    const [loaded, setLoaded] = React.useState<boolean>(false);
    const [balances, setBalances] = React.useState<ReadonlyArray<Balance>>([]);
    const [userAddress, setUserAddress] = React.useState<string | null>(null);
    const [delegations, setDelegations] = React.useState<
      ReadonlyArray<Delegation>
    >([]);
    const [unbondings, setUnbondings] = React.useState<
      ReadonlyArray<Unbonding>
    >([]);
    const [rewards, setRewards] = React.useState<ReadonlyArray<Reward>>([]);
    const [showBuyTokensModal, setShowBuyTokensModal] =
      React.useState<boolean>(false);
    const [showBuyOptionsModal, setShowBuyOptionsModal] =
      React.useState<boolean>(false);
    const [reloadBalance, setReloadBalance] = React.useState<boolean>(false);

    const values = React.useMemo(
      (): ReadonlyArray<Balance> => Object.values(balances),
      [balances],
    );
    const empty: boolean = React.useMemo(
      (): boolean => !loaded && values.length === 0,
      [values, loaded],
    );

    const wallet: Wallet = useWallet();

    React.useEffect((): (() => void) | void => {
      // Startup te task
      const task: Task<ReadonlyArray<Balance>> = wallet.getBalances();
      const promise: Promise<ReadonlyArray<Balance>> = task.run();
      promise
        .then((balances: ReadonlyArray<Balance>) => {
          setBalances(balances);
        })
        .catch(handleTxError)
        .finally((): void => setLoaded(true));
      return (): void => task.abort();
    }, [wallet, reloadBalance]);

    React.useEffect(() => {
      wallet.getAddress().then(setUserAddress).catch(console.warn);
    }, [wallet]);

    React.useEffect((): (() => void) | void => {
      if (!userAddress) return;

      const taskGetDelegations: Task<ReadonlyArray<Delegation>> =
        api.getUserDelegations(userAddress);
      const taskGetUnbondings: Task<ReadonlyArray<Unbonding>> =
        api.getUnbondings(userAddress);
      const taskGetRewards: Task<ReadonlyArray<Reward>> =
        api.getUserRewards(userAddress);

      taskGetDelegations.run().then(setDelegations).catch(handleTxError);
      taskGetUnbondings.run().then(setUnbondings).catch(handleTxError);
      taskGetRewards.run().then(setRewards).catch(handleTxError);

      return (): void => {
        taskGetDelegations.abort();
        taskGetUnbondings.abort();
        taskGetRewards.abort();
      };
    }, [userAddress]);

    const sendTokens = (): void => {
      const { history } = props;
      history.push(SEND_PAYMENT_ROUTE);
    };

    const receiveTokens = (): void => {
      const { history } = props;
      history.push(RECEIVE_PAYMENT_ROUTE);
    };

    const handleBuyTokensWithWidget = (): void => {
      setShowBuyTokensModal(true);
    };

    const handleBuyTokensFromOsmosis = (): void => {
      window.open("https://app.osmosis.zone/?from=ATOM&to=IOV", "_blank");
    };

    const handleBuyTokens = (): void => {
      if (sessionStore.showBuyTokenWidget) {
        setShowBuyOptionsModal(true);
      } else {
        handleBuyTokensFromOsmosis();
      }
    };

    const handleBuyTokensProxy = (type: "osmo" | "card"): void => {
      setShowBuyOptionsModal(false);
      type === "osmo"
        ? handleBuyTokensFromOsmosis()
        : handleBuyTokensWithWidget();
    };

    const onClose = (): void => {
      setShowBuyTokensModal(false);
    };

    const onCreditStatusUnknown = (): void => {
      toast.show(
        strings.CREDIT_TOKENS_TOKENS_STATUS_UNKNOWN,
        ToastType.Warning,
        8,
      );
    };

    const onCreditSuccess = (): void => {
      toast.show(locales.TOKENS_CREDIT_SUCCESSFULLY, ToastType.Success);
      setTimeout(() => {
        setReloadBalance(true);
      }, 1000);
    };

    return (
      <PageContent
        icon={<img src={walletSvg} alt={"wallet icon"} />}
        avatarColor={"primary"}
        width={"normal"}
      >
        <Block className={"balances-view"}>
          <Block className={"balance-view-buy-button"}>
            <Button
              variant={"contained"}
              onClick={handleBuyTokens}
              color={"primary"}
            >
              <i className={"fas fa-exchange-alt"} />
              {locales.BUY_IOV_TOKENS}
            </Button>
          </Block>
          <Block className={"balance-view-action-buttons"}>
            <Button variant={"outlined"} onClick={sendTokens} color={"primary"}>
              <i className={"fa fa-paper-plane"} />
              {strings.SEND_TOKENS}
            </Button>
            <Button
              variant={"outlined"}
              onClick={receiveTokens}
              color={"primary"}
            >
              <i className={"fa fa-hand-holding-usd"} />
              {strings.RECEIVE_TOKENS}
            </Button>
          </Block>
          <ContentWrapper empty={empty} loading={!loaded}>
            <BalancesList
              balances={balances}
              delegations={delegations}
              rewards={rewards}
              unbondings={unbondings}
            />
            <Separator />
            <AddressList balances={balances} />
            <LedgerShowAddressButton />
            <Separator />
            <CosmostationLink />
          </ContentWrapper>
          {sessionStore.showBuyTokenWidget && (
            <Dialog
              open={showBuyOptionsModal}
              onClose={() => setShowBuyOptionsModal(false)}
            >
              <DialogTitle>Please select a provider</DialogTitle>
              <DialogContent className="buy-options-container">
                <Button
                  fullWidth
                  color="primary"
                  variant="contained"
                  onClick={() => handleBuyTokensProxy("osmo")}
                >
                  From Osmosis
                </Button>
                <Block className="middle-component">OR</Block>
                <Button
                  fullWidth
                  color="primary"
                  variant="contained"
                  onClick={() => handleBuyTokensProxy("card")}
                >
                  With Credit card
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </Block>
      </PageContent>
    );
  },
);

export default withRouter(BalanceView);
