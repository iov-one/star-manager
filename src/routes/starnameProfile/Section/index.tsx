import "./style.scss";

import { Layout } from "antd";
import React, { PropsWithChildren } from "react";

import NavigationBar from "../components/NavigationBar";

const { Content } = Layout;
type SectionProps = {
  className?: string;
  showHeader?: boolean;
  content?: string;
  lightNavigation?: boolean;
  showSearch?: boolean;
  headingOptions?: any;
  lastHeadingBorder?: boolean;
  id?: string;
};

const CustomText: React.FC<PropsWithChildren<SectionProps>> = (props) => {
  const id = props.id || "";

  return (
    <Layout id={id} className={`section ${props.className}`}>
      {props.showHeader && (
        <NavigationBar headingOptions={props.headingOptions} />
      )}

      <Content className={` content ${props.content}`}>
        {props.children}
      </Content>
    </Layout>
  );
};

export default CustomText;
