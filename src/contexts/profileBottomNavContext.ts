import React from "react";
import { StarnameProfileScreen } from "types/starnameProfileScreen";

const StarnameProfileBottomNavContext = React.createContext(
  StarnameProfileScreen.SendMoney,
);

export default StarnameProfileBottomNavContext;
