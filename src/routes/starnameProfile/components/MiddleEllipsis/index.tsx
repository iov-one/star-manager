import React from "react";

interface Props {
  readonly children: string;
  readonly className?: string;
}

export const MiddleEllipsis: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { children } = props;
  const wrapper = React.useRef<HTMLDivElement | null>(null);
  const [text, setText] = React.useState<string>(children);
  React.useEffect((): void => {
    if (wrapper === null) return;
    // IT IS IMPORTANT TO DO THIS AFTER THE NEW TEXT HAS BEEN RENDERED
    // AND THAT'S WHY WE USE setTimeout(() => {}, 0)
    setTimeout((): void => {
      if (!wrapper.current) return;
      const middle = (children.length - (children.length % 2)) / 2;
      // Shrink the text
      setText(
        children.slice(0, middle - 1) + "\u2026" + children.slice(middle + 10),
      );
    }, 0);
  }, [wrapper, children]);
  return (
    <div ref={wrapper} className={props.className} data-content={children}>
      {text}
    </div>
  );
};
