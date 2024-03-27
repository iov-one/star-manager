import React from "react";

interface PageProps {
  readonly page: number;
}

const Page: React.FC<React.PropsWithChildren<PageProps>> = (
  props: React.PropsWithChildren<PageProps>,
): React.ReactElement => {
  return <>{props.children}</>;
};

interface PagerProps {
  readonly currentPage: number;
  readonly children?:
    | ReadonlyArray<React.ReactElement<PageProps>>
    | React.ReactElement<PageProps>;
}

const Pager: React.FC<PagerProps> = (props: PagerProps): React.ReactElement => {
  const array: ReadonlyArray<React.ReactNode> = React.Children.toArray(
    props.children,
  );
  const percentage = 100 * props.currentPage;
  return (
    <div className={"pager"}>
      {array.map((child: React.ReactNode): React.ReactElement => {
        const {
          props: { page },
        } = child as React.ReactElement<PageProps>;
        return (
          <div
            key={page}
            style={{
              transform: `translateX(-${percentage}%)`,
            }}
            className={
              "page " + (page === props.currentPage ? "visible" : "hidden")
            }
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export { Pager, Page };
export type { PageProps, PagerProps };
