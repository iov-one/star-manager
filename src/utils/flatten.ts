// Flatten an array of arrays into an array of the internal's array type
export const flatten = <T>(
  array: ReadonlyArray<ReadonlyArray<T>>,
): ReadonlyArray<T> => {
  return array.reduce(
    (chunk: ReadonlyArray<T>, next: ReadonlyArray<T>): ReadonlyArray<T> => {
      return [...chunk, ...next];
    },
    [],
  );
};
