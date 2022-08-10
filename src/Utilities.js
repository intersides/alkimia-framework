import shortUUID from 'short-uuid';

export const Utilities = {

	createAndRegisterWidgetElement:(_className, _tagName)=>{
		let construct = {};
		construct[_className] = class extends HTMLElement{

			constructor(_cssAsText = null, _htmlTemplate = null){
				super();

				let shortId = shortUUID.generate();

				this.typeName = _className;
				this.id = `${_className}_${shortId}`;

				this.setAttribute('data-type', 'widget');

				let shadowRoot = this.attachShadow({ mode:'open' });

				let style = document.createElement('style');
				if(_cssAsText){
					style.textContent = _cssAsText;
				}

				this.view = document.createElement('view');
				this.view.className = _className;
				this.view.setAttribute('data-skin', 'default');
				if(_htmlTemplate){
					this.view.innerHTML = _htmlTemplate;
				}

				shadowRoot.appendChild(style);
				shadowRoot.appendChild(this.view);

				/**
				 * @param {string} _skinName
				 */
				this.setSkin = (_skinName = null)=>{
					const skinName = _skinName.toLowerCase();
					this.view.setAttribute('data-skin', skinName);
				};

				/**
				 *
				 * @param {HTMLElement} _component
				 */
				this.appendChild = (_component)=>{
					this.view.appendChild(_component);
				}

			}
		};

		window.customElements.define(_tagName, construct[_className]);
		return construct[_className];
	},



	/**
	 *
	 * @param {HTMLElement} _htmlNode
	 * @param className
	 */
	getParentsWithClass:(_htmlNode, className)=>{
		function* walkHierarchy(_childNode, _targetClassName){
			if(_childNode){
				if(_childNode.classList.contains(_targetClassName)){
					yield _childNode;
				}
				yield* walkHierarchy(_childNode.parentElement, _targetClassName);
			}
		}

		//spread operator could also be used: [... walkHierarchy(_htmlNode, className)]
		return Array.from(walkHierarchy(_htmlNode, className));
	},

	/**
	 * remove all the children dom elements from a parent node
	 * @param {Node} _parentNode
	 */
	removeAllChildren:(_parentNode)=>{

		let iterations = _parentNode.childNodes.length;
		while(iterations > 0){
			iterations--;
			let node = _parentNode.lastChild;
			_parentNode.removeChild(node);
		}
	},

	/**
	 *
	 * @param {Document} document
	 * @param {string} htmlString
	 * @returns {ChildNode | HTMLElement}
	 */
	createElementFromHTML:(document, htmlString)=>{
		const div = document.createElement('div');
		div.innerHTML = htmlString.trim();
		// Change this to div.childNodes to support multiple top-level nodes
		return div.firstChild;
	},

	/**
	 * @param evt
	 * @return {boolean}
	 */
	muteEvent(evt){
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	},


	/**
	 * Simple transfer of properties from an object to another.
	 * Only the keys present in the "to" object will be transfer
	 * @param {Object} from
	 * @param {Object} to
	 */
	transferParams:(from, to)=>{
		if(Utilities.isNotNullObject(from) && (typeof to === 'object')){
			if(to !== null){
				Object.keys(to).forEach(_key=>{
					if(from.hasOwnProperty(_key)){
						if(typeof to[_key] === 'object' && typeof from[_key] === 'object'){
							Utilities.transferParams(from[_key], to[_key]);
						}
						to[_key] = from[_key];
					}
				});
			}else{
				//if the to target is null it can be set to any from source
				to = from;
			}
		}
	},



	isValidPassword(passwordFieldInput){
		return !!passwordFieldInput.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{8,99}$/);
	},


	//input validation
	/**
	 *
	 * @param emailFieldInput
	 * @return {boolean}
	 */
	isValidEmail(emailFieldInput){
		return !!emailFieldInput.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	},

	isValidToTpCode(totpFieldInput){
		totpFieldInput = Utilities.removeWhiteSpaces(totpFieldInput);
		//validate length
		if(totpFieldInput.length !== 6){
			return false;
		}
		//validate numeric content
		return !isNaN(totpFieldInput);
	},

	/**
	 *
	 * @param {string} _val
	 */
	isNonemptyString(_val){
		return typeof _val === 'string' && _val.trim() !== '';
	},

	/**
	 *
	 * @param {Object|null}_val
	 */
	isNotNullObject(_val){
		return typeof _val === 'object' && _val !== null;
	},

	removeWhiteSpaces(_string){
		return _string.replaceAll(/\s/g,'');
	},


	setCharAt(index, chr, str = this){
		if(index > str.length - 1) return str;
		return str.substring(0, index) + chr + str.substring(index + 1);
	}

};


