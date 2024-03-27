import { sortTransactions } from "logic/sort/transactions";
import { IResponsePage } from "types/apiPage";
import { StdMap } from "types/map";
import { Pager } from "types/pager";
import { PagerContext } from "types/pagerContext";
import { ITransaction as Transaction } from "types/transaction";

export class GetTransactionsContext extends PagerContext<Transaction> {
  private pending: ReadonlyArray<Transaction>;
  public items: ReadonlyArray<Transaction>;

  constructor() {
    super();
    this.pending = [];
    this.items = [];
  }

  public setItems(
    pages: StdMap<IResponsePage<Transaction>>,
    page: Pager,
  ): void {
    const reducer = (
      list: ReadonlyArray<Transaction>,
      responsePage: IResponsePage<Transaction>,
    ): Array<Transaction> => {
      return [...list, ...responsePage.items];
    };
    const items: ReadonlyArray<Transaction> = Object.values(pages)
      .reduce(reducer, [])
      .sort(sortTransactions);
    // In case of requesting a new page we would use
    // this to compute how many items we need from the
    // server and where we should start
    this.pending = items.slice(page.size);
    // These are the "visible" items right now
    this.items = items.slice(0, page.size);
  }
}
