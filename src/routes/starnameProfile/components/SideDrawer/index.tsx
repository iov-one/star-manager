import "./style.scss";

import { Drawer } from "antd";
import React, { useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { NavigationOptions } from "types/navigationOptions";

import CustomText from "../CustomText";
interface SideDrawerProps extends RouteComponentProps {
  visible: boolean;
  headerOptions?: any;
  onCloseClicked: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = (props: SideDrawerProps) => {
  const { headerOptions } = props;
  const [menuOpened, setOpenedMenu] = useState(null);
  return (
    <Drawer
      placement="right"
      width={"100%"}
      closable={true}
      bodyStyle={{ backgroundColor: "#f0f3f7" }}
      onClose={props.onCloseClicked}
      visible={props.visible}
    >
      <div
        className={
          "d-flex flex-column justify-content-center align-items-center sidemenu-container"
        }
      >
        {headerOptions.map((item: NavigationOptions, index: any) => {
          return (
            <div key={item.link}>
              <CustomText
                className={"sideDeveloper-text"}
                key={index}
                onClick={() => {
                  if (menuOpened !== index) {
                    setOpenedMenu(index);
                  } else {
                    window.open(item.link, "_self");
                  }
                }}
              >
                {item.name}
              </CustomText>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
};

export default withRouter(SideDrawer);
