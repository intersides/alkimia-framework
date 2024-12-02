import createComponent from "./src/createComponent.js";
import prepareBundle from "./src/makeResourcesImportable.js";

export default {
  generateModule: (_props) => {
    return createComponent(_props);
  },
  bundleUp: (params) => {
    return prepareBundle(params);
  }
};
