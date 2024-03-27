import "./styles.scss";

import { Typography } from "@material-ui/core";
import { Variant } from "@material-ui/core/styles/createTypography";
import React from "react";

interface Props {
  readonly variant: Variant;
  readonly color?:
    | "inherit"
    | "initial"
    | "primary"
    | "secondary"
    | "textPrimary"
    | "textSecondary"
    | "error";
  readonly children: string;
  readonly className?: string;
}

const getTextWidth = (
  context: CanvasRenderingContext2D,
  text: string,
): number => {
  const measure = context.measureText(text);
  return measure.width;
};

const getFont = (element: HTMLElement): string => {
  const style: CSSStyleDeclaration = getComputedStyle(element);
  return style.getPropertyValue("font");
};

export const MiddleEllipsis: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { children } = props;
  const [wrapper, setWrapper] = React.useState<HTMLDivElement | null>(null);
  const [content, setContent] = React.useState<HTMLElement | null>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(
    null,
  );
  const [text, setText] = React.useState<string>(children);
  React.useEffect((): void => setText(children), [children]);
  React.useEffect((): void => {
    if (wrapper === null) return;
    const child: Element | null = wrapper.firstElementChild;
    // Update the container element
    if (child !== null) {
      const element: HTMLElement = child as HTMLElement;
      const style: CSSStyleDeclaration = element.style;
      // This is important, or the measurement
      // of the width will fail
      style.whiteSpace = "nowrap";
      // Otherwise the widths will not match
      style.letterSpacing = "initial";
      // Now keep track of it
      setContent(element);
    }
  }, [wrapper]);
  React.useEffect((): void => {
    if (content === null) return;
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (context !== null) {
      // Set the appropriate font
      context.font = getFont(content);
      // Set the context now
      setContext(context);
    }
  }, [content]);
  React.useEffect((): void => {
    if (context === null || wrapper === null) return;
    const textWidth: number = getTextWidth(context, children);
    const width: number = wrapper.offsetWidth;
    // In this case do nothing ...

    if (textWidth < width) return;
    // Now we need to start chopping
    const middle: number =
      children.length % 2 === 0
        ? children.length / 2
        : (children.length + 1) / 2;
    for (let i = 2; i < middle - 1; ++i) {
      const slices = [
        children.slice(0, middle - i),
        children.slice(middle + i),
      ];
      const candidate: string = slices[0] + "\u2026" + slices[1];
      const nextWidth: number = getTextWidth(context, candidate);
      if (nextWidth < width) {
        setText(candidate);
        return;
      }
    }
  }, [context, wrapper, children, text]);

  return (
    <div
      className={"address-view-item"}
      ref={setWrapper}
      data-content={children}
    >
      <Typography
        className={props.className}
        variant={props.variant}
        color={props.color}
      >
        {text}
      </Typography>
    </div>
  );
};
