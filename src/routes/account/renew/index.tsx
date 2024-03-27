import { Block } from "components/block";
import { LoadingView } from "components/LoadingView";
import toast, { ToastType } from "components/toast";
import { TxResultToastContent } from "components/txResultToastContent";
import {
  AccountOperation,
  OperationRouteProps,
  SubmitHandler,
  useAccountOperation,
} from "hooks/useAccountOperation";
import { useFeeEstimator } from "hooks/useFeeEstimator";
import { useRenewalFeeCalculator } from "hooks/useRenewalFeeCalculator";
import {
  TxHandlerStatus,
  useTxPromiseHandler,
} from "hooks/useTxPromiseHandler";
import locales from "locales/strings";
import { SessionStoreContext } from "mobx/stores/sessionStore";
import React from "react";
import StarnameAccountRenew from "routes/account/renew/components/genericRenewView";
import { renewFn, simulateFn } from "routes/account/renew/helpers";
import { NameType } from "types/nameType";
import captureEvent from "utils/captureEvent";
import { handleTxError } from "utils/handleTxError";

const AccountRenew: React.FC<OperationRouteProps> = (
  props: OperationRouteProps,
): React.ReactElement => {
  const [handler, status] = useTxPromiseHandler();
  const store = React.useContext(SessionStoreContext);
  const operation: AccountOperation = useAccountOperation(props);
  const { item } = operation;
  const renew: SubmitHandler = operation.createSubmitHandler(renewFn);
  const onRenew = React.useCallback((): void => {
    handler(renew())
      .then((txId: string): void => {
        const { history } = props;
        toast.show(
          <TxResultToastContent
            text={locales.RENEW_SUCCESS_TOAST_MESSAGE}
            txId={txId}
          />,
          ToastType.Success,
        );
        store.refreshAccounts();
        history.goBack();
        captureEvent(txId);
      })
      .catch(handleTxError);
  }, [handler, props, renew]);
  const fee = useFeeEstimator(simulateFn);
  const amount = useRenewalFeeCalculator(item);

  return item.type === NameType.Domain && !amount ? (
    <LoadingView />
  ) : (
    <Block
      marginTop={32}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <StarnameAccountRenew
        item={operation.item}
        thinking={status === TxHandlerStatus.Handling}
        fee={fee}
        onAccept={onRenew}
        amount={amount}
      />
    </Block>
  );
};

export default AccountRenew;
