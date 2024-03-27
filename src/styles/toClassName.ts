export const toClassName = (
  base: string,
  map: { [name: string]: boolean },
): string => {
  const entries = Object.entries(map);
  return entries
    .reduce(
      (
        classes: ReadonlyArray<string>,
        entry: [string, boolean],
      ): ReadonlyArray<string> => {
        if (!entry[1]) {
          return classes;
        }
        return [...classes, entry[0]];
      },
      [base],
    )
    .join(" ");
};
