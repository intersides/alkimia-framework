import SomeExample from "../SomeExample.js";
const _vApp = document.createElement("app");
document.body.appendChild(_vApp);

let someexample = SomeExample.getInstance();
someexample.appendTo(_vApp);
