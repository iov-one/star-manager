export const getHtmlElementNthParent = (
  element: HTMLElement,
  depth: number,
): HTMLElement => {
  let parent: HTMLElement | null = element;
  for (let i = 0; i < depth; ++i) {
    parent = parent.parentElement;
    if (parent === null) {
      throw new Error("cannot find the parent at that level");
    }
  }
  return parent;
};
