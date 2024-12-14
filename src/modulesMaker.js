export default {

  moduleMaker: function(
    _moduleId,
    _moduleName,
    withDomNode = false,
    withPlayground = false,
    withStatesSample = false
  ) {

    const importStyle = `./${_moduleName}.scss`;
    let importHtm = `./${_moduleName}.html`;
    importHtm = `${importHtm}`;

    return `import { utilities, ElementState } from "@alkimia/lib";
${withDomNode ? `
import style from "${importStyle}?inline";
import htmlTemplate from "${importHtm}?raw";${withStatesSample ? `
` : ""} ` : ""
}

export default function ${_moduleName}(args){

  const _params = utilities.transfer(args, {});
    
  const instance = Object.create(${_moduleName}.prototype);
    ${
  withDomNode
    ? `
  const _customElement = utilities.createAndRegisterWidgetElement("${_moduleName}");
  instance.element = new _customElement(style, htmlTemplate);
    
  function _onAppended() {
    console.log("_onAppended should be delegated");
  }
  ${ withStatesSample ? `
  let [counter, setCounter] = [null, (_event) => {}];
  let [list, setList] = [null, (_color) => {}];
    
  //children elements
  let $input = null,
      $counter = null,
      $list = null,
      $listItemTemplate = null;
  ` : ""}
  let _vParent = null;
  ` : ""
}
  /**
  *
  * @return {${_moduleName}}
  * @private
  */
  const _initialize = ()=>{
    ${withDomNode ? "_initView();" : ""}
    _registerEvents();
    
    return instance;
  };
  ${
  withDomNode
    ? `
  function _initView(){
    ${ withStatesSample ? `
    $input = instance.element.view.querySelector("input");
    $counter = instance.element.view.querySelector("#counter_value");
    $list = instance.element.view.querySelector("ul");
    $listItemTemplate = instance.element.view.querySelector(".list_item_template");
      
    [counter, setCounter] = new ElementState({
      element: $counter,
      attribute: ElementState.BindableAttribute.innertext.name,
      initialValue: 0
    });
        
    [list, setList] = new ElementState({
      element: $list,
      attribute: ElementState.BindableAttribute.children,
      initialValue: [],
      transformer: (list) => {
        if (list) {
          return list.map((_listItem) => {
            const listItemTemplate = $listItemTemplate.cloneNode(true);
            listItemTemplate.innerText = _listItem;
            return listItemTemplate;
          });
        } 
        else {
          return [];
        }
      }
    });
    ` : ""}
  }
    
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
  };` : ""
}
    
  function _registerEvents(){
    ${
  withDomNode ? `_onAppended = () => {
      ${ withStatesSample ? "$input.value = counter.value; //from initialValue" : "" }
    };
    ${ withStatesSample ? `
    if($input){
      $input.addEventListener("change", (evt) => {
        setCounter(evt.target.value);
        setList([...list.value, evt.target.value]);
      });
    }
    ` : ""} `: ""}
  }
    
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
};
`;
  },
  playgroundJS: function(moduleName, withDom = false) {
    return `import ${moduleName} from "../${moduleName}.js";
${
  withDom
    ? /*generate the module with a basic app container to attach to it*/
    `const _vApp = document.createElement("app");
document.body.appendChild(_vApp);\n
let ${moduleName.toLowerCase()} = ${moduleName}.getInstance();
${moduleName.toLowerCase()}.appendTo(_vApp);`
    : /*without HTML view*/ `
const ${moduleName.toLowerCase()}Instance = ${moduleName}.getInstance();
console.debug("${moduleName.toLowerCase()}Instance :", ${moduleName.toLowerCase()}Instance);
`
}
`;
  },
  playgroundHtml: function(widgetName) {
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
</html>
`;
  },
  html:function(widgetName, withStatesSample){
    let html = "";
    if(withStatesSample){
      html = `<section>
	<label>
		<span>my input</span>
		<input type="number" id="counter_input" min="0" max="100" step="1" />
	</label>
</section>

<section>
	<p>counter <span id="counter_value">abc</span></p>

	<div>
		<label>
			<span>counter list</span>
		</label>
		<ul>
			<li class="list_item_template">0</li>
		</ul>
	</div>

	<label>
		<span>list</span>
	</label>

</section>`;
    }
    return html;

  },
  scss: function(widgetName) {
    return `
:host{}
.${widgetName}{
}
`;
  }
};
