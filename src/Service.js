"use strict";

const Utilities = require("./Utilities");


function Constructor(props){

    let params = {};

    const init = (_props)=>{
        Utilities.transferParams(_props, params);
        for(const argumentsKey in params){
            this[argumentsKey] = params[argumentsKey];
        }
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

const dynamicConstructor = {};


module.exports = {

    getSingleton:(_props, _name="Service")=>{
        if(!singleTone){
            singleTone = Constructor.call( eval(`new (function ${_name}(){})`) , _props);
        }
        return singleTone;
    },
    getInstance:(_props, _name)=>{
        return Object.seal(Constructor.call(eval(`new (function ${_name}(){})`) , _props));
    }
}