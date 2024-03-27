import api from "api";
import config from "config";
import locales from "locales/strings";
import { Task } from "logic/httpClient";
import { Starname } from "types/resolveResponse";
import { Resource } from "types/resourceInfo";

export const NoIOVAddressLinkedToStarnameError = {
  code: 600,
  title: "" /* Not relevant now */,
  body: locales.NO_LINKED_ADDRESS_TO_STARNAME,
};

export const getIOVAddressForStarname = (name: string): Task<string> => {
  const task: Task<Starname> = api.resolveStarname(name);
  return {
    run: async (): Promise<string> => {
      const { mainAsset } = config;
      const starname: Starname = await task.run();
      const { resources } = starname;
      if (resources !== null) {
        const found: Resource | undefined = resources.find(
          (resource: Resource): boolean =>
            resource.uri === mainAsset["starname-uri"],
        );
        if (found === undefined) throw NoIOVAddressLinkedToStarnameError;
        return found.resource;
      } else {
        throw NoIOVAddressLinkedToStarnameError;
      }
    },
    abort: (): void => {
      task.abort();
    },
  };
};
