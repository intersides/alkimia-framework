import { transfer } from '../../../lib/utilities/index.js';

/**
 * LocalisationService
 *
 * Manages language dictionaries, a language selector UI, and emits
 * language change events. Resolves language from: saved preference,
 * browser language, or default.
 *
 * Dependencies: transfer
 *
 * Usage:
 *   const localisationService = LocalisationService({
 *       storageService,
 *       defaultLang: 'en',
 *       dictionaries: { en: { ... }, fr: { ... } }
 *   });
 *   localisationService.appendTo(sidebarEl);
 *   localisationService.onChange(function(langId) { ... });
 *   localisationService.getTerm('route-home');
 */
export default function LocalisationService(_params) {

    const instance = Object.create(LocalisationService.prototype);

    const { storageService, defaultLang, dictionaries } = transfer(_params, {
        storageService: null,
        defaultLang: 'en',
        dictionaries: null
    });

    const _langNames = {
        en: 'English',
        fr: 'Français',
        de: 'Deutsch',
        it: 'Italiano',
        es: 'Español',
        ja: '日本語',
        ko: '한국어'
    };

    let _dictionaries = dictionaries || {};
    let _currentLang = defaultLang;
    let _listeners = [];
    let $selector = null;


    function _init() {

        _buildSelector();

        const saved = storageService ? storageService.get('lang') : null;
        const systemLang = navigator.language ? navigator.language.split('-')[0] : null;
        const resolved = saved || (_dictionaries[systemLang] ? systemLang : defaultLang);

        _setLanguage(resolved);

        return instance;
    }


    function _buildSelector() {

        instance.view = document.createElement('div');
        instance.view.className = 'LocalisationService-selector';
        instance.view.setAttribute('data-alkimia-service', 'LocalisationService');

        $selector = document.createElement('select');
        $selector.className = 'lang-select';

        for (const langId in _dictionaries) {

            const option = document.createElement('option');
            option.value = langId;
            option.textContent = _langNames[langId] || langId.toUpperCase();
            $selector.appendChild(option);
        }

        $selector.addEventListener('change', function() {
            _setLanguage($selector.value);
        });

        instance.view.appendChild($selector);
    }


    function _setLanguage(langId) {

        if (!_dictionaries[langId]) {
            console.error('unknown language:', langId);
            return;
        }

        _currentLang = langId;
        $selector.value = langId;
        document.documentElement.setAttribute('data-lang', langId);

        if (storageService) {
            storageService.set('lang', langId, true);
        }

        _applyToDOM();

        for (let i = 0; i < _listeners.length; i++) {
            _listeners[i](langId);
        }
    }


    function _applyToDOM() {

        const elements = document.querySelectorAll('[data-localised]');

        for (let i = 0; i < elements.length; i++) {

            const el = elements[i];
            const termId = el.getAttribute('data-localised');
            el.textContent = instance.getTerm(termId);
        }
    }


    instance.getTerm = function(termId) {
        return _dictionaries[_currentLang]?.[termId]
            ?? _dictionaries[defaultLang]?.[termId]
            ?? termId;
    };

    instance.setLanguage = function(langId) {
        _setLanguage(langId);
    };

    instance.getCurrentLang = function() {
        return _currentLang;
    };

    instance.getAvailableLanguages = function() {
        return Object.keys(_dictionaries);
    };

    instance.onChange = function(fn) {
        _listeners.push(fn);
    };

    instance.localise = function() {
        _applyToDOM();
    };

    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}
