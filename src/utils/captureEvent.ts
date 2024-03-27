import config from "config";

const captureEvent = async (txHash: string): Promise<boolean> => {
  if (!process.env.REACT_APP_ENV || process.env.REACT_APP_ENV === "local")
    return false;
  const response = await fetch(config.captureEventsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txHash,
    }),
  });

  return response.ok ? true : false;
};

export default captureEvent;
