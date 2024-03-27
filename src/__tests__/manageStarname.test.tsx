import "@testing-library/jest-dom/extend-expect";

import { WAIT_BECAUSE_IT_TAKES_TIME } from "__mocks__/constants";
import { createRandomName, createRandomString } from "__mocks__/helpers";
import { renderView } from "__mocks__/renderView";
import { MockSigner } from "__mocks__/signer";
import { createBeforeAllHandler } from "__test_utils__/beforeAllHandler";
import {
  getByPlaceholderTextWaiting,
  getByTestIdWaiting,
  getByTextWaiting,
  getFirstByTextWaiting,
} from "__test_utils__/getByWaiting";
import { getHtmlElementNthParent } from "__test_utils__/getHtmlElementNthParent";
import { fireEvent, waitFor } from "@testing-library/react";
import { PROFILE_BLOCKCHAIN_ADDRESS_INPUT_TESTID } from "constants/profileTestIds";
import locales from "locales/strings";
import { Signer } from "signers/signer";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { ApplicationName } from "types/applicationName";
import { isTransactionSuccess } from "types/postTxResult";

xdescribe("Manage Starname", (): void => {
  const signer: Signer = new MockSigner(SignerType.Google);
  const wallet: Wallet = new Wallet(signer);

  const premium = `*${createRandomString(8)}`;

  const registerStarname = async (): Promise<void> => {
    const result = await wallet.registerDomain(premium.slice(1));
    if (!isTransactionSuccess(result)) {
      throw new Error(`could not register domain`);
    }
  };

  beforeAll(
    createBeforeAllHandler(signer, wallet, registerStarname),
    WAIT_BECAUSE_IT_TAKES_TIME,
  );

  it("Can add account to premium starname", async (): Promise<void> => {
    const view = await renderView(signer, wallet, ApplicationName.Manager);
    const title = await getByTextWaiting(view, premium, {
      timeout: WAIT_BECAUSE_IT_TAKES_TIME,
    });
    const item = getHtmlElementNthParent(title, 3);
    const manage = item.querySelector("a");

    expect(manage).not.toBeNull();
    if (manage !== null) {
      manage.click();
    }

    const edit = await getFirstByTextWaiting(view, locales.EDIT, {
      timeout: WAIT_BECAUSE_IT_TAKES_TIME,
    });
    edit.click();

    await waitFor(() =>
      expect(view.getByText(locales.ADD_MORE)).toBeInTheDocument(),
    );

    const add = await getByTextWaiting(view, locales.ADD_MORE);
    add.click();

    const manually = await getByTextWaiting(view, locales.ADD_MANUALLY);
    manually.click();

    const iovAddress = await wallet.getAddress();

    let input: HTMLInputElement = await getByTestIdWaiting(
      view,
      PROFILE_BLOCKCHAIN_ADDRESS_INPUT_TESTID,
    );
    fireEvent.change(input, { target: { value: iovAddress } });
    expect(input.value).toBe(iovAddress);

    const randomName = createRandomName();

    input = await getByPlaceholderTextWaiting(view, locales.YOUR_NAME);
    fireEvent.change(input, { target: { value: randomName } });
    expect(input.value).toBe(randomName);

    await waitFor((): void =>
      expect(view.getByText(locales.UPDATE)).toBeEnabled(),
    );

    const update = view.getByText(locales.UPDATE);
    update.click();

    // If this element is in the view, it means we were redirected!!!
    await waitFor(
      (): void =>
        expect(view.getByText(locales.REGISTER_STARNAME)).toBeInTheDocument(),
      { timeout: WAIT_BECAUSE_IT_TAKES_TIME },
    );

    // Now let's check that we actually see the stuff!
  });
});
