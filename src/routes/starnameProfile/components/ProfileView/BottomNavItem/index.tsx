import StarnameProfileBottomNavContext from "contexts/profileBottomNavContext";
import React, { PropsWithChildren } from "react";
import { StarnameProfileScreen } from "types/starnameProfileScreen";

const BottomNavItem = (
  props: PropsWithChildren<{ value: StarnameProfileScreen }>,
): React.ReactElement => {
  const value = React.useContext(StarnameProfileBottomNavContext);

  return (
    <div style={{ display: value === props.value ? "block" : "none" }}>
      {props.children}
    </div>
  );
};

export default BottomNavItem;
