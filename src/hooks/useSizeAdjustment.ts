import React from "react";
import ResizeObserver from "resize-observer-polyfill";

export interface Size {
  readonly width: number;
  readonly height: number;
}

export const useSizeAdjustment = (): [React.Ref<HTMLDivElement>, Size] => {
  const reference: React.Ref<HTMLDivElement> =
    React.useRef<HTMLDivElement>(null);
  const [[width, height], setSize] = React.useState<[number, number]>([0, 0]);
  const { current } = reference;
  React.useEffect((): void | (() => void) => {
    if (current === null) return;
    const observer: ResizeObserver = new ResizeObserver((): void => {
      const { style } = current;
      // Save the original values
      const savedWidth: any = style.width;
      const savedHeight: any = style.height;
      // Make it so small that it MUST scroll
      style.width = "1px";
      style.height = "1px";
      // Save computed value
      setSize([current.scrollWidth, current.scrollHeight]);
      // Reset the old values
      style.width = savedWidth;
      style.height = savedHeight;
    });
    observer.observe(current);
    return (): void => {
      observer.disconnect();
    };
  }, [current]);
  React.useEffect((): void => {
    if (width === 0 || height === 0) return;
    // window.resizeTo(width, height);
  }, [width, height]);
  return [reference, { width: width, height: height }];
};
