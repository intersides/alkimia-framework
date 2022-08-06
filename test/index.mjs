import Module from "../src/Service.js";

let mySingleton = Module.getSingleton({}, "MySingleton");
console.debug("mySingleton", mySingleton);

let myInstance = Module.getInstance({}, "MyInstance");
console.debug("myInstance", myInstance);
