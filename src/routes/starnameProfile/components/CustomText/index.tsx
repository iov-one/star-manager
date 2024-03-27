import "./style.scss";

import React, { PropsWithChildren } from "react";

type CustomTextProps = {
  className?: string;
  onClick?: () => void;
};

const CustomText: React.FC<PropsWithChildren<CustomTextProps>> = (props) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center ${props.className} custom-text`}
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}
    >
      {props.children}
    </div>
  );
};

export default CustomText;
