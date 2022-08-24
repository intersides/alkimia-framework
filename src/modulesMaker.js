
module.exports = {
    moduleMaker:{
        v2: function(_moduleId, _moduleName, isSingleton=false, withDomNode=false){

            let importStyle = `bundle-text:./${_moduleName}.css`;
            let importHtm = `./${_moduleName}.html`;
            importHtm = `bundle-text:${importHtm}`;

            return `"use strict";
import Utilities from '@intersides/utilities';${withDomNode ? `\nimport style from '${importStyle}'
import htmlTemplate from '${importHtm}';

let customElementElement = Utilities.createAndRegisterWidgetElement("${_moduleName}", '${_moduleId}');`: ``}

function _${_moduleName}(props){

    let params = {};
    ${withDomNode? `\n\tlet _vRoot = new customElementElement(style, htmlTemplate);\n`:``}
    function _initialize(_props){
        Utilities.transferParams(_props, params);${withDomNode? `\n\t\t\t\t_initView();`:``}
        _registerEvents();
        
        return this;
    }
    ${withDomNode? `\n\tfunction _initView(){
    }
     
    this.getView = ()=>{
        return _vRoot;
    };
    `:``}
    function _registerEvents(){}
   
    this.toString = (_space)=>{
        if(_space){
            return JSON.stringify(this, null, _space);
        }
        else{
            return JSON.stringify(this);
        }
    };
    
    return _initialize(props);
}
${isSingleton? `\nlet singleTone = null;\n`:``}
export let ${_moduleName} = Object.freeze({
    ${isSingleton? `
    getSingleton:(_props)=>{
        if(!singleTone){
            singleTone = _${_moduleName}.call(new (function ${_moduleName}(){}), _props);
        }
        return singleTone;
    },`:`
    getInstance:function(_props){
        return Object.seal(_${_moduleName}.call(new (function ${_moduleName}(){}), _props));
    }`}
    
});`;},
        //DEPRECATED:
        v1:function(widgetElementId, widgetName){
            let importStyle = `bundle-text:./${widgetName}.css`;
            let importHtm = `./${widgetName}.html`;
            importHtm = `bundle-text:${importHtm}`;

            return `"use strict";
import Utilities from '@intersides/utilities';
import style from '${importStyle}'
import htmlTemplate from '${importHtm}';

let customElementElement = Utilities.createAndRegisterWidgetElement("${widgetName}", '${widgetElementId}');

function _${widgetName}(){

    let _vRoot = new customElementElement(style, htmlTemplate);

    function _initialize(){
        _initView();
        _registerEvents();
    }

    function _initView(){
    }

    function _registerEvents(){
    }

    return Object.freeze({
        init:_initialize,
        exportable:Object.seal({
            getView:()=>_vRoot
        })
    });

}

export let ${widgetName} = Object.freeze({
    getInstance:()=>{
        let instance = new _${widgetName}();
        instance.init();
        return instance.exportable;
    }
});`;
        }
    },
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
    },
};
