import config from "config";

const sendConfirmationEmail = async (
  starname: string,
  idToken: string,
): Promise<boolean> => {
  if (!process.env.REACT_APP_ENV || process.env.REACT_APP_ENV === "local")
    return false;
  const response = await fetch(config.sendConfirmationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      starname,
      idToken,
    }),
  });

  return response.status === 200 ? true : false;
};

export default sendConfirmationEmail;
