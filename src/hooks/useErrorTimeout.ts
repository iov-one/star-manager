import React from "react";

export const useErrorTimeout = (
  seconds = 4,
): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [errMsg, setErrMsg] = React.useState<string>("");
  React.useEffect(() => {
    if (errMsg) {
      setTimeout(() => {
        setErrMsg("");
      }, seconds * 1000);
    }
  }, [errMsg, seconds]);
  return [errMsg, setErrMsg];
};
