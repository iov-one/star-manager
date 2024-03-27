import logo from "assets/logo.webp";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import { WelcomeStore, WelcomeStoreContext } from "mobx/stores/welcomeStore";
import { observer } from "mobx-react";
import React from "react";
import { useHistory } from "react-router";
import { Stepper } from "routes/welcome/stepper/stepper";
import { Step1 } from "routes/welcome/steps/step1";
import { Step2 } from "routes/welcome/steps/step2";
import { Step3 } from "routes/welcome/steps/step3";
import { SeedPhraseSigner } from "signers/seedPhrase";
import { Wallet } from "signers/wallet";

import styles from "./styles.module.scss";

export const WelcomeFlow: React.FC = observer((): React.ReactElement => {
  const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
  const store = React.useContext<WelcomeStore>(WelcomeStoreContext);
  const history = useHistory();

  const onCompleted = (): void => {
    const signer = new SeedPhraseSigner();
    signer.initialize(store.mnemonic).then((initialized: boolean): void => {
      if (initialized) {
        sessionStore.setWallet(new Wallet(signer));
        history.replace("/");
      }
    });
  };

  const onCancel = (): void => history.replace("/");

  return (
    <div className={styles.rootContainer}>
      <div className={styles.logo}>
        <img src={logo} alt={"company-logo"} />
      </div>

      <Stepper
        className={styles.pager}
        isNextAvailable={store.isNextAvailable}
        onCancel={onCancel}
        onStepChange={store.setCurrentStep}
        onCompleted={onCompleted}
      >
        <Step1
          key={"step1"}
          words={store.words}
          title={"Save your seed phrase"}
        />
        <Step2 key={"step2"} title={"Prove that you saved it"} />
        <Step3 key={"step3"} title={"Congratulations!"} />
      </Stepper>
    </div>
  );
});
