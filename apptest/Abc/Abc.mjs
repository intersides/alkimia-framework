"use strict";
import Utilities from '@intersides/utilities';
import style from 'bundle-text:./Abc.css'
import htmlTemplate from 'bundle-text:./Abc.html';

let customElementElement = Utilities.createAndRegisterWidgetElement("Abc", 'abc-element');

function _Abc(props){

    let params = {};
    
	let _vRoot = new customElementElement(style, htmlTemplate);

    function _initialize(_props){
        Utilities.transferParams(_props, params);
        for(const argumentsKey in params){
            this[argumentsKey] = params[argumentsKey];
        }
		_initView();
        _registerEvents();
    }
    
	function _initView(){
    }
     
    this.getView = ()=>{
        return _vRoot;
    };
    
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