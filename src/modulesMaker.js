
module.exports = {
    moduleMaker:function(_moduleId, _moduleName, withDomNode=false) {

        let importStyle = `./${_moduleName}.scss`;
        let importHtm = `./${_moduleName}.html`;
        importHtm = `${importHtm}`;

        return `import Utilities from '@alkimia/utilities';
${withDomNode ? `import style from '${importStyle}?inline'
import htmlTemplate from '${importHtm}?raw';` : ``}

export default function ${_moduleName}(args){

    const params = Utilities.transferParams(args, {});
    
    const instance = Object.create(${_moduleName}.prototype);
    ${withDomNode ? `
    const _customElement = Utilities.createAndRegisterWidgetElement("${_moduleName}");
    const _shadow = new _customElement(style, htmlTemplate);
    instance.element = _shadow;
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
        return _vParent !== null;
    };

    /**
     * @param {HTMLElement} _parent
     */
    instance.appendTo = (_parent)=>{
        _vParent = _parent;
        _vParent.appendChild(instance.element);
    };
    
    /**
     * @return {HTMLElement}
     */
    instance.getView = ()=>{
        return _shadow;
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
    playgroundJS:function(moduleName, withDome=false){
        return `
import { ${moduleName} } from '../${moduleName}.mjs';

${withDome ? 
/*generate the module with a basic app container to attach to it*/
`const _vApp = document.createElement("app");
document.body.appendChild(_vApp);\n
let ${moduleName.toLowerCase()}Widget = ${moduleName}.getInstance();
_vApp.appendChild(${moduleName.toLowerCase()}Widget.getView());`:/*without html view*/`
const ${moduleName.toLowerCase()}Singleton = ${moduleName}.getInstance();
console.debug("${moduleName.toLowerCase()}Singleton :", ${moduleName.toLowerCase()}Singleton);
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
<script type="module" src="index.mjs"></script>
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
