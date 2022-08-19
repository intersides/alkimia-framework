
import { Abc } from '../Abc.mjs';

const _vApp = document.createElement("app");
document.body.appendChild(_vApp);

let abcWidget = Abc.getInstance();
_vApp.appendChild(abcWidget.getView());