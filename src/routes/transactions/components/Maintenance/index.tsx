import "./style.scss";

import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import React from "react";

const Maintenance = (): React.ReactElement => {
  return (
    <Block className="maintenance-container">
      <img
        src="https://res.cloudinary.com/starname/image/upload/v1650896284/Images/barrier_hkbkzl.svg"
        alt="barrier"
      />
      <Typography variant={"h2"} gutterBottom>
        {`We'll be back soon!`}
      </Typography>
      <Typography variant={"subtitle2"} gutterBottom>
        The application is undergoing maintenance right now
      </Typography>
      <Typography variant={"subtitle2"}>Please check back later</Typography>
    </Block>
  );
};

export default Maintenance;
