import { LoadingView } from "components/LoadingView";
import { useWallet } from "contexts/walletContext";
import { DEFAULT_PAGE_SIZE } from "genericConstants";
import { FetchStatus, usePager } from "hooks/usePager";
import { Task } from "logic/httpClient";
import React from "react";
import TxTable from "routes/transactions/components/TxTable";
import { Wallet } from "signers/wallet";
import { IResponsePage } from "types/apiPage";
import { GetTransactionsContext } from "types/getTransactionsContext";
import { StdMap } from "types/map";
import { Pager } from "types/pager";
import { ITransaction as Transaction } from "types/transaction";

const Transactions = (): React.ReactElement => {
  const wallet: Wallet = useWallet();
  // Wrapper to prevent calling `getTransactions' without a bound
  // object, because it needs some stuff from the instance
  const fetch = React.useCallback(
    (page: Pager): Task<StdMap<IResponsePage<Transaction>>> => {
      return wallet.getTransactions(page);
    },
    [wallet],
  );
  const [initialContext] = React.useState<GetTransactionsContext>(
    new GetTransactionsContext(),
  );
  const [status, context, pager] = usePager<
    GetTransactionsContext,
    Transaction
  >(
    /* Simply a sensible initial page size (probably fixed forever) */
    DEFAULT_PAGE_SIZE,
    /* The fetch function */
    fetch,
    /* A custom context to keep state across pages */
    initialContext,
  );
  // FIXME: we could be more fine grained here
  const loading: boolean = status === FetchStatus.Fetching;
  if (loading && pager.number === 1) {
    return <LoadingView />;
  } else {
    return (
      <TxTable transactions={context.items} loading={loading} pager={pager} />
    );
  }
};

export default Transactions;
