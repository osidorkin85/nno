import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

Enzyme.configure({ adapter: new Adapter() });
let context = require.context("./tests", true, /-test\.js$/);
context.keys().forEach(context);
