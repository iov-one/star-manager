import { CSSProperties } from "@material-ui/styles";
import React, { PropsWithoutRef, RefAttributes } from "react";

interface Props extends React.PropsWithChildren<React.CSSProperties> {
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly component?: React.ComponentType<any>;
  readonly onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  readonly ["data-testid"]?: string;
}

const Div: React.ForwardRefExoticComponent<any> = React.forwardRef(
  (props: any, ref?: React.Ref<HTMLDivElement>) => <div ref={ref} {...props} />,
);

export const Block: React.ForwardRefExoticComponent<
  PropsWithoutRef<Props> & RefAttributes<HTMLElement>
> = React.forwardRef<HTMLElement, Props>(
  (
    props: React.PropsWithChildren<Props>,
    ref?: React.Ref<HTMLElement>,
  ): React.ReactElement | null => {
    const {
      "data-testid": testId,
      id,
      children,
      className,
      component = Div,
      onClick,
      ...style
    } = props;
    if (style.width === "medium") {
      style.width = 650;
    } else if (style.width === "narrow") {
      style.width = 560;
    }
    const Component: React.ComponentType<any> | undefined = component;
    if (Component === undefined) return null;
    return (
      <Component
        id={id}
        ref={ref}
        data-testid={testId}
        className={className}
        style={style}
        onClick={onClick}
      >
        {children}
      </Component>
    );
  },
);
