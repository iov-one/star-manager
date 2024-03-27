import clipboardCopy from "clipboard-copy";
import { MiddleEllipsis } from "components/MiddleEllipsis";
import toast, { ToastType } from "components/toast";
import locales from "locales/strings";
import strings from "locales/strings";
import { WelcomeStore, WelcomeStoreContext } from "mobx/stores/welcomeStore";
import { observer } from "mobx-react";
import React from "react";
import styles from "routes/welcome/styles.module.scss";

interface Props {
  readonly title: string;
}

export const Step3: React.FC<Props> = observer((): React.ReactElement => {
  const store = React.useContext<WelcomeStore>(WelcomeStoreContext);

  const copy = (): void => {
    clipboardCopy(store.address).then(() => {
      toast.show(locales.ADDRESS_HAS_BEEN_COPIED, ToastType.Success);
    });
  };

  return (
    <div>
      <h1>{strings.WELCOME_FLOW_STEP3_TITLE}</h1>
      <h4>{strings.WELCOME_FLOW_STEP3_MESSAGE}</h4>
      <div className={styles.addressView}>
        <div className={styles.addressViewAddressContainer}>
          <MiddleEllipsis variant={"h1"}>{store.address}</MiddleEllipsis>
        </div>
        <button disabled={store.address === ""} onClick={copy}>
          <i className={"fa fa-copy"} />{" "}
        </button>
      </div>
    </div>
  );
});
