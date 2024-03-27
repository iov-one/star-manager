import "@testing-library/jest-dom/extend-expect";

import { WAIT_BECAUSE_IT_TAKES_TIME } from "__mocks__/constants";
import { createRandomString } from "__mocks__/helpers";
import { renderView } from "__mocks__/renderView";
import { MockSigner } from "__mocks__/signer";
import { createBeforeAllHandler } from "__test_utils__/beforeAllHandler";
import { fireEvent, waitFor } from "@testing-library/react";
import api from "api";
import { LOADING_SCREEN_TESTID } from "constants/commonTestIds";
import { POSITIVE_REGISTER_BUTTON_TESTID } from "constants/registerFormTestIds";
import { POSITIVE_REQUEST_FREE_STARNAME_BUTTON_TESTID } from "constants/requestFreeStarnameTestIds";
import locales from "locales/strings";
import { Signer } from "signers/signer";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { ApplicationName } from "types/applicationName";

xdescribe("BUY scenarios", (): void => {
  const signer: Signer = new MockSigner(SignerType.Google);
  const wallet: Wallet = new Wallet(signer);

  beforeAll(createBeforeAllHandler(signer, wallet), WAIT_BECAUSE_IT_TAKES_TIME);

  it("Can get a free starname", async (): Promise<void> => {
    const view = await renderView(signer, wallet, ApplicationName.Manager);

    await waitFor(
      () => expect(view.getByText(locales.CONTINUE)).toBeInTheDocument(),
      { timeout: WAIT_BECAUSE_IT_TAKES_TIME },
    );

    const continueButton = view.getByText(locales.CONTINUE);
    continueButton.click();

    await waitFor(() =>
      expect(
        view.getByPlaceholderText(locales.FREE_STARNAME_INPUT_PLACEHOLDER),
      ).toBeInTheDocument(),
    );

    const input: HTMLInputElement = view.getByPlaceholderText(
      locales.FREE_STARNAME_INPUT_PLACEHOLDER,
    ) as HTMLInputElement;

    const randomName = createRandomString(4, "free");

    fireEvent.change(input, { target: { value: randomName } });
    expect(input.value).toBe(randomName);

    await waitFor(() =>
      expect(
        view.getByTestId(POSITIVE_REQUEST_FREE_STARNAME_BUTTON_TESTID),
      ).toBeEnabled(),
    );

    const createButton = view.getByTestId(
      POSITIVE_REQUEST_FREE_STARNAME_BUTTON_TESTID,
    );
    createButton.click();

    const starname = api.getStarname(randomName);
    expect(starname).not.toBeNull();
  });

  const __commonStarnameBuyTest = async (
    edition: string,
    prefix: string,
    transform: (_: string) => string,
  ): Promise<void> => {
    const view = await renderView(signer, wallet, ApplicationName.Manager);

    await waitFor(() =>
      expect(view.getByTestId(LOADING_SCREEN_TESTID)).toBeInTheDocument(),
    );
    await waitFor(
      () => expect(view.getByText(locales.REGISTER_NOW)).toBeInTheDocument(),
      { timeout: WAIT_BECAUSE_IT_TAKES_TIME },
    );
    await waitFor(
      () => expect(view.getByText(locales.REGISTER_NOW)).toBeInTheDocument(),
      { timeout: WAIT_BECAUSE_IT_TAKES_TIME },
    );

    const link = view.getByText(locales.REGISTER_NOW);
    link.click();

    await waitFor(() => expect(view.getByText(edition)).toBeInTheDocument());

    const editionTab = view.getByText(edition);
    editionTab.click();

    const input: HTMLInputElement = view.getByPlaceholderText(
      locales.PLACEHOLDER_NAME_NEWSTARNAME,
    ) as HTMLInputElement;

    const name = createRandomString(4, prefix);

    fireEvent.change(input, { target: { value: name } });
    expect(input.value).toBe(name);

    const button = view.getByTestId(POSITIVE_REGISTER_BUTTON_TESTID);
    await waitFor(() => expect(button).toBeEnabled(), {
      timeout: WAIT_BECAUSE_IT_TAKES_TIME,
    });
    button.click();

    await waitFor(() =>
      expect(button.querySelector(".spinner.container")).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(button.querySelector(".spinner.container")).toBeInTheDocument(),
    );

    await waitFor(
      () =>
        expect(
          button.querySelector(".spinner.container"),
        ).not.toBeInTheDocument(),
      { timeout: WAIT_BECAUSE_IT_TAKES_TIME },
    );

    await waitFor(
      () => expect(view.getByText(transform(name))).toBeInTheDocument(),
      { timeout: WAIT_BECAUSE_IT_TAKES_TIME },
    );

    const itemTitle = view.getByText(transform(name));
    expect(itemTitle.tagName).toBe("H4");
  };

  it("Can buy a PREMIUM starname", async (): Promise<void> => {
    const transform = (name: string): string => `*${name}`;
    await __commonStarnameBuyTest(locales.PREMIUM, "prem", transform);
  });

  it("Can buy a BASIC starname", async (): Promise<void> => {
    const transform = (name: string): string => `${name}*iov`;
    await __commonStarnameBuyTest(locales.BASIC, "basic", transform);
  });
});
