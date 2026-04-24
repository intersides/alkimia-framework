/**
 * ElementState
 *
 * Proxy-based reactive DOM binding. One state value drives
 * one or many elements, each with independent attribute transforms.
 *
 * Single binding:
 *   const [state, setState] = ElementState({ el, attrs: [{ name: 'text' }] });
 *
 * Multi binding:
 *   const [state, setState] = ElementState([
 *       { el: badge,  attrs: [{ name: 'text' }, { name: 'hidden', transform: v => v === 0 }] },
 *       { el: label,  attrs: [{ name: 'text', transform: v => '€' + v.toFixed(2) }] }
 *   ]);
 *
 * Supported attr names:
 *   text, html, value, class, hidden, disabled, checked,
 *   style.* (e.g. style.color, style.width),
 *   or any HTML attribute (href, src, data-*, aria-*, etc.)
 *
 * Returns: [proxy, setter, onChange]
 *   proxy.value  — current value
 *   setter(v)    — update value, triggers all bindings
 *   onChange(fn)  — subscribe to changes: fn(current, previous)
 */
ElementState.Attr = Object.freeze({
    TEXT:        'text',
    HTML:        'html',
    VALUE:       'value',
    CLASS:       'class',
    HIDDEN:      'hidden',
    DISABLED:    'disabled',
    CHECKED:     'checked',
    CHILDREN:    'children',
    HREF:        'href',
    SRC:         'src',
    PLACEHOLDER: 'placeholder',
    TITLE:       'title',
    ALT:         'alt',
    STYLE: Object.freeze({
        COLOR:           'style.color',
        BACKGROUND:      'style.backgroundColor',
        WIDTH:           'style.width',
        HEIGHT:          'style.height',
        OPACITY:         'style.opacity',
        DISPLAY:         'style.display',
        VISIBILITY:      'style.visibility'
    })
});


export default function ElementState(bindings) {

    const _bindings = Array.isArray(bindings) ? bindings : [bindings];
    const _listeners = [];
    const Attr = ElementState.Attr;

    const _proxy = new Proxy({ value: undefined }, {

        set: function(target, prop, newValue) {

            if (prop !== 'value') { return true; }

            const previous = target.value;
            target.value = newValue;

            for (let i = 0; i < _bindings.length; i++) {

                const binding = _bindings[i];
                const el = binding.el;
                const attrs = binding.attrs;

                for (let j = 0; j < attrs.length; j++) {

                    const attr = attrs[j];
                    const resolved = attr.transform ? attr.transform(newValue) : newValue;

                    _applyAttribute(el, attr.name, resolved);
                }
            }

            for (let k = 0; k < _listeners.length; k++) {
                _listeners[k](newValue, previous);
            }

            return true;
        }
    });


    function _applyAttribute(el, name, value) {

        if (name === Attr.TEXT) {
            el.textContent = value;
            return;
        }

        if (name === Attr.HTML) {
            el.innerHTML = value;
            return;
        }

        if (name === Attr.VALUE) {
            el.value = value;
            return;
        }

        if (name === Attr.CLASS) {
            el.className = value;
            return;
        }

        if (name === Attr.HIDDEN) {
            el.hidden = !!value;
            return;
        }

        if (name === Attr.DISABLED) {
            el.disabled = !!value;
            return;
        }

        if (name === Attr.CHECKED) {
            el.checked = !!value;
            return;
        }

        if (name === Attr.CHILDREN) {
            el.replaceChildren.apply(el, Array.isArray(value) ? value : []);
            return;
        }

        if (name.indexOf('style.') === 0) {
            el.style[name.slice(6)] = value;
            return;
        }

        el.setAttribute(name, value);
    }


    // Apply initial values
    for (let i = 0; i < _bindings.length; i++) {

        const binding = _bindings[i];
        const attrs = binding.attrs;

        for (let j = 0; j < attrs.length; j++) {

            if (attrs[j].initial !== undefined) {
                _applyAttribute(binding.el, attrs[j].name, attrs[j].initial);
            }
        }
    }


    function _setter(value) {
        _proxy.value = value;
    }

    function _onChange(fn) {
        _listeners.push(fn);
    }

    return [_proxy, _setter, _onChange];
}
