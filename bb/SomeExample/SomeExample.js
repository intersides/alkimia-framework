import Alkimia from "@alkimia/utilities";
import style from "./SomeExample.scss?inline";
import htmlTemplate from "./SomeExample.html?raw";
const Utilities = Alkimia.Utilities;
const { ElementState } = Alkimia.StateFactory;

export default function SomeExample(args) {
  const _params = Utilities.transfer(args, {});

  const instance = Object.create(SomeExample.prototype);

  const _customElement =
    Utilities.browser.createAndRegisterWidgetElement("SomeExample");
  instance.element = new _customElement(style, htmlTemplate);

  function _onAppended() {
    console.log("_onAppended should be delegated");
  }

  let [color, setColor] = [null, (_event) => {}];
  let [counter, setCounter] = [null, (_event) => {}];
  let [list, setList] = [null, (_color) => {}];

  let _vParent = null;

  //children elements
  let $input = null,
      $counter = null,
      $list = null,
      $listItemTemplate = null;

  /**
   *
   * @return {SomeExample}
   * @private
   */
  const _initialize = () => {
    _initView();
    _registerEvents();

    return instance;
  };

  function _initView() {
    $input = instance.element.view.querySelector("input");
    $counter = instance.element.view.querySelector("#counter_value");
    $list = instance.element.view.querySelector("ul");
    $listItemTemplate = instance.element.view.querySelector(
      "#list_item_template"
    );

    [counter, setCounter] = new ElementState({
      element: $counter,
      attribute: ElementState.BindableAttribute.innertext.name,
      initialValue: 0
    });

    [color, setColor] = new ElementState({
      element: $counter,
      attribute: ElementState.BindableAttribute["style.color"],
      initialValue: "blue"
    });

    [list, setList] = new ElementState({
      element: $list,
      attribute: ElementState.BindableAttribute.children,
      initialValue: [],
      transformer: (list) => {
        if (list) {
          return list.map((_listItem) => {
            const listItemTemplate = $listItemTemplate.content.cloneNode(true);
            const li = listItemTemplate.querySelector("li");
            li.innerText = _listItem;
            return li;
          });
        }
        else {
          return [];
        }
      }
    });
  }

  instance.isAttached = function() {
    return instance.element.parentNode !== null;
  };

  /**
   * @param {HTMLElement} _parent
   */
  instance.appendTo = (_parent) => {
    _parent.appendChild(instance.element);
    _vParent = _parent;
    _onAppended();
  };

  function _registerEvents() {
    _onAppended = (_parent) => {
      $input.value = counter.value; //from initialValue
    };

    if ($input) {
      $input.addEventListener("change", (evt) => {
        setCounter(evt.target.value);
        if (evt.target.value === "1") {
          setColor("green");
        }
        if (evt.target.value === "0") {
          setColor("red");
        }
        setList([...list.value, evt.target.value]);
      });
    }
  }

  return _initialize();
}

/**
 *
 * @type {SomeExample}
 * @private
 */
let _instance = null;

SomeExample.getSingleton = function(_args = null) {
  if (!_instance) {
    _instance = SomeExample(_args);
  }
  return _instance;
};

SomeExample.getInstance = function(_args) {
  return SomeExample(_args);
};
