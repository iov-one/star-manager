import "./style.scss";

import config from "config";
import locales from "locales/strings";
import React from "react";

interface Props {
  starname: string;
}

const StarnameNotFound: React.FC<Props> = (props: Props) => {
  return (
    <div className={"starname-not-found-view"}>
      <div className={"message"}>
        {locales.CONGRATULATIONS}
        <span className={"starname"}>{props.starname}</span>
        {" " + locales.IS_AVAILABLE}
        <br />
        {locales.NOT_FOUND_YOU_CAN_REGISTER}
      </div>
      <a
        href={`${config.managerUrl}?starname=${props.starname}`}
        target={"_blank"}
        rel={"noopener noreferrer"}
        className={"link"}
      >
        {locales.CLICK_HERE_TO_REGISTER}
      </a>
    </div>
  );
};

export default StarnameNotFound;
