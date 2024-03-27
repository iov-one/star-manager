export const toSubPath = (fullPath: string, components: number): string => {
  const fragments: string[] = fullPath.split("/");
  const subSet: string[] = fragments.slice(0, components + 1);
  return subSet.join("/");
};
