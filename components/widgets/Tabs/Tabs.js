import { transfer } from '../../../lib/utilities/index.js';

/**
 * Tabs
 *
 * Tab bar with lazy content loading. Content is created once on first
 * activation and persisted — never destroyed on tab switch.
 *
 * Usage:
 *   const tabs = Tabs({
 *       tabs: [
 *           { key: 'demo', label: 'Demo', localisedLabel: 'tab-demo' },
 *           { key: 'code', label: 'Code', localisedLabel: 'tab-code' }
 *       ],
 *       localisationService: localisationService
 *   });
 *   tabs.setContent('demo', function() { return someElement; });
 *   tabs.appendTo(container);
 *   tabs.activate('demo');
 *
 * Dependencies: transfer
 */
export default function Tabs(_params) {

    const instance = Object.create(Tabs.prototype);

    const { tabs, localisationService } = transfer(_params, {
        tabs: [],
        localisationService: null
    });

    let _activeKey = null;
    let _contentFactories = {};
    let _contentCache = {};
    let _tabButtons = {};
    let _vBar = null;
    let _vContent = null;
    let _onChange = null;


    function _init() {

        instance.view = document.createElement('div');
        instance.view.className = 'Tabs';
        instance.view.setAttribute('data-alkimia-widget', 'Tabs');

        _vBar = document.createElement('div');
        _vBar.className = 'Tabs-bar';
        _vBar.setAttribute('role', 'tablist');

        _vContent = document.createElement('div');
        _vContent.className = 'Tabs-content';

        for (let i = 0; i < tabs.length; i++) {
            _buildTab(tabs[i]);
        }

        _vBar.addEventListener('keydown', function(e) {
            const keys = tabs.map(function(t) { return t.key; });
            const idx = keys.indexOf(_activeKey);

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const next = keys[(idx + 1) % keys.length];
                instance.activate(next);
                _tabButtons[next].focus();
            }

            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = keys[(idx - 1 + keys.length) % keys.length];
                instance.activate(prev);
                _tabButtons[prev].focus();
            }
        });

        instance.view.appendChild(_vBar);
        instance.view.appendChild(_vContent);

        return instance;
    }


    function _buildTab(tab) {

        const button = document.createElement('button');
        button.className = 'Tabs-tab';
        button.setAttribute('role', 'tab');
        button.setAttribute('data-key', tab.key);
        button.textContent = _localise(tab);

        if (localisationService && tab.localisedLabel) {
            button.setAttribute('data-localised', tab.localisedLabel);
        }

        button.addEventListener('click', function() {
            instance.activate(tab.key);
        });

        _tabButtons[tab.key] = button;
        _vBar.appendChild(button);
    }


    function _localise(tab) {

        if (localisationService && tab.localisedLabel) {
            return localisationService.getTerm(tab.localisedLabel);
        }

        return tab.label;
    }


    instance.setContent = function(key, factory) {
        _contentFactories[key] = factory;
    };


    instance.activate = function(key) {

        if (_activeKey === key) { return; }

        // Hide current
        if (_activeKey && _contentCache[_activeKey]) {
            _contentCache[_activeKey].hidden = true;
            _tabButtons[_activeKey].classList.remove('active');
            _tabButtons[_activeKey].setAttribute('aria-selected', 'false');
        }

        _activeKey = key;

        // Create on first visit
        if (!_contentCache[key] && _contentFactories[key]) {
            const content = _contentFactories[key]();
            _contentCache[key] = content;
            _vContent.appendChild(content);
        }

        // Show
        if (_contentCache[key]) {
            _contentCache[key].hidden = false;
            _tabButtons[key].classList.add('active');
            _tabButtons[key].setAttribute('aria-selected', 'true');
        }

        if (_onChange) { _onChange(key); }
    };


    instance.getActiveKey = function() {
        return _activeKey;
    };


    instance.onChange = function(fn) {
        _onChange = fn;
    };


    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}
