import toast, { ToastType } from "components/toast";
import { TxResultToastContent } from "components/txResultToastContent";
import {
  AccountOperation,
  OperationRouteProps,
  SubmitHandler,
  useAccountOperation,
} from "hooks/useAccountOperation";
import { useFeeEstimator } from "hooks/useFeeEstimator";
import {
  TxHandlerStatus,
  useTxPromiseHandler,
} from "hooks/useTxPromiseHandler";
import locales from "locales/strings";
import { SessionStoreContext } from "mobx/stores/sessionStore";
import React from "react";
import { withRouter } from "react-router";
import GenericDeleteView from "routes/account/delete/components/genericDeleteView";
import { deleteFn, simulateFn } from "routes/account/delete/helpers";
import { MANAGER_BASE_ROUTE } from "routes/paths";
import captureEvent from "utils/captureEvent";
import { handleTxError } from "utils/handleTxError";

const AccountDelete: React.FC<OperationRouteProps> = (
  props: OperationRouteProps,
): React.ReactElement => {
  const [handler, status] = useTxPromiseHandler();
  const sessionStore = React.useContext(SessionStoreContext);
  const operation: AccountOperation = useAccountOperation(props);
  const deleteStarname: SubmitHandler = operation.createSubmitHandler(deleteFn);
  const fee = useFeeEstimator(simulateFn);
  const onDelete = (): void => {
    handler(deleteStarname())
      .then((txId: string): void => {
        const { history } = props;
        toast.show(
          <TxResultToastContent
            text={locales.DELETE_SUCCESS_TOAST_MESSAGE}
            txId={txId}
          />,
          ToastType.Success,
        );
        sessionStore.onAccountDeleted(operation.item);
        history.replace(MANAGER_BASE_ROUTE);
        captureEvent(txId);
      })
      .catch(handleTxError);
  };

  return (
    <GenericDeleteView
      type={operation.type}
      item={operation.item}
      fee={fee}
      thinking={status === TxHandlerStatus.Handling}
      onAccept={onDelete}
      onCancel={() => undefined}
    />
  );
};

export default withRouter(AccountDelete);
