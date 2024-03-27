import "./style.scss";

import React from "react";

type CustomButtonProps = {
  title: string;
  onClick?: () => void;
  className?: string;
};

const CustomButton: React.FC<CustomButtonProps> = (props) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center custom-button ${props.className}`}
      onClick={props.onClick}
    >
      {props.title}
    </div>
  );
};

export default CustomButton;
