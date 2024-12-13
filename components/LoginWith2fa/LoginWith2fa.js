import Alkimia from "@alkimia/utilities";
const Utilities = Alkimia.Utilities;
import style from "./LoignWith2fa.scss?inline";
import htmlTemplate from "./LoignWith2fa.html?raw";
const {
  ElementState
} = Alkimia.StateFactory;
 

export default function LoginWith2fa(args){

  const _params = Utilities.transfer(args, {});
    
  const instance = Object.create(LoginWith2fa.prototype);
    
  const _customElement = Utilities.browser.createAndRegisterWidgetElement("LoginWith2fa");
  instance.element = new _customElement(style, htmlTemplate);
    
  function _onAppended() {
    console.log("_onAppended should be delegated");
  }
  
  let [counter, setCounter] = [null, (_event) => {}];
  let [username, setUsername] = [null, (_event) => {}];

  //children elements
  let $input = null,
      $counter = null,
      $username = null,
      $password = null,
      $submitButton = null;
  
  let _vParent = null;
  
  /**
  *
  * @return {LoginWith2fa}
  * @private
  */
  const _initialize = ()=>{
    _initView();
    _registerEvents();
    
    return instance;
  };
  
  function _initView(){
    
    $input = instance.element.view.querySelector("input");
    $counter = instance.element.view.querySelector("#counter_value");

    $username = instance.element.view.querySelector("#username");
    $password = instance.element.view.querySelector("#password");

    $submitButton = instance.element.view.querySelector("#submit_login_btn");
    if($submitButton){
      $submitButton.onclick = function(){
        instance.onSubmit({
          username:$username?.value,
          password:$password?.value
        });
      };
    }
    else{
      console.warn("submit button not found");
    }

    [counter, setCounter] = new ElementState({
      element: $counter,
      attribute: ElementState.BindableAttribute.innertext.name,
      initialValue: 0
    });

    [username, setUsername] = new ElementState({
      element: $username,
      attribute: ElementState.BindableAttribute.value,
      initialValue: null
    });
        
    // [list, setList] = new ElementState({
    //   element: $list,
    //   attribute: ElementState.BindableAttribute.children,
    //   initialValue: [],
    //   transformer: (list) => {
    //     if (list) {
    //       return list.map((_listItem) => {
    //         const listItemTemplate = $listItemTemplate.cloneNode(true);
    //         listItemTemplate.innerText = _listItem;
    //         return listItemTemplate;
    //       });
    //     }
    //     else {
    //       return [];
    //     }
    //   }
    // });
    
  }

  instance.onSubmit = function(){
    console.log("must be delegated");
  };
    
  instance.isAttached = function(){
    return instance.element.parentNode !== null;
  };

  /**
   * @param {HTMLElement} _parent
   */
  instance.appendTo = (_parent)=>{
    _parent.appendChild(instance.element);
    _vParent = _parent;
    _onAppended();
  };
    
  function _registerEvents(){
    _onAppended = () => {
      $input.value = counter.value; //from initialValue
    };
    
    if($input){
      $input.addEventListener("change", (evt) => {
        setCounter(evt.target.value);
        // setList([...list.value, evt.target.value]);
      });
    }
     
  }
    
  return _initialize();
}

/**
 *
 * @type {LoginWith2fa}
 * @private
 */
let _instance = null;

LoginWith2fa.getSingleton = function(_args=null) {
  if(!_instance){
    _instance = LoginWith2fa(_args);
  }
  return _instance;
};

LoginWith2fa.getInstance = function(_args) {
  return LoginWith2fa(_args);
};
