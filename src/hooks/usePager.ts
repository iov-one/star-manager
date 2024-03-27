import { Task, TaskAbortedError, TaskError } from "logic/httpClient";
import React from "react";
import { IResponsePage } from "types/apiPage";
import { StdMap } from "types/map";
import { Pager } from "types/pager";
import { PagerContext } from "types/pagerContext";

export enum FetchStatus {
  None,
  Fetching,
  Done,
  Errored,
}

type FetchFn<T> = (page: Pager) => Task<StdMap<IResponsePage<T>>>;

export const usePager = <C extends PagerContext<T>, T>(
  size: number,
  fetch: FetchFn<T>,
  context: C,
): [FetchStatus, C, Pager] => {
  const [status, setStatus] = React.useState<FetchStatus>(FetchStatus.Fetching);
  const [pager, setPager] = React.useState<Pager>(new Pager(size));
  React.useEffect(() => {
    const task: Task<StdMap<IResponsePage<T>>> = fetch(pager);
    setStatus(FetchStatus.Fetching);
    // Execute the query
    task
      .run()
      .then((pages: StdMap<IResponsePage<T>>): void => {
        context.setItems(pages, pager);
      })
      .catch((error: TaskError): void => {
        if (error === TaskAbortedError) {
          // This is ok, it's good actually
          return;
        } else {
          console.warn(error);
        }
      })
      .finally(() => setStatus(FetchStatus.Done));
    return () => task.abort();
  }, [pager, fetch, context]);
  // Replace current page
  pager.onChange(() => setPager);
  // Return the new page
  return [status, context, pager];
};
