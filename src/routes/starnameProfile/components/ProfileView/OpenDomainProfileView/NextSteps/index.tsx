import { Button } from "@material-ui/core";
import { DoneAll } from "@material-ui/icons";
import config from "config";
import strings from "locales/strings";
import React from "react";
import BackButton from "routes/starnameProfile/components/BackButton";

interface Props {
  starname: string | null;
  onRegister: () => void;
}
const NextSteps = (props: Props): React.ReactElement => {
  const handleVisitStarnameApp = (): void => {
    window.location.replace(config.managerUrl);
  };
  return (
    <>
      <BackButton onClick={props.onRegister} enabled={true} />
      <div className="account-registered-container">
        <DoneAll fontSize="large" color={"primary"} />
        <div className="account-registered-head">
          <h2>
            {strings.CREATED_SUCCESSFULLY + " "}
            <span className="registered-starname">{props.starname}</span>
          </h2>
        </div>
        <div className="first-things">
          <div className="first-things-head">
            <span className="first-things-heading">
              {strings.FIRST_THINGS_FIRST}
            </span>
          </div>
          <div className="upper-note">{strings.WELCOME_TO_COMMUNITY_NOTE}</div>
          <div className="mnemonic-note">{strings.MNEMONIC_NOTE}</div>
        </div>
        <div className="starname-application-note">
          <span>{strings.STARNAME_APPLICATION_INTRO}</span>
          <Button
            color="primary"
            variant="outlined"
            onClick={handleVisitStarnameApp}
          >
            {strings.GO_TO_STARNAME_APPLICATION}
          </Button>
        </div>
      </div>
    </>
  );
};

export default NextSteps;
