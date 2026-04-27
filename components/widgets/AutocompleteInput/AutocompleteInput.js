import { transfer } from '../../../lib/utilities/index.js';

/**
 * AutocompleteInput
 *
 * Text input with a filterable dropdown list of predefined choices.
 * List appears on focus, filters on typing, supports keyboard navigation.
 *
 * Clear button: always visible, disabled when input is empty.
 * ESC while typing: clears and resets list (stays focused).
 * ESC while navigating list: closes list and blurs (done).
 * Selection (click or Enter): fills input, closes list, blurs.
 *
 * Dependencies: transfer
 */
export default function AutocompleteInput(_params) {

    const instance = Object.create(AutocompleteInput.prototype);

    const params = transfer(_params, {
        label: '',
        items: [],
        maxVisible: 6,
        placeholder: '',
        clearIcon: null
    });

    const { label, maxVisible, placeholder, clearIcon } = params;
    let items = params.items;

    let _vInput = null;
    let _vList = null;
    let _clearBtn = null;
    let _filtered = [];
    let _highlightIndex = -1;
    let _onSelect = null;
    let _open = false;


    function _init() {

        instance.view = document.createElement('div');
        instance.view.className = 'AutocompleteInput';
        instance.view.setAttribute('data-alkimia-widget', 'AutocompleteInput');

        if (label) {
            const vLabel = document.createElement('label');
            vLabel.className = 'AutocompleteInput-label';
            vLabel.textContent = label;
            instance.view.appendChild(vLabel);
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'AutocompleteInput-wrapper';

        _vInput = document.createElement('input');
        _vInput.type = 'text';
        _vInput.className = 'AutocompleteInput-input';
        _vInput.placeholder = placeholder;
        _vInput.setAttribute('autocomplete', 'off');

        _clearBtn = document.createElement('button');
        _clearBtn.className = 'AutocompleteInput-clear';
        _clearBtn.disabled = true;

        if (clearIcon instanceof Element) {
            _clearBtn.appendChild(clearIcon);
        } else {
            _clearBtn.textContent = '×';
        }

        _vList = document.createElement('ul');
        _vList.className = 'AutocompleteInput-list';
        _vList.hidden = true;

        wrapper.appendChild(_vInput);
        wrapper.appendChild(_clearBtn);
        wrapper.appendChild(_vList);
        instance.view.appendChild(wrapper);

        // --- Events ---

        _vInput.addEventListener('focus', function() {
            _filter(_vInput.value);
            _show();
        });

        _vInput.addEventListener('input', function() {
            _syncClearState();
            _filter(_vInput.value);
            _show();
        });

        _vInput.addEventListener('keydown', function(e) {

            if (e.key === 'Escape') {
                e.preventDefault();

                if (_highlightIndex >= 0) {
                    // Item highlighted — done, close everything
                    _vInput.value = '';
                    _vInput.title = '';
                    _syncClearState();
                    _hide();
                    _vInput.blur();
                } else {
                    // No highlight (typing) — reset and show full list
                    _vInput.value = '';
                    _vInput.title = '';
                    _syncClearState();
                    _filter('');
                    _show();
                }

                if (_onSelect) { _onSelect(''); }
                return;
            }

            if (!_open) { return; }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                _highlight(Math.min(_highlightIndex + 1, _filtered.length - 1));
                return;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                _highlight(Math.max(_highlightIndex - 1, 0));
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                const idx = _highlightIndex >= 0 ? _highlightIndex : 0;
                if (_filtered[idx]) {
                    _select(_filtered[idx]);
                }
            }
        });

        _clearBtn.addEventListener('mousedown', function(e) {
            e.preventDefault();
            if (_vInput.value === '') { return; }
            _vInput.value = '';
            _vInput.title = '';
            _syncClearState();
            _filter('');
            _show();
            _vInput.focus();
            if (_onSelect) { _onSelect(''); }
        });

        document.addEventListener('click', function(e) {
            if (!instance.view.contains(e.target)) {
                _hide();
            }
        });

        return instance;
    }


    function _syncClearState() {
        _clearBtn.disabled = _vInput.value === '';
    }


    function _filter(query) {

        const q = query.toLowerCase();

        _filtered = items.filter(function(item) {
            return item.toLowerCase().indexOf(q) !== -1;
        });

        _highlightIndex = -1;
        _renderList();
    }


    function _renderList() {

        _vList.innerHTML = '';

        const itemHeight = 40;
        _vList.style.maxHeight = (maxVisible * itemHeight) + 'px';

        for (let i = 0; i < _filtered.length; i++) {

            const li = document.createElement('li');
            li.className = 'AutocompleteInput-item';
            li.textContent = _filtered[i];

            if (i === _highlightIndex) {
                li.classList.add('highlighted');
            }

            const index = i;

            li.addEventListener('mousedown', function(e) {
                e.preventDefault();
                _select(_filtered[index]);
            });

            li.addEventListener('mouseenter', function() {
                _highlight(index);
            });

            _vList.appendChild(li);
        }
    }


    function _highlight(index) {

        _highlightIndex = index;

        const listItems = _vList.querySelectorAll('.AutocompleteInput-item');

        for (let i = 0; i < listItems.length; i++) {
            listItems[i].classList.toggle('highlighted', i === index);
        }

        if (listItems[index]) {
            listItems[index].scrollIntoView({ block: 'nearest' });
        }
    }


    function _select(value) {

        _hide();
        _vInput.value = value;
        _vInput.title = value;
        _syncClearState();
        _vInput.blur();

        if (_onSelect) { _onSelect(value); }
    }


    function _show() {

        if (_filtered.length === 0) {
            _hide();
            return;
        }

        _vList.hidden = false;
        _open = true;
    }


    function _hide() {
        _vList.hidden = true;
        _open = false;
        _highlightIndex = -1;
    }


    instance.getValue = function() {
        return _vInput.value;
    };

    instance.setValue = function(value) {
        _vInput.value = value;
        _syncClearState();
    };

    instance.onSelect = function(fn) {
        _onSelect = fn;
    };

    instance.setItems = function(newItems) {
        items = newItems;
        _filter(_vInput.value);
    };

    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };

    return _init();
}
