import "./style.scss";

import React from "react";
import { IMAGES } from "routes/starnameProfile/Assets";

type AvatarProps = {
  image: string | null;
};

const Avatar: React.FC<AvatarProps> = (props) => {
  if (props.image === "stub") {
    return (
      <img
        src={IMAGES.DEFAULT_IMAGE}
        alt={"user avatar"}
        style={{ filter: "grayscale(100%)", opacity: 0.25 }}
      />
    );
  }
  return (
    <img
      src={props.image !== null ? props.image : IMAGES.DEFAULT_IMAGE}
      alt={"user avatar"}
    />
  );
};

export default Avatar;
