import "./styles.scss";

import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper/Paper";
import starnameLogo from "assets/star.webp";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { Link } from "react-router-dom";
import { MANAGER_BASE_ROUTE } from "routes/paths";

const NameListHeadingItem: React.FC = (): React.ReactElement => {
  return (
    <Paper className={"name-list-heading-item"} variant={"outlined"}>
      <Block className={"label"}>
        <img className={"logo"} alt={"starname logo"} src={starnameLogo} />
        <Typography className={"text"} variant={"h5"}>
          {locales.REGISTER_STARNAME}
        </Typography>
      </Block>
      <Link
        style={{ textDecoration: "none" }}
        to={`${MANAGER_BASE_ROUTE}/register`}
      >
        <Typography variant={"subtitle1"}>{locales.REGISTER_NOW}</Typography>
      </Link>
    </Paper>
  );
};

export default NameListHeadingItem;
