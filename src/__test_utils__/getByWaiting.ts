import "@testing-library/react";

import { RenderResult, waitFor } from "@testing-library/react";
export const getByWaiting = async <T extends HTMLElement = HTMLElement>(
  fn: (value: string) => HTMLElement,
  container: RenderResult,
  text: string,
  options: {
    timeout?: number;
  } = {
    timeout: undefined,
  },
): Promise<T> => {
  await waitFor(
    (): void => expect(fn.call(container, text)).toBeInTheDocument(),
    options,
  );
  return fn.call(container, text) as T;
};

export const getByTextWaiting = <T extends HTMLElement = HTMLElement>(
  container: RenderResult,
  text: string,
  options: {
    timeout?: number;
  } = {
    timeout: undefined,
  },
): Promise<T> => {
  return getByWaiting(container.getByText, container, text, options);
};

export const getByTestIdWaiting = <T extends HTMLElement = HTMLElement>(
  container: RenderResult,
  text: string,
  options: {
    timeout?: number;
  } = {
    timeout: undefined,
  },
): Promise<T> => {
  return getByWaiting(container.getByTestId, container, text, options);
};

export const getByPlaceholderTextWaiting = <
  T extends HTMLElement = HTMLElement,
>(
  container: RenderResult,
  text: string,
  options: {
    timeout?: number;
  } = {
    timeout: undefined,
  },
): Promise<T> => {
  return getByWaiting(container.getByPlaceholderText, container, text, options);
};

export const getFirstByTextWaiting = async <
  T extends HTMLElement = HTMLElement,
>(
  container: RenderResult,
  text: string,
  options: {
    timeout?: number;
  } = {
    timeout: undefined,
  },
): Promise<T> => {
  await waitFor(
    (): void => expect(container.getAllByText(text)[0]).toBeInTheDocument(),
    options,
  );
  return container.getAllByText(text)[0] as T;
};
