import "./styles.scss";

import { ThemeProvider, Typography } from "@material-ui/core";
import { createPopper, Instance } from "@popperjs/core";
import { Block } from "components/block";
import { ContentProps, TooltipContent } from "components/tooltipContent";
import React, { PropsWithChildren } from "react";
import ReactDOM from "react-dom";
import theme from "theme";

interface Props {
  maxWidth?: number;
  direction?: "ltr" | "rtl";
  label: string;
}

export class Tooltip extends React.PureComponent<PropsWithChildren<Props>> {
  private root: HTMLDivElement | null = null;
  private floatable: HTMLDivElement | null = null;
  private popper: Instance | null = null;
  private anchorRef: React.RefObject<HTMLImageElement> =
    React.createRef<HTMLImageElement>();

  public static defaultProps = {
    direction: "rtl",
  };

  public static Content: React.FC<PropsWithChildren<ContentProps>> =
    TooltipContent;

  public componentDidMount = (): void => {
    this.create();
  };

  public componentWillUnmount = (): void => {
    this.destroy();
  };

  private create = (): void => {
    const { props } = this;
    const { body } = document;
    const floatable: HTMLDivElement = document.createElement("div");
    const root: HTMLDivElement = document.createElement("div");
    // This is important for subsequent interactions
    root.setAttribute("class", "tooltip-page-cover");
    root.appendChild(floatable);
    root.addEventListener("click", this.onClick);
    // Add inheritable styles
    if (props.maxWidth !== undefined)
      floatable.style.maxWidth = `${props.maxWidth}px`;
    // Add this element to the document, through the body
    body.appendChild(root);
    // Make it available now
    this.floatable = floatable;
    this.root = root;
  };

  private destroy = (): void => {
    const { popper, root } = this;
    const { body } = document;
    // Close the popper
    if (popper !== null) popper.destroy();
    // Remove floatable now
    if (root !== null) {
      root.removeEventListener("click", this.onClick);
      body.removeChild(root);
    }
    // Reset
    this.popper = null;
    this.root = null;
  };

  private onClick = (): void => {
    this.destroy();
    // Create it again as it was not unmounted, so it
    // has to be clickable again
    this.create();
  };

  private showTooltip = (): void => {
    const { props, floatable, root } = this;
    const { current } = this.anchorRef;
    if (root === null || floatable === null) {
      throw new Error("invalid state, elements not created yet");
    } else {
      root.setAttribute("class", "tooltip-page-cover active");
      // Not ready yet, unlikely but prevents a disaster
      if (current === null) return;
      // Use the very smart popper library :)
      this.popper = createPopper(current, floatable);
      // Render
      ReactDOM.render(
        <ThemeProvider theme={theme}>{props.children}</ThemeProvider>,
        floatable,
      );
    }
  };

  public render(): React.ReactElement {
    const { props } = this;
    const elements: React.ReactElement[] = [
      <Typography key={"label"} variant={"subtitle2"}>
        {props.label}
      </Typography>,
    ];
    if (props.direction === "ltr") {
      elements.push(
        <img
          className={"question-mark ltr"}
          key={"icon"}
          src={"/assets/icons/questionmark.svg"}
          alt={props.label}
          ref={this.anchorRef}
        />,
      );
    } else {
      elements.unshift(
        <img
          className={"question-mark rtl"}
          key={"icon"}
          src={"/assets/icons/questionmark.svg"}
          alt={props.label}
          ref={this.anchorRef}
        />,
      );
    }
    return (
      <Block className={"tooltip-container"} onClick={this.showTooltip}>
        {elements}
      </Block>
    );
  }
}
