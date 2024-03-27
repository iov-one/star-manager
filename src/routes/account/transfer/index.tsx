import AccountOperationView from "components/AccountOperationView";
import { ItemizedHelpView } from "components/itemizedHelpView";
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
import { TransferStrings } from "locales/componentStrings";
import locales from "locales/strings";
import { SessionStoreContext } from "mobx/stores/sessionStore";
import {
  TransferAccountStore,
  TransferAccountStoreContext,
} from "mobx/stores/transferStore";
import { observer } from "mobx-react";
import React from "react";
import { withRouter } from "react-router";
import { TransferForm } from "routes/account/transfer/components/form";
import { Header } from "routes/account/transfer/components/header";
import { simulateFn, transferFn } from "routes/account/transfer/helpers";
import { MANAGER_BASE_ROUTE } from "routes/paths";
import { isName } from "types/name";
import { NameType } from "types/nameType";
import { OperationType } from "types/operationType";
import captureEvent from "utils/captureEvent";
import { handleTxError } from "utils/handleTxError";

const AccountTransfer: React.FC<OperationRouteProps> = observer(
  (props: OperationRouteProps): React.ReactElement => {
    const [handler, status] = useTxPromiseHandler();
    const [recipient, setRecipient] = React.useState<string>("");
    const [transferFlag, setTransferFlag] = React.useState<0 | 1 | 2>(0);
    const sessionStore = React.useContext(SessionStoreContext);
    const store = React.useContext<TransferAccountStore>(
      TransferAccountStoreContext,
    );
    const operation: AccountOperation = useAccountOperation(props);
    const transfer: SubmitHandler = operation.createSubmitHandler(
      transferFn(store, transferFlag),
    );
    const fee = useFeeEstimator(simulateFn);
    const { item } = operation;
    const { type } = item;
    const onTransfer = (): void => {
      handler(transfer())
        .then((txId: string): void => {
          const { history } = props;
          toast.show(
            <TxResultToastContent
              text={locales.TRANSFER_SUCCESS_TOAST_MESSAGE}
              txId={txId}
            />,
            ToastType.Success,
          );
          sessionStore.refreshAccounts();
          history.replace(MANAGER_BASE_ROUTE);
          captureEvent(txId);
        })
        .catch(handleTxError);
    };
    const entries: string[] = React.useMemo(
      (): string[] => TransferStrings[type],
      [type],
    );

    const domainType = React.useMemo(() => {
      if (type !== NameType.Domain) return undefined;
      const value = item.getValue();
      if (isName(value)) return value.domain.type;
      return value.type;
    }, []);

    React.useEffect((): (() => void) | void => {
      return store.setAddressOrStarname(recipient);
    }, [store, recipient]);

    return (
      <AccountOperationView
        item={item}
        type={OperationType.Transfer}
        thinking={status === TxHandlerStatus.Handling || store.resolving}
        fee={fee}
        disabled={!store.valid}
        submitCaption={locales.TRANSFER}
        form={
          <TransferForm
            type={item.type}
            domainType={domainType}
            executing={store.executing}
            recipient={recipient}
            error={store.error}
            onRecipientChange={setRecipient}
            onTransferFlagChange={setTransferFlag}
          />
        }
        header={<Header item={item} />}
        onAccept={onTransfer}
      >
        <ItemizedHelpView entries={entries} />
      </AccountOperationView>
    );
  },
);

export default withRouter(AccountTransfer);
