import React from "react";

export const useStoreInstance = <T>(instance: T): T => {
  const ref: React.Ref<T> = React.useRef<T>(instance);
  if (ref.current === null) {
    throw new Error(
      "you passed a null instance to use as store, this is not what this hook is for",
    );
  }
  return ref.current;
};
