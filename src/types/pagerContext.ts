import { IResponsePage } from "types/apiPage";
import { StdMap } from "types/map";
import { Pager } from "types/pager";

export abstract class PagerContext<T> {
  public abstract setItems(items: StdMap<IResponsePage<T>>, page: Pager): void;
}
