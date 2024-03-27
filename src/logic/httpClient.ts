import locales from "locales/strings";

interface ITask<T> {
  run(): Promise<T>;

  abort(): void;
}

export class Task<T> implements ITask<T> {
  public static toPromise<T>(task: Task<T>): Promise<T> {
    return task.run();
  }

  public run(): Promise<T> {
    throw new Error("tasks must implement run");
  }

  public abort(): void {
    throw new Error("tasks must implement abort");
  }
}

export const DummyTask: Task<any> = {
  run: async (): Promise<void> => undefined,
  abort: (): void => undefined,
};

export interface StargateError {
  readonly message: string;
  readonly code: number;
}

export interface CommonError {
  readonly error: string;
}

export interface TaskError {
  readonly code: number;
  readonly title: string;
  readonly body: string | CommonError | StargateError;
}

export const TaskAbortedError: TaskError = {
  code: -1,
  title: locales.ABORTED,
  body: locales.TASK_ABORTED_BODY,
};

const buildResponseBody = <T>(xhr: XMLHttpRequest): T => {
  const contentType: string | null = xhr.getResponseHeader("content-type");
  if (contentType === null) return xhr.responseText as any;
  if (contentType.includes("application/json")) {
    return JSON.parse(xhr.responseText);
  } else {
    return xhr.responseText as any;
  }
};

const resolveAllMembers = async (generic: {
  [key: string]: any;
}): Promise<{ [key: string]: any }> => {
  const entries: ReadonlyArray<[string, any]> = Object.entries(generic);
  const resolved: ReadonlyArray<[string, any]> = await Promise.all(
    entries.map(async ([key, value]: [string, any]): Promise<[string, any]> => {
      return [key, await value];
    }),
  );
  return resolved.reduce(
    (
      object: { [key: string]: any },
      entry: [string, any],
    ): { [key: string]: any } => {
      return { ...object, [entry[0]]: entry[1] };
    },
    {},
  );
};

const request = <T>(
  method: string,
  url: string,
  data?: { [key: string]: any },
): Task<T> => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  const run = async (): Promise<T> => {
    const resolvedData: { [key: string]: any } | undefined = data
      ? await resolveAllMembers(data)
      : undefined;
    return new Promise<T>(
      (resolve: (value: T) => void, reject: (reason: TaskError) => void) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status > 199 && xhr.status < 300) {
              resolve(buildResponseBody<T>(xhr));
            } else if (xhr.status !== 0) {
              reject({
                code: xhr.status,
                title: xhr.statusText,
                body: buildResponseBody(xhr),
              });
            }
          }
        };
        xhr.onabort = () => {
          reject(TaskAbortedError);
        };
        if (resolvedData !== undefined) {
          xhr.setRequestHeader("content-type", "application/json");
          xhr.send(JSON.stringify(resolvedData));
        } else {
          xhr.send();
        }
      },
    );
  };
  const abort = (): void => {
    xhr.abort();
  };
  return {
    run: run,
    abort: abort,
  };
};

export const get = <T>(url: string): Task<T> => request<T>("GET", url);
export const post = <T>(url: string, data: { [key: string]: any }): Task<T> =>
  request<T>("POST", url, data);
