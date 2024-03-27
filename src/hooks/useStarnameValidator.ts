import api from "api";
import { FormStatus } from "forms";
import locales from "locales/strings";
import { Task } from "logic/httpClient";
import React from "react";
import { starnameValidator } from "routes/starnames/components/RegisterForm/helpers";
import { Domain, isDomain } from "types/domain";
import { Escrow, isEscrowDomainObject } from "types/escrow";
import { NameType } from "types/nameType";
import { Starname } from "types/resolveResponse";
import { ValidatorFn } from "types/validators";
// Static validators that exist for the lifetime of
// the application and prevent unwanted re-renders
const validators: { [key in NameType]: ValidatorFn } = {
  [NameType.Domain]: starnameValidator(NameType.Domain),
  [NameType.Account]: starnameValidator(NameType.Account),
};

interface FormResponse {
  status: FormStatus;
  data?: object;
  error?: string;
}

interface FormEscrowData {
  escrow: Escrow;
}

export default function useStarnameValidator(
  name: string,
  domain: string | undefined,
  type: NameType,
): FormResponse {
  const settings = api.getSettings();
  const [result, setResult] = React.useState<FormResponse>({
    status: FormStatus.Valid,
  });
  const [value, setValue] = React.useState<string>("");

  const validityBasedHandler = (validity: number, type: NameType): void => {
    // for js its in ms
    if (
      Date.now() >
      validity * 1000 +
        (type === NameType.Domain
          ? settings.domainGracePeriod
          : settings.accountGradePeriod)
    )
      setResult({
        status: FormStatus.AvailableAfterExpiry,
      });
    else
      setResult({
        status: FormStatus.Invalid,
        error: locales.UNAVAILABLE_STARNAME,
      });
  };

  const notFoundHandler = (error: any): void => {
    if ("code" in error) {
      if (error.code === 400) {
        setResult({
          status: FormStatus.Valid,
        });
      }
    }
  };

  const existingStarnameHandler = async (
    entity: Starname | Domain,
  ): Promise<void> => {
    const starnameIsDomain = isDomain(entity);
    const starname = starnameIsDomain
      ? `*${entity.name}`
      : `${entity.name}*${entity.domain}`;
    // query escrows for this starname
    const escrows = await Task.toPromise(
      api.getEscrows(undefined, "open", starname),
    );
    if (escrows.length === 1) {
      const escrow = escrows[0];
      if (isEscrowDomainObject(escrow.object)) {
        // only allow closed domains for now
        if (escrow.object.value.type === "closed") {
          setResult({
            status: FormStatus.AvailableFromEscrow,
            data: {
              escrow: escrow,
            } as FormEscrowData,
          });
          return;
        }
      } else {
        setResult({
          status: FormStatus.AvailableFromEscrow,
          data: {
            escrow: escrow,
          } as FormEscrowData,
        });
        return;
      }
    }
    if (starnameIsDomain) {
      validityBasedHandler(entity.validUntil, NameType.Domain);
    } else {
      validityBasedHandler(Number(entity.valid_until), NameType.Account);
    }
  };

  React.useEffect((): (() => void) | void => {
    const timer = setTimeout((): void => {
      switch (type) {
        case NameType.Domain:
          setValue(`*${name}`);
          break;
        case NameType.Account:
          setValue(`${name}*${domain}`);
          break;
      }
    }, 300);
    return (): void => {
      clearTimeout(timer);
    };
  }, [domain, name, type]);
  React.useEffect((): (() => void) | undefined => {
    const result = validators[type](value);
    if (result.status !== FormStatus.Valid) {
      setResult({ status: result.status, error: result.error });
      return undefined;
    } else {
      setResult({ status: FormStatus.Validating });
      const task =
        type === NameType.Domain
          ? api.getDomainInfo(value.split("*")[1])
          : api.resolveStarname(value);
      task.run().then(existingStarnameHandler).catch(notFoundHandler);
      return () => task.abort();
    }
  }, [value, type]);
  return result;
}

export const isEscrowData = (data: any): data is FormEscrowData => {
  if (typeof data !== "object") return false;
  if ("escrow" in data) return true;
  return false;
};
