import { Task } from "logic/httpClient";

class Timer<T> {
  private timer: any | null = null;
  private readonly delay: number;
  private reject: (error: any) => void = () => {};
  private callback: () => Promise<T>;

  constructor(delay: number, callback: () => Promise<T>) {
    this.delay = delay;
    this.callback = callback;
  }

  public stop(): void {
    clearTimeout(this.timer);
    // Call the reject function
    this.reject({
      code: 1 /* cancelled */,
    });
  }

  public start(): Promise<T> {
    return new Promise<T>(
      (resolve: (t: T) => void, reject: (error: any) => void): void => {
        this.reject = reject;
        this.timer = setTimeout((): void => {
          this.callback()
            .then((t: T): void => {
              resolve(t);
            })
            .catch(reject);
        }, this.delay);
      },
    );
  }
}

export const debounceTask = <T>(
  task: Task<T>,
  debounceTime: number,
): Task<T> => {
  if (debounceTime <= 0) return task;
  const timer = new Timer<T>(debounceTime, task.run);
  return {
    run: async (): Promise<T> => {
      return timer.start();
    },
    abort: (): void => {
      timer.stop();
      task.abort();
    },
  };
};
