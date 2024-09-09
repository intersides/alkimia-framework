
module.exports = {
    moduleMaker:function(_moduleId, _moduleName, withDomNode=false, withPlayground=false) {

        let importStyle = `./${_moduleName}.scss`;
        let importHtm = `./${_moduleName}.html`;
        importHtm = `${importHtm}`;

        return `import Utilities from "@alkimia/utilities";
${withDomNode ? `import style from "${importStyle}?inline";
import htmlTemplate from "${importHtm}?raw";` : ``}

export default function ${_moduleName}(args){

    const _params = Utilities.transferParams(args, {});
    
    const instance = Object.create(${_moduleName}.prototype);
    ${withDomNode ? `
    const _customElement = Utilities.createAndRegisterWidgetElement("${_moduleName}");
    instance.element = new _customElement(style, htmlTemplate);
    let _vParent = null;`: ``}
    
   /**
   *
   * @return {${_moduleName}}
   * @private
   */
    const _initialize = ()=>{
        ${withDomNode ? `_initView();` : ``}
        _registerEvents();
        
        return instance;
    };
    ${withDomNode ?`
    function _initView(){}
    
    instance.isAttached = function(){
        return instance.element.parentNode !== null;
    };

    /**
     * @param {HTMLElement} _parent
     */
    instance.appendTo = (_parent)=>{
      _parent.appendChild(instance.element);
    };` : ``}
    
    function _registerEvents(){}
    
    return _initialize();
}

/**
 *
 * @type {${_moduleName}}
 * @private
 */
let _instance = null;

${_moduleName}.getSingleton = function(_args=null) {
  if(!_instance){
    _instance = ${_moduleName}(_args);
  }
  return _instance;
};

${_moduleName}.getInstance = function(_args) {
  return ${_moduleName}(_args);
};`

;},
    playgroundJS:function(moduleName, withDom=false){
        return `import ${moduleName} from "../${moduleName}.js";
${withDom ? 
/*generate the module with a basic app container to attach to it*/
`const _vApp = document.createElement("app");
document.body.appendChild(_vApp);\n
let ${moduleName.toLowerCase()} = ${moduleName}.getInstance();
_vApp.appendChild(${moduleName.toLowerCase()}.element);`:/*without html view*/`
const ${moduleName.toLowerCase()}Instance = ${moduleName}.getInstance();
console.debug("${moduleName.toLowerCase()}Instance :", ${moduleName.toLowerCase()}Instance);
`}`
    },
    playgroundHtml:function(widgetName){
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${widgetName}</title>
</head>
<body>
<script type="module" src="index.js"></script>
</body>
</html>`
    },
    scss:function (widgetName){
        return `
:host{}
.${widgetName}{
}`;
    }
};
