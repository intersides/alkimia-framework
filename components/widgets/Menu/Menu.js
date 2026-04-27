import { transfer } from '../../../lib/utilities/index.js';

/**
 * Menu
 *
 * Dropdown menu with nested submenus and keyboard navigation.
 * Opens from a trigger button. Leaf items fire onSelect.
 * Supports flyout submenus and inline expandable sections.
 *
 * Keyboard: Arrow keys navigate, Enter selects or toggles,
 * Right opens submenu, Left closes submenu, ESC closes menu.
 *
 * Dependencies: transfer
 */
export default function Menu(_params) {

    const instance = Object.create(Menu.prototype);

    const { label, items, icon } = transfer(_params, {
        label: 'Menu',
        items: [],
        icon: null
    });

    let _onSelect = null;
    let _vButton = null;
    let _vDropdown = null;
    let _open = false;
    let _focusedBtn = null;


    function _init() {

        instance.view = document.createElement('div');
        instance.view.className = 'Menu';
        instance.view.setAttribute('data-alkimia-widget', 'Menu');

        _vButton = document.createElement('button');
        _vButton.className = 'Menu-trigger';

        if (icon instanceof Element) {
            _vButton.appendChild(icon);
        }

        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        _vButton.appendChild(labelSpan);

        const arrow = document.createElement('span');
        arrow.className = 'Menu-trigger-arrow';
        arrow.textContent = '▾';
        _vButton.appendChild(arrow);

        _vDropdown = _buildList(items);
        _vDropdown.classList.add('Menu-dropdown');
        _vDropdown.hidden = true;

        instance.view.appendChild(_vButton);
        instance.view.appendChild(_vDropdown);

        _vButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (_open) { _close(); } else { _openMenu(); }
        });

        document.addEventListener('click', function(e) {
            if (_open && !instance.view.contains(e.target)) {
                _close();
            }
        });

        instance.view.addEventListener('keydown', function(e) {
            if (!_open) { return; }

            if (e.key === 'Escape') {
                e.preventDefault();
                _close();
                _vButton.focus();
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                _moveFocus(1);
                return;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                _moveFocus(-1);
                return;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                _openFocusedSubmenu();
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                _closeFocusedSubmenu();
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                if (_focusedBtn) { _focusedBtn.click(); }
            }
        });

        return instance;
    }


    function _buildList(menuItems) {

        const ul = document.createElement('ul');
        ul.className = 'Menu-list';

        for (let i = 0; i < menuItems.length; i++) {
            ul.appendChild(_buildItem(menuItems[i]));
        }

        return ul;
    }


    function _buildItem(item) {

        const li = document.createElement('li');
        li.className = 'Menu-item';

        const button = document.createElement('button');
        button.className = 'Menu-item-button';

        if (item.className) {
            button.classList.add(item.className);
        }

        const labelSpan = document.createElement('span');
        labelSpan.textContent = item.label;
        button.appendChild(labelSpan);

        const hasChildren = item.items && item.items.length > 0;

        // Store item data on the button for keyboard handler
        button._menuItem = item;

        button.addEventListener('mouseenter', function() {
            _setFocus(button);
        });

        if (hasChildren && item.expandable) {

            const arrow = document.createElement('span');
            arrow.className = 'Menu-expand-arrow';
            arrow.textContent = '▾';
            button.appendChild(arrow);

            const sublist = _buildList(item.items);
            sublist.className = 'Menu-list Menu-inline';
            sublist.hidden = true;
            li.appendChild(button);
            li.appendChild(sublist);
            button._sublist = sublist;
            button._arrow = arrow;
            button._expandable = true;

            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const expanded = !sublist.hidden;
                sublist.hidden = expanded;
                arrow.textContent = expanded ? '▾' : '▴';
            });

        } else if (hasChildren) {

            const arrow = document.createElement('span');
            arrow.className = 'Menu-submenu-arrow';
            arrow.textContent = '▸';
            button.appendChild(arrow);

            const submenu = _buildList(item.items);
            submenu.className = 'Menu-list Menu-submenu';
            submenu.hidden = true;
            li.appendChild(button);
            li.appendChild(submenu);
            button._sublist = submenu;

            li.addEventListener('mouseenter', function() {
                submenu.hidden = false;
            });

            li.addEventListener('mouseleave', function() {
                submenu.hidden = true;
            });

            button.addEventListener('click', function(e) {
                e.stopPropagation();
                submenu.hidden = !submenu.hidden;
            });

        } else {

            li.appendChild(button);

            button.addEventListener('click', function(e) {
                e.stopPropagation();
                _close();
                if (_onSelect) { _onSelect(item.key, item); }
            });
        }

        return li;
    }


    function _getVisibleButtons() {

        const buttons = [];
        const allButtons = _vDropdown.querySelectorAll('.Menu-item-button');

        for (let i = 0; i < allButtons.length; i++) {

            const btn = allButtons[i];
            let hidden = false;
            let el = btn.parentElement;

            while (el && el !== _vDropdown) {
                if (el.hidden) { hidden = true; break; }
                el = el.parentElement;
            }

            if (!hidden) { buttons.push(btn); }
        }

        return buttons;
    }


    function _setFocus(btn) {

        if (_focusedBtn) {
            _focusedBtn.classList.remove('focused');
        }

        _focusedBtn = btn;

        if (btn) {
            btn.classList.add('focused');
            btn.focus();
        }
    }


    function _moveFocus(direction) {

        const buttons = _getVisibleButtons();
        if (buttons.length === 0) { return; }

        let idx = buttons.indexOf(_focusedBtn);
        idx += direction;

        if (idx < 0) { idx = buttons.length - 1; }
        if (idx >= buttons.length) { idx = 0; }

        _setFocus(buttons[idx]);
    }


    function _openFocusedSubmenu() {

        if (!_focusedBtn || !_focusedBtn._sublist) { return; }

        const sublist = _focusedBtn._sublist;
        sublist.hidden = false;

        if (_focusedBtn._expandable && _focusedBtn._arrow) {
            _focusedBtn._arrow.textContent = '▴';
        }

        const firstBtn = sublist.querySelector('.Menu-item-button');
        if (firstBtn) { _setFocus(firstBtn); }
    }


    function _closeFocusedSubmenu() {

        if (!_focusedBtn) { return; }

        const parentList = _focusedBtn.closest('.Menu-submenu, .Menu-inline');
        if (!parentList) { return; }

        const parentLi = parentList.parentElement;
        const parentBtn = parentLi ? parentLi.querySelector(':scope > .Menu-item-button') : null;

        parentList.hidden = true;

        if (parentBtn && parentBtn._expandable && parentBtn._arrow) {
            parentBtn._arrow.textContent = '▾';
        }

        if (parentBtn) { _setFocus(parentBtn); }
    }


    function _openMenu() {
        _vDropdown.hidden = false;
        _open = true;

        const firstBtn = _vDropdown.querySelector('.Menu-item-button');
        if (firstBtn) { _setFocus(firstBtn); }
    }


    function _close() {
        _vDropdown.hidden = true;
        _open = false;

        if (_focusedBtn) {
            _focusedBtn.classList.remove('focused');
            _focusedBtn = null;
        }

        const submenus = _vDropdown.querySelectorAll('.Menu-submenu, .Menu-inline');
        for (let i = 0; i < submenus.length; i++) {
            submenus[i].hidden = true;
        }
    }


    instance.onSelect = function(fn) {
        _onSelect = fn;
    };


    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}
