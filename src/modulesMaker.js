
module.exports = {
    moduleMaker:function(_moduleId, _moduleName, isSingleton=false, withDomNode=false){

            let importStyle = `./${_moduleName}.scss`;
            let importHtm = `./${_moduleName}.html`;
            importHtm = `${importHtm}`;

            return `"use strict";
import Utilities from '@intersides/utilities';${withDomNode ? `\nimport style from '${importStyle}'
import htmlTemplate from '${importHtm}?raw';

let customElementElement = Utilities.createAndRegisterWidgetElement("${_moduleName}", '${_moduleId}');`: ``}

/**
 * @typedef {Object} ${_moduleName}
 * @param {Object} props
 * @return {${_moduleName}}
 */
function _${_moduleName}(props){

    let params = Utilities.transferParams(props, {});
    
    ${withDomNode? `\n\tlet _vRoot = new customElementElement(style, htmlTemplate);\n`:``}
    /**
     *
     * @return {${_moduleName}}
     * @private
     */
    const _initialize = ()=>{
        ${withDomNode? `\n\t\t\t\t_initView();`:``}
        _registerEvents();
        
        return this;
    };
    ${withDomNode? `\n\tfunction _initView(){
    }

    function _registerEvents(){}
     
    /**
     *@typedef {function} ${_moduleName}.getView
     * @return {HTMLElement}
    */
    this.getView = ()=>{
        return _vRoot;
    };
    `:``}
   
    /**
     * @typedef {function} ${_moduleName}.toString
     * @param {number|string} _space
     * @return {string}
    */
    this.toString = (_space)=>{
        if(_space){
            return JSON.stringify(this, null, _space);
        }
        else{
            return JSON.stringify(this);
        }
    };
    
    return _initialize();
}
${isSingleton? `\nlet singleTone = null;\n`:``}
export let ${_moduleName} = Object.freeze({
    /**
     * @param {Object}_props
     * @return {${_moduleName}}
     */
    ${isSingleton? `
    getSingleton:(_props=null)=>{
        if(!singleTone){
            singleTone = _${_moduleName}.call(new (function ${_moduleName}(){}), _props);
        }
        return singleTone;
    },`:`
    getInstance:function(_props=null){
        return Object.seal(_${_moduleName}.call(new (function ${_moduleName}(){}), _props));
    }`}
    
});`;},
    playgroundJS:function(moduleName, isSingleton, withDome=false){
        return `
import { ${moduleName} } from '../${moduleName}.mjs';

${withDome ? 
/*generate the module with a basic app container to attach to it*/
`const _vApp = document.createElement("app");
document.body.appendChild(_vApp);\n
let ${moduleName.toLowerCase()}Widget = ${moduleName}.${isSingleton === true ? "getSingleton":"getInstance"}();
_vApp.appendChild(${moduleName.toLowerCase()}Widget.getView());`:/*without html view*/`
const ${moduleName.toLowerCase()}Singleton = ${moduleName}.${isSingleton === true ? "getSingleton":"getInstance"}();
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
