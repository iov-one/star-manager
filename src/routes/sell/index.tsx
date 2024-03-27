import api from "api";
import { LoadingView } from "components/LoadingView";
import {
  OperationRouteProps,
  useAccountOperation,
} from "hooks/useAccountOperation";
import { SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import React from "react";
import { withRouter } from "react-router";

import MarkForSale from "./components/MarkForSale";
import ModifyEscrowView from "./components/ModifyEscrowView";

const SellStarnameView = observer(
  (props: OperationRouteProps): React.ReactElement => {
    const store = React.useContext(SessionStoreContext);
    const operation = useAccountOperation(props);
    const { item, wallet } = operation;

    const escrow = api.getEscrow(item.toString(), store.escrows);

    const onSuccess = (): void => {
      store.refreshAccounts();
      props.history.goBack();
    };
    return store.loading ? (
      <LoadingView />
    ) : store.escrows.length > 0 && escrow ? (
      <ModifyEscrowView
        escrow={escrow}
        item={item}
        wallet={wallet}
        onSuccess={onSuccess}
      />
    ) : (
      <MarkForSale item={item} wallet={wallet} onSuccess={onSuccess} />
    );
  },
);

export default withRouter(SellStarnameView);
