const fs = require("fs");

module.exports = {
    moduleMaker:{
        v2: function(_moduleId, _moduleName, isSingleton=false, withDomNode=false){

            let importStyle = `bundle-text:./${_moduleName}.css`;
            let importHtm = `./${_moduleName}.html`;
            importHtm = `bundle-text:${importHtm}`;

            return `"use strict";
import {Utilities} from '../common.mjs';

${withDomNode ? `import style from '${importStyle}'
import htmlTemplate from '${importHtm}';

let customElementElement = Utilities.createAndRegisterWidgetElement("${_moduleName}", '${_moduleId}');`: ``}

function Constructor(props){

    let params = {};
    
    ${withDomNode? `let _vRoot = new customElementElement(style, htmlTemplate);`:``}
    
    const _initialize = (_props)=>{
        Utilities.transferParams(_props, params);
        for(const argumentsKey in params){
            this[argumentsKey] = params[argumentsKey];
        }
        ${withDomNode? `_initView();`:``}
        _registerEvents();
    }

    this.toString = (_space)=>{
        if(_space){
            return JSON.stringify(this, null, _space);
        }
        else{
            return JSON.stringify(this);
        }
    };
    
    ${withDomNode? `function _initView(){
        console.debug("_initView() - called");
    }
     
    this.getView = ()=>{
        console.debug(_vRoot)
        return _vRoot.view;
    };
    `:``}

    function _registerEvents(){
        console.debug("_registerEvents() - called");
    }
    
    _initialize(props);

    return this;
}

${isSingleton? `let singleTone = null;`:``}

export let ${_moduleName} = Object.freeze({
    ${isSingleton? `
    getSingleton:(_props)=>{
        if(!singleTone){
            singleTone = Constructor.call(new (function ${_moduleName}(){}), _props);
        }
        return singleTone;
    },`:`
    getInstance:function(_props){
        return Object.seal(Constructor.call(new (function ${_moduleName}(){}), _props));
    }`}
    
});`;},
        //DEPRECATED:
        v1:function(widgetElementId, widgetName){
            let importStyle = `bundle-text:./${widgetName}Widget.css`;
            let importHtm = `./${widgetName}Widget.html`;
            importHtm = `bundle-text:${importHtm}`;

            return `"use strict";
import { Utilities } from '../common.mjs';
import style from '${importStyle}'
import htmlTemplate from '${importHtm}';

let customElementElement = Utilities.createAndRegisterWidgetElement("${widgetName}Widget", '${widgetElementId}');

function _${widgetName}Widget(){

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

export let ${widgetName}Widget = Object.freeze({
    getInstance:()=>{
        let instance = new _${widgetName}Widget();
        instance.init();
        return instance.exportable;
    }
});`;
        }
    },
    playgroundJS:function(moduleName, withDome=false){
        return `
import { ${moduleName} } from '../${moduleName}.mjs';

${withDome ? 
/*generate the module with a basic app container to attach to it*/
`const _vApp = document.createElement("app");
document.body.appendChild(_vApp);
let htmlModule = ${moduleName}.getInstance();
_vApp.appendChild(htmlModule.getView());`
            :/*without html view*/`
const myModule = ${moduleName}.getSingleton({});
console.debug("myModule", myModule);
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
}
