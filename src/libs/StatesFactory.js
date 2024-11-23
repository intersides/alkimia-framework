import Utilities from "@alkimia/utilities";

let elementAttributes = {
  innertext: {
    name: "innerText",
    type: [String, Number, Boolean],
  },
  innerhtml: {
    name: "innerHTML",
    type: [HTMLElement],
  },
  children: {
    name: "children",
    type: ["HTMLElements"],
  },
  outerhtml: null,
  outertext: null,
  classname: null,
  accept: null,
  "accept-charset": null,
  accesskey: null,
  action: null,
  alt: null,
  async: null,
  autocomplete: null,
  autofocus: null,
  autoplay: null,
  charset: null,
  checked: null,
  cite: null,
  class: null,
  cols: null,
  colspan: null,
  content: null,
  contenteditable: null,
  controls: null,
  coords: null,
  data: null,
  datetime: null,
  default: null,
  defer: null,
  dir: null,
  dirname: null,
  disabled: null,
  download: null,
  draggable: null,
  enctype: null,
  enterkeyhint: null,
  for: null,
  form: null,
  formaction: null,
  headers: null,
  height: null,
  hidden: null,
  high: null,
  href: null,
  hreflang: null,
  "http-equiv": null,
  id: null,
  inert: null,
  inputmode: null,
  ismap: null,
  kind: null,
  label: null,
  lang: null,
  list: null,
  loop: null,
  low: null,
  max: null,
  maxlength: null,
  media: null,
  method: null,
  min: null,
  multiple: null,
  muted: null,
  name: null,
  novalidate: null,
  onabort: null,
  onafterprint: null,
  onbeforeprint: null,
  onbeforeunload: null,
  onblur: null,
  oncanplay: null,
  oncanplaythrough: null,
  onchange: null,
  onclick: null,
  oncontextmenu: null,
  oncopy: null,
  oncuechange: null,
  oncut: null,
  ondblclick: null,
  ondrag: null,
  ondragend: null,
  ondragenter: null,
  ondragleave: null,
  ondragover: null,
  ondragstart: null,
  ondrop: null,
  ondurationchange: null,
  onemptied: null,
  onended: null,
  onerror: null,
  onfocus: null,
  onhashchange: null,
  oninput: null,
  oninvalid: null,
  onkeydown: null,
  onkeypress: null,
  onkeyup: null,
  onload: null,
  onloadeddata: null,
  onloadedmetadata: null,
  onloadstart: null,
  onmousedown: null,
  onmousemove: null,
  onmouseout: null,
  onmouseover: null,
  onmouseup: null,
  onmousewheel: null,
  onoffline: null,
  ononline: null,
  onpageshow: null,
  onpaste: null,
  onpause: null,
  onplay: null,
  onplaying: null,
  onprogress: null,
  onratechange: null,
  onreset: null,
  onresize: null,
  onscroll: null,
  onsearch: null,
  onseeked: null,
  onseeking: null,
  onselect: null,
  onstalled: null,
  onsubmit: null,
  onsuspend: null,
  ontimeupdate: null,
  ontoggle: null,
  onunload: null,
  onvolumechange: null,
  onwaiting: null,
  onwheel: null,
  open: null,
  optimum: null,
  pattern: null,
  placeholder: null,
  popover: null,
  popovertarget: null,
  popovertargetaction: null,
  poster: null,
  preload: null,
  readonly: null,
  rel: null,
  required: null,
  reversed: null,
  rows: null,
  rowspan: null,
  sandbox: null,
  scope: null,
  selected: null,
  shape: null,
  size: null,
  sizes: null,
  span: null,
  spellcheck: null,
  src: null,
  srcdoc: null,
  srclang: null,
  srcset: null,
  start: null,
  step: null,
  style: null,
  "style.color": {
    name: "style.color",
    type: [String, Number],
  },
  tabindex: null,
  target: null,
  title: null,
  translate: null,
  type: null,
  usemap: null,
  value: null,
  width: null,
  wrap: null,
};

/**
 *
 * @param {HTMLElement} element
 * @param attribute
 * @param {any} value
 * @return {null}
 * @constructor
 */
const SetPropertyForAttribute = function (element, attribute, value) {
  switch (attribute) {
    case BindableElementAttribute.innertext:
    case BindableElementAttribute.innertext.name:
      element["innerText"] = value;
      break;

    case BindableElementAttribute["style.color"]:
    case BindableElementAttribute["style.color"].name:
      element.style.color = value;
      break;

    case BindableElementAttribute.innerhtml:
    case BindableElementAttribute.innerhtml.name:
      {
        console.log(value);
        element[BindableElementAttribute.innerhtml.name] = value;
      }
      break;

    case BindableElementAttribute.children:
    case BindableElementAttribute.children.name:
      {
        element.replaceChildren(...value);
      }
      break;

    default: {
      console.error("Invalid attribute:", attribute);
    }
  }

  return false;
};

export const BindableElementAttribute = { ...elementAttributes };

/**
 * @typedef {Object} ElementStateParameter
 * @property {HTMLElement} element - The DOM element to bind the value.
 * @property {string} attribute - the attribute name that should match BindableElementAttribute list .
 * @property {String|Number|Boolean|Object|Array|null} initialValue -default value.
 * @property {function(HTMLElement): void} transformer - apply a transformation to the value
 */

/**
 *
 * @param {ElementStateParameter} _elementStateParameters
 * @return {[{value: null},function(*): void]}
 * @constructor
 */
export function ElementState(_elementStateParameters) {
  let props = Utilities.transferParams(_elementStateParameters, {
    element: null,
    attribute: null,
    initialValue: null,
    transformer: (value) => {
      return value;
    },
  });

  console.log("*", props);

  const _newBindTo = (_element, attributeToBind) => {
    let element = _element;

    const _valueProxy = new Proxy(
      {
        value: null,
      },
      {
        get: (target, prop, receiver) => {
          return Reflect.get(target, prop, receiver);
        },
        set: (target, prop, value, receiver) => {
          if (prop === "value" && value !== undefined) {
            // console.log("el:", element, "attr:", attributeToBind, value);

            const success = SetPropertyForAttribute(
              element,
              attributeToBind,
              props.transformer(value),
            );

            target[prop] = value;
          }
          return true;
        },
      },
    );

    //TODO: check that the attribute to be pounded to is coherent for the type of element. Ex: innerText is used in any HtmlElement but alt is only used in:area, img & input
    // property = element[attributeToBind];

    if (props.initialValue !== undefined) {
      _valueProxy.value = props.initialValue;
    }

    return [
      _valueProxy,
      (_value) => {
        _valueProxy.value = _value;
      },
    ];
  };

  return _newBindTo(props.element, props.attribute);
}
