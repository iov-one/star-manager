import IMask from "imask";
import React from "react";

export const useNumericInput = (
  maxFractionDigits: number,
  max: number,
  defaultValue: number | null,
  onChange: (value: number) => void,
): React.Ref<HTMLInputElement> => {
  const inputRef: React.Ref<HTMLInputElement> =
    React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const { current } = inputRef;
    if (current === null) return;
    // We are not using this value anyway
    const options: IMask.MaskedNumberOptions = {
      mask: Number,
      normalizeZeros: true,
      max: max,
      scale: maxFractionDigits,
    };
    const mask: IMask.InputMask<IMask.MaskedNumberOptions> = IMask(
      current,
      options,
    );
    if (defaultValue !== null) {
      mask.typedValue = defaultValue;
    }
    const accept = (): void => onChange(mask.typedValue);
    mask.on("accept", accept);
    return () => {
      mask.off("accept", accept);
      mask.destroy();
    };
  }, [inputRef, defaultValue, max, maxFractionDigits, onChange]);
  return inputRef;
};
