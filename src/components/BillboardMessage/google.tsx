import google from "assets/google-billboard.svg";
import { Block } from "components/block";
import React from "react";

import { GenericBillboard, Props } from "./index";

const GoogleBillboardMessage: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  return (
    <GenericBillboard text={props.text}>
      <Block display={"flex"} alignItems={"center"} justifyContent={"center"}>
        <img height={64} src={google} alt={"google"} />
      </Block>
    </GenericBillboard>
  );
};

export default GoogleBillboardMessage;
