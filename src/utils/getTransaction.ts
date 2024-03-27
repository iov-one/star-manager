import api from "api";
import { Task } from "logic/httpClient";
import { Validator } from "types/delegationValidator";
import { Escrow } from "types/escrow";

const reverseLookup = async (address: string): Promise<string> => {
  const task = api.resourceAccounts(address);
  const list = await task.run();
  if (list.length === 0) {
    return address;
  } else {
    return list.slice(0, 3).join(", ");
  }
};

const getEscrow = async (id: string): Promise<Escrow> => {
  return Task.toPromise(api.getEscrowWithId(id));
};

const getValidator = async (address: string): Promise<Validator> => {
  const task = api.getValidator(address);
  return task.run();
};

export { reverseLookup, getValidator, getEscrow };
