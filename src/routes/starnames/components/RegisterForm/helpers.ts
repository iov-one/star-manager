import { Theme } from "@material-ui/core";
import api from "api";
import { TokenLike } from "config";
import { FormStatus } from "forms";
import strings from "locales/strings";
import locales from "locales/strings";
import { Amount } from "types/amount";
import { Fees } from "types/fees";
import { NameType } from "types/nameType";
import { Settings } from "types/settings";
import { ValidatorFn, ValidatorResult } from "types/validators";

export enum StarnameValidatorResult {
  NotStarname = "not-starname",
  TooManyStars = "too-many-stars",
  WrongChars = "invalid-chars",
  Valid = "valid",
  Empty = "empty",
}

const validateDomain = (value: string): StarnameValidatorResult => {
  if (value === "*") return StarnameValidatorResult.Empty;
  if (value === "*iov") return StarnameValidatorResult.Valid;
  if (value.charAt(0) !== "*") {
    return StarnameValidatorResult.NotStarname;
  } else {
    const name: string = value.slice(1);
    const settings: Settings = api.getSettings();
    const regexp = new RegExp(settings.validDomainName);
    if (regexp.test(name)) {
      return StarnameValidatorResult.Valid;
    } else {
      return StarnameValidatorResult.WrongChars;
    }
  }
};

const validateName = (value: string): StarnameValidatorResult => {
  const fragments: string[] = value.split("*");
  if (fragments.length > 2) return StarnameValidatorResult.TooManyStars;
  if (fragments[0].length === 0) return StarnameValidatorResult.Empty;
  const domain: string = "*" + fragments[1];
  const partial: StarnameValidatorResult = validateDomain(domain);
  if (
    partial !== StarnameValidatorResult.WrongChars &&
    partial !== StarnameValidatorResult.Valid
  ) {
    throw new Error("invalid domain supplied, this should NEVER happen");
  } else if (partial === StarnameValidatorResult.WrongChars) {
    console.warn(`domain ${domain} does not match regular expression`);
  }
  const name: string = fragments[0];
  const settings: Settings = api.getSettings();
  const regexp = new RegExp(settings.validAccountName);
  if (regexp.test(name)) {
    return StarnameValidatorResult.Valid;
  } else {
    return StarnameValidatorResult.WrongChars;
  }
};

const validateByType = (
  type: NameType,
  value: string | null | undefined,
): StarnameValidatorResult => {
  if (value === null || value === undefined || value === "")
    return StarnameValidatorResult.Empty;
  // Now actually validate
  if (type === NameType.Domain) {
    return validateDomain(value);
  } else if (type === NameType.Account) {
    return validateName(value);
  } else {
    throw new Error("cannot validate value of type: " + type);
  }
};

const StarnameValidatorMessages: {
  [key in StarnameValidatorResult]: string | undefined;
} = {
  [StarnameValidatorResult.Empty]: undefined,
  [StarnameValidatorResult.NotStarname]:
    locales.STARNAME_VALIDATOR_NOT_STARNAME,
  [StarnameValidatorResult.TooManyStars]:
    locales.STARNAME_VALIDATOR_TOO_MANY_STARS,
  [StarnameValidatorResult.WrongChars]: locales.STARNAME_VALIDATOR_WRONG_CHARS,
  [StarnameValidatorResult.Valid]: undefined,
};

export const starnameValidator =
  (type: NameType): ValidatorFn =>
  (value: string): ValidatorResult => {
    const result: StarnameValidatorResult = validateByType(type, value);
    if (result === StarnameValidatorResult.Empty) {
      return { status: FormStatus.Empty, error: undefined };
    } else if (result === StarnameValidatorResult.Valid) {
      return { status: FormStatus.Valid, error: undefined };
    } else {
      const message: string | undefined = StarnameValidatorMessages[result];
      if (message === undefined)
        throw new Error("invalid validation result: " + result);
      return { status: FormStatus.Invalid, error: message };
    }
  };
const getCost = (
  value: string,
  fees: Fees,
  type: NameType,
  closed: boolean,
): number => {
  const multiplier: number = closed ? 1 : fees.registerOpenDomainMultiplier;
  switch (type) {
    case NameType.Domain:
      if (value.length === 1) {
        return fees.registerDomain1 * multiplier;
      } else if (value.length === 2) {
        return fees.registerDomain2 * multiplier;
      } else if (value.length === 3) {
        return fees.registerDomain3 * multiplier;
      } else if (value.length === 4) {
        return fees.registerDomain4 * multiplier;
      } else if (value.length === 5) {
        return fees.registerDomain5 * multiplier;
      } else {
        return fees.registerDomainDefault * multiplier;
      }
    case NameType.Account:
      if (closed) {
        return fees.registerAccountClosed;
      } else {
        return fees.registerAccountOpen;
      }
    default:
      throw new Error("cannot determine the name type to compute the fee");
  }
};

export const getPrice = (
  value: string,
  type: NameType,
  closed: boolean,
): Amount | undefined => {
  const fees: Fees = api.getFees();
  const cost: number = getCost(value, fees, type, closed);
  // Get the associated token to compute the value and
  // format it
  const token: TokenLike | undefined = api.getToken(fees.feeCoinDenom);
  if (token === undefined)
    throw new Error("cannot get price for denom `" + fees.feeCoinDenom + "'");
  return new Amount(cost / fees.feeCoinPrice, token);
};

export const getInputStyle = (theme: Theme): any => {
  const { overrides } = theme;
  if (!overrides) return {};
  const { MuiOutlinedInput } = overrides;
  if (!MuiOutlinedInput) return {};
  const { input } = MuiOutlinedInput;
  if (!input) return {};
  return input;
};

export const RegisterDomainTypes = [
  {
    label: strings.NO,
    value: 0,
  },
  {
    label: strings.YES,
    value: 1,
  },
];
