const createComponent = require("./src/createComponent");
const prepareBundle = require("./src/makeResourcesImportable");

module.exports = {
    generateModule:(_props)=>{
        return createComponent(_props);
    },
    bundleUp:(params)=>{
        return prepareBundle(params);
    }
};