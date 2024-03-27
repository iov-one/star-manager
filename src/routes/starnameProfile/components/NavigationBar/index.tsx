import "./style.scss";

import { Col, Dropdown, Menu, Row, Space } from "antd";
import React, { useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { ICONS } from "routes/starnameProfile/Assets";
import { NavigationOptions } from "types/navigationOptions";

import SideDrawer from "../SideDrawer";

interface NavProps extends RouteComponentProps {
  readonly headingOptions: ReadonlyArray<NavigationOptions>;
}

const NavigationBar: React.FC<NavProps> = (props: NavProps) => {
  const [visible, setVisible] = useState(false);

  const menu = (
    items: ReadonlyArray<NavigationOptions>,
  ): React.ReactElement => {
    return (
      <Menu>
        {items.map((item: any) => (
          <Menu.Item key={item.link}>
            <a target="_blank" rel="noopener noreferrer" href={item.link}>
              {item.name}
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const handleDrawer = (): void => {
    setVisible(!visible);
  };
  const onClose = (): void => {
    setVisible(false);
  };

  const sideDrawer = (): React.ReactElement => {
    return (
      <SideDrawer
        visible={visible}
        headerOptions={props.headingOptions}
        onCloseClicked={onClose}
      />
    );
  };

  return (
    <Row
      className={"d-flex justify-content-around navigation-header"}
      style={{ zIndex: Number.MAX_SAFE_INTEGER }}
    >
      <Col
        md={22}
        xs={24}
        sm={24}
        className={`d-flex flex-row justify-content-around justify-content-lg-between`}
      >
        {sideDrawer()}

        <div className={"navigation-side-container"}>
          <img
            src={ICONS.MENU}
            onClick={handleDrawer}
            alt={"side-menu"}
            className={"side-menu"}
          />
        </div>

        <div
          className={"d-flex flex-row align-items-center justify-content-start"}
        >
          <img
            src={ICONS.LOGO}
            alt={"logo"}
            className={`d-flex align-self.center navigation-logo-img`}
            onClick={() => window.location.assign("https://starname.me")}
          />
        </div>
        {/* {
            !props.light && */}
        <div className={"navigation-button-container"}>
          <Space wrap>
            {props.headingOptions.map(
              (item: NavigationOptions, index: number) => {
                const internal = item.link.startsWith("#");
                return (
                  <Dropdown
                    arrow={true}
                    key={index}
                    overlay={menu([])}
                    disabled={true}
                    placement="bottomLeft"
                  >
                    <div
                      className={`navigation-button app-underline ${
                        index + 1 === props.headingOptions?.length
                          ? "last-Button"
                          : ""
                      }`}
                      onClick={() => {
                        if (internal) {
                          // https://stackoverflow.com/a/60367785/5887599
                          const anchor = document.querySelector(item.link);
                          anchor &&
                            anchor.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        } else {
                          window.open(item.link, "_blank");
                        }
                      }}
                    >
                      {item.name.toUpperCase()}
                    </div>
                  </Dropdown>
                );
              },
            )}
          </Space>
        </div>
      </Col>
    </Row>
  );
};

export default withRouter(NavigationBar);
