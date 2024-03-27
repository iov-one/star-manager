import { Task } from "logic/httpClient";
import React from "react";

const loadImage = (src: string): Task<void> => {
  const image: HTMLImageElement = new Image();
  return {
    run: (): Promise<void> =>
      new Promise((resolve: () => void, reject: () => void): void => {
        // Set the src
        image.src = src;
        // It has loaded
        image.onload = resolve;
        image.onerror = reject;
      }),
    abort: (): void => {
      image.src = "";
    },
  };
};

export interface ImageLoader {
  readonly src: string;
  readonly loaded: boolean;
  readonly replace: (src: string | undefined) => void;
}

export const useImageLoader = (defaultSource: string): ImageLoader => {
  const [source, setSource] = React.useState<string | undefined>(defaultSource);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  React.useEffect((): void | (() => void) => {
    if (source === defaultSource) return;
    if (source === undefined) {
      setLoaded(true);
      return;
    } else {
      setLoaded(false);
    }
    const task: Task<void> = loadImage(source);
    task
      .run()
      .catch((error: any): void => {
        console.warn(error);
      })
      .finally((): void => {
        setLoaded(true);
      });
    return (): void => {
      task.abort();
    };
  }, [defaultSource, source]);
  return {
    src: loaded
      ? source !== undefined
        ? source
        : defaultSource
      : defaultSource,
    loaded: loaded,
    replace: setSource,
  };
};
