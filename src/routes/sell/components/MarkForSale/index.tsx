import AccountOperationView from "components/AccountOperationView";
import { ItemizedHelpView } from "components/itemizedHelpView";
import toast, { ToastType } from "components/toast";
import { TxResultToastContent } from "components/txResultToastContent";
import { useFeeEstimator } from "hooks/useFeeEstimator";
import {
  TxHandlerStatus,
  useTxPromiseHandler,
} from "hooks/useTxPromiseHandler";
import strings from "locales/strings";
import { EscrowStoreContext } from "mobx/stores/escrowStore";
import { observer } from "mobx-react";
import React from "react";
import { getSimpleConversionPrice } from "routes/starnameProfile/components/ProfileView/coinGeckoConversion";
import { Wallet } from "signers/wallet";
import { NameItem } from "types/nameItem";
import { OperationType } from "types/operationType";
import { handleTxError } from "utils/handleTxError";

import CreateEscrowForm from "./form";
import { Header } from "./header";
import { simulateFn } from "./helpers";

interface Props {
  item: NameItem;
  wallet: Wallet;
  onSuccess: () => void;
}

const MarkForSale = observer((props: Props): React.ReactElement => {
  const { item, wallet, onSuccess } = props;

  const fee = useFeeEstimator(simulateFn);
  const [handler, status] = useTxPromiseHandler();

  const store = React.useContext(EscrowStoreContext);

  React.useEffect(() => {
    store.reset();
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

  const starname = item.toString();

  const onMarkForSale = (): void => {
    if (!store.deadline) return;
    handler(wallet.createEscrow(store.amount, item, store.deadline))
      .then((txId) => {
        toast.show(
          <TxResultToastContent
            txId={txId}
            text={`${
              strings.SUCCESSFULLY_MARKED
            } ${starname} ${strings.FOR_SALE.toLowerCase()}`}
          />,
          ToastType.Success,
        );
        onSuccess();
      })
      .catch(handleTxError);
  };

  return (
    <AccountOperationView
      item={item}
      type={OperationType.CreateEscrow}
      thinking={status === TxHandlerStatus.Handling}
      fee={fee}
      submitCaption={strings.MARK_FOR_SALE}
      header={<Header item={item} />}
      onAccept={onMarkForSale}
      disabled={!store.isValidAmount || !store.isValidDeadline}
      form={<CreateEscrowForm />}
    >
      <ItemizedHelpView
        entries={[
          `${strings.OWNERSHIP_OF} ${starname} ${strings.TRANSFER_TO_PROGRAMMED_ESCROW}`,
          strings.BUYER_CAN_TRADE_THIS_STARNAME,
          strings.ESCROW_SUCCESS_PROCEDURE_NOTE,
        ]}
      />
    </AccountOperationView>
  );
});

export default MarkForSale;
