import AccountOperationView from "components/AccountOperationView";
import { ItemizedHelpView } from "components/itemizedHelpView";
import toast, { ToastType } from "components/toast";
import { TxResultToastContent } from "components/txResultToastContent";
import { ERROR_HTML_COLOR } from "genericConstants";
import { useFeeEstimator } from "hooks/useFeeEstimator";
import {
  TxHandlerStatus,
  useTxPromiseHandler,
} from "hooks/useTxPromiseHandler";
import { ModifyEscrowStrings } from "locales/componentStrings";
import strings from "locales/strings";
import { EscrowStoreContext } from "mobx/stores/escrowStore";
import { observer } from "mobx-react";
import React from "react";
import { getSimpleConversionPrice } from "routes/starnameProfile/components/ProfileView/coinGeckoConversion";
import { Wallet } from "signers/wallet";
import { Escrow } from "types/escrow";
import { NameItem } from "types/nameItem";
import { OperationType } from "types/operationType";
import { handleTxError } from "utils/handleTxError";

import ModifyEscrowForm from "./form";
import { Header } from "./header";
import { simulateDeleteFn, simulateUpdateFn } from "./helpers";

interface Props {
  escrow: Escrow;
  item: NameItem;
  wallet: Wallet;
  onSuccess: () => void;
}

const ModifyEscrowView = observer((props: Props): React.ReactElement => {
  const { escrow, item, wallet, onSuccess } = props;

  const store = React.useContext(EscrowStoreContext);

  const [isUpdateAction, setIsUpdateAction] = React.useState<boolean>(true);

  const [handler, status] = useTxPromiseHandler();

  React.useEffect(() => {
    store.reset();
    // set on init
    store.initEscrow(escrow);
    store.setDateCaps(item);
    const task = getSimpleConversionPrice("starname", ["usd", "eur"]);
    task.execute().then((result) => {
      if ("starname" in result) {
        if ("usd" in result.starname && "eur" in result.starname) {
          const { usd, eur } = result.starname;
          store.setPriceConversionObject({
            usd,
            eur,
          });
        }
      }
    });

    return () => task.abort();
  }, []);

  const fee = useFeeEstimator(
    isUpdateAction ? simulateUpdateFn : simulateDeleteFn,
  );

  React.useEffect(() => {
    setIsUpdateAction(!store.hasEscrowStateChanged);
  }, [store.hasEscrowStateChanged]);

  const onModifyEscrow = (): void => {
    if (isUpdateAction) {
      if (!store.deadline) return;
      handler(
        wallet.updateEscrow(
          escrow.id,
          store.amount,
          store.deadline,
          store.address,
        ),
      )
        .then((txId) => {
          toast.show(
            <TxResultToastContent
              txId={txId}
              text={`${strings.SUCCESSFULLY_UPDATED_ESCROW} ${item.toString()}`}
            />,
            ToastType.Success,
          );
          onSuccess();
        })
        .catch(handleTxError);
    } else {
      handler(wallet.deleteEscrow(escrow.id))
        .then((txId) => {
          toast.show(
            <TxResultToastContent
              txId={txId}
              text={`${
                strings.SUCCESSFULLY_REFUNDED_ESCROW
              } ${item.toString()}`}
            />,
            ToastType.Success,
          );
          onSuccess();
        })
        .catch(handleTxError);
    }
  };

  return (
    <AccountOperationView
      item={item}
      type={
        isUpdateAction ? OperationType.UpdateEscrow : OperationType.RefundEscrow
      }
      thinking={status === TxHandlerStatus.Handling}
      fee={fee}
      submitCaption={
        isUpdateAction ? strings.UPDATE_ESCROW : strings.REMOVE_ESCROW
      }
      submitHtmlColor={!isUpdateAction ? ERROR_HTML_COLOR : undefined}
      header={<Header item={item} />}
      disabled={
        !store.isValidAmount ||
        // will handle starname resolving errors
        !!store.error ||
        // ensures seller is a proper address
        !store.address ||
        // only check valid deadline on update action
        // as form component will be blocked for expired escrow
        // we dont want to disable refund button for an expired escrow = (expired deadline)
        (isUpdateAction && !store.isValidDeadline)
      }
      onAccept={onModifyEscrow}
      form={<ModifyEscrowForm />}
    >
      <ItemizedHelpView entries={ModifyEscrowStrings} />
    </AccountOperationView>
  );
});

export default ModifyEscrowView;
