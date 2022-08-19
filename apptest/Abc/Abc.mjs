"use strict";
import Utilities from '@intersides/utilities';

function _Abc(props){

    let params = {};
    
    function _initialize(_props){
        Utilities.transferParams(_props, params);
        _registerEvents();
    }
    
    function _registerEvents(){}
   
    this.toString = (_space)=>{
        if(_space){
            return JSON.stringify(this, null, _space);
        }
        else{
            return JSON.stringify(this);
        }
    };
    
    _initialize(props);

    return this;
}

export let Abc = Object.freeze({
    
    getInstance:function(_props){
        return Object.seal(_Abc.call(new (function Abc(){}), _props));
    }
    
});