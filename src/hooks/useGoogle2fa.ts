import config from "config";
import React from "react";
import { GDriveCustodianContext } from "signers/gdrive/context";
import {
  Check2faData,
  Register2faData,
  Remove2faData,
  Verify2faData,
} from "types/twoFactorAuthGoogle";

export const useGoogle2FA = (): {
  check2faUser: () => Promise<Check2faData | null>;
  register2faUser: () => Promise<Register2faData | null>;
  verify2faUser: (token: string) => Promise<Verify2faData | null>;
  remove2faUser: (token: string) => Promise<Remove2faData | null>;
} => {
  const { twoFactorAuthUrls } = config;
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const custodian = React.useContext(GDriveCustodianContext);
  const [idToken, setIdToken] = React.useState<string>("");

  const check2faUser = async (): Promise<Check2faData | null> => {
    try {
      const response = await fetch(twoFactorAuthUrls.check, {
        ...requestOptions,
        body: JSON.stringify({ idToken }),
      });
      if (response.status !== 200) return null;
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const register2faUser = async (): Promise<Register2faData | null> => {
    try {
      const response = await fetch(twoFactorAuthUrls.register, {
        ...requestOptions,
        body: JSON.stringify({ idToken }),
      });
      if (response.status !== 200) return null;
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const verify2faUser = async (
    token: string,
  ): Promise<Verify2faData | null> => {
    try {
      const response = await fetch(twoFactorAuthUrls.verify, {
        ...requestOptions,
        body: JSON.stringify({ idToken, token }),
      });
      if (response.status !== 200) return null;
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const remove2faUser = async (
    token: string,
  ): Promise<Remove2faData | null> => {
    try {
      const response = await fetch(twoFactorAuthUrls.remove, {
        ...requestOptions,
        body: JSON.stringify({ idToken, token }),
      });
      if (response.status !== 200) return null;
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  React.useEffect(() => {
    setIdToken(custodian.getIdToken());
  }, [custodian]);
  return { check2faUser, register2faUser, verify2faUser, remove2faUser };
};
