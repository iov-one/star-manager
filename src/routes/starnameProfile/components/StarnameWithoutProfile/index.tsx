import "./style.scss";

import locales from "locales/strings";
import React from "react";

interface Props {
  starname: string;
}

const StarnameWithoutProfile: React.FC<Props> = (props: Props) => {
  return (
    <div className={"starname-not-found-view"}>
      <div className={"message"}>
        {locales.STARNAME} <span className={"starname"}>{props.starname}</span>{" "}
        {locales.EXISTS_BUT_HAS_NO_PROFILE}
      </div>
      <a
        href={"https://app.starname.me/"}
        target={"_blank"}
        rel={"noopener noreferrer"}
        className={"link"}
      >
        {locales.CLICK_HERE_TO_CREATE_PROFILE}
      </a>
    </div>
  );
};

export default StarnameWithoutProfile;
