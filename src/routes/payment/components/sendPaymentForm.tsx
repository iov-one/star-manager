import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormHelperText, Typography } from "@material-ui/core";
import BasicButtons from "components/basicButtons";
import { Block } from "components/block";
import PageContent from "components/PageContent";
import toast, { ToastType } from "components/toast";
import TransactionDetails from "components/TransactionDetails";
import { TxResultToastContent } from "components/txResultToastContent";
import { TokenLike } from "config";
import { useWallet } from "contexts/walletContext";
import { useFeeEstimator } from "hooks/useFeeEstimator";
import { useTxPromiseHandler } from "hooks/useTxPromiseHandler";
import locales from "locales/strings";
import { Task } from "logic/httpClient";
import {
  SendPaymentStore,
  SendPaymentStoreContext,
} from "mobx/stores/sendPaymentStore";
import { observer } from "mobx-react";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import AmountInput from "routes/payment/components/amountInput";
import TextNote from "routes/payment/components/textNote";
import { Wallet } from "signers/wallet";
import { Amount } from "types/amount";
import { Balance } from "types/balance";
import { PostTxResult } from "types/postTxResult";
import { handleTxError } from "utils/handleTxError";
import { ZERO_FEE } from "utils/zeroFee";

import RecipientAddress from "./ReceiverAddress";

interface Props extends RouteComponentProps {}

const SendPaymentForm: React.FC<Props> = observer(
  (props: Props): React.ReactElement => {
    const store = React.useContext<SendPaymentStore>(SendPaymentStoreContext);
    const { token } = store;
    const [balances, setBalances] = React.useState<ReadonlyArray<Balance>>([]);
    const [loadingBalance, setLoadingBalance] = React.useState<boolean>(false);
    const [handler] = useTxPromiseHandler();
    const wallet: Wallet = useWallet();
    const amount: Amount | undefined =
      token !== undefined
        ? new Amount(store.amount * token.subunitsPerUnit, token)
        : undefined;
    const fee = useFeeEstimator(
      async (wallet: Wallet): Promise<PostTxResult> => {
        if (token !== undefined) {
          return wallet.sendPayment(token, "", 0);
        } else {
          return ZERO_FEE;
        }
      },
      [token],
    );
    React.useEffect(() => {
      setLoadingBalance(true);
      const task: Task<ReadonlyArray<Balance>> = wallet.getBalances();
      const promise: Promise<ReadonlyArray<Balance>> = task.run();
      promise
        .then((balances: ReadonlyArray<Balance>): void => {
          setBalances(balances);
          // Initialize token in the store
          if (balances.length > 0) {
            const { amount } = balances[0];
            store.setToken(amount.token);
          }
        })
        .finally((): void => {
          setLoadingBalance(false);
        });
      return () => task.abort();
    }, [wallet, store]);
    const onTokenSelectionControl = async (token: TokenLike): Promise<void> => {
      store.setToken(token);
    };
    const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
      const { history } = props;
      event.preventDefault();
      // Now send the tokens :)
      if (store.token !== undefined) {
        handler(store.send(wallet))
          .then((txId) => {
            toast.show(
              <TxResultToastContent
                text={locales.TOKENS_SENT_SUCCESS}
                txId={txId}
              />,
              ToastType.Success,
            );
            history.goBack();
          })
          .catch(handleTxError);
      }
    };
    const disabled = React.useMemo<boolean>((): boolean => {
      return loadingBalance || store.executing;
    }, [loadingBalance, store.executing]);
    return (
      <form onSubmit={onSubmit}>
        <PageContent
          width={"normal"}
          icon={<FontAwesomeIcon icon={faUser as any} color={"#ffffff"} />}
          avatarColor={"accent"}
          buttons={
            <BasicButtons
              primary={{
                label: locales.CONTINUE,
                disabled: disabled || !store.valid,
              }}
              secondary={{
                label: locales.CANCEL,
                disabled: disabled,
              }}
              thinking={store.resolving || store.executing}
            />
          }
          transactionDetails={
            <TransactionDetails
              amount={amount}
              disabled={disabled || !store.valid}
              fee={fee}
            />
          }
        >
          <Block
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            marginBottom={32}
          >
            <Typography color={"textPrimary"} variant={"subtitle2"}>
              {locales.SEND_TOKENS}
            </Typography>
          </Block>
          <Block width={"100%"} marginBottom={32}>
            <AmountInput
              balances={balances.map(
                (balance: Balance): Amount => balance.amount,
              )}
              value={store.amount}
              disabled={disabled}
              onTokenSelectionControl={onTokenSelectionControl}
              onChange={store.setAmount}
            />
          </Block>
          <Block width={"100%"} marginBottom={32}>
            <RecipientAddress store={store} disabled={disabled} />
          </Block>
          <Block width={"100%"} marginBottom={32}>
            <TextNote
              value={store.note}
              disabled={disabled}
              onChange={store.setNote}
            />
          </Block>
          <FormHelperText error={store.error !== undefined}>
            {
              store.error !== undefined
                ? store.error
                : " " /* This extra space prevents the form from jumping */
            }
          </FormHelperText>
        </PageContent>
      </form>
    );
  },
);

export default withRouter(SendPaymentForm);
