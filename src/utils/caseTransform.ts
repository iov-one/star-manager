const lower = (input: string): string => input.toLowerCase();
const upper = (input: string): string => input.toUpperCase();

export const toSnakeCase = (camelCase: string): string => {
  const snakeCase = camelCase.replaceAll(/([A-Z])/g, "_$1");
  if (snakeCase.startsWith("_")) {
    return lower(snakeCase.slice(1));
  } else {
    return lower(snakeCase);
  }
};

export const toCamelCase = (snakeCase: string): string => {
  return snakeCase.replaceAll(/_[a-z]/g, (match: string): string =>
    upper(match.slice(1)),
  );
};

export const transformKeys = (
  object: { [key: string]: any },
  transformer: (key: string) => string,
): { [key: string]: any } => {
  const entries = Object.entries(object);
  return entries.reduce(
    (
      result: { [key: string]: any },
      [key, value]: [string, any],
    ): { [key: string]: any } => {
      const transformedKey = transformer(key);
      return {
        ...result,
        [transformedKey]: value,
      };
    },
    {},
  );
};
