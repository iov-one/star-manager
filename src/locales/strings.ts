import en from "locales/en";

const languages = {
  en,
};

export default languages["en"];
export const templateToString = (
  template: string,
  values: { [key: string]: string | number },
): string => {
  const entries: ReadonlyArray<[string, string | number]> =
    Object.entries(values);
  return entries.reduce(
    (final: string, [key, value]: [string, string | number]): string => {
      const regex = new RegExp(`%{${key}}`, "g");
      return final.replace(regex, value.toString());
    },
    template,
  );
};
