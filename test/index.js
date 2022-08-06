const {service} = require("../src/modules/index");
const Module = require("../src/modules/Module");

let serviceFile = service.v2("abc123","MyService", false, true);
console.debug(serviceFile);

// let myModule = Module.getInstance({});
// console.debug("myModule", myModule);
