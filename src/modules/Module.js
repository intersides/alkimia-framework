"use strict";

import {Utilities} from "../Utilities.js";

let customElementElement = Utilities.createAndRegisterWidgetElement("ModuleWidget", 'header-widget');

function Constructor(props){

    let params = {};

    let _vRoot = new customElementElement(style, htmlTemplate);


    const init = (_props)=>{
        Utilities.transferParams(_props, params);
        for(const argumentsKey in params){
            this[argumentsKey] = params[argumentsKey];
        }
    }

    function _initView(){
    }

    function _registerEvents(){
    }

    this.toString = (_space)=>{
        if(_space){
            return JSON.stringify(this, null, _space);
        }
        else{
            return JSON.stringify(this);
        }
    };

    init(props);

    return this;
}


let singleTone = null;

export const Module = {
    getSingleton:(_props)=>{
        if(!singleTone){
            singleTone = Constructor.call(new (function Module(){}), _props);
        }
        return singleTone;
    },
    getInstance:function(_props){
        return Object.seal(Constructor.call(new (function Module(){}), _props));
    }
}