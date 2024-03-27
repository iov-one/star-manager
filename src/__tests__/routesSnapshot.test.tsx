import { shallow } from "enzyme";
import React from "react";
import Routes from "routes";
it("Renders the <Routes /> Component", () => {
  const component = shallow(<Routes />);
  expect(component).toMatchSnapshot();
});
