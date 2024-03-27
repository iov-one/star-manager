import Enzyme from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";
export const window = global.window || {};

Enzyme.configure({ adapter: new ReactSixteenAdapter() });
global.window = window;

jest.setTimeout(60000);
