import { transfer } from '../../../lib/utilities/index.js';

let _addressBarClaimed = false;

/**
 * Router
 *
 * SPA router with its own nav element.
 * Owns navigation UI and manages page lifecycle.
 *
 * Routes is an array of items, each either:
 *   { type: 'link', entry: { label, path, page } }
 *   { type: 'group', label, entries: [{ label, path, page }] }
 *
 * Dependencies: transfer, LocalisationService (optional)
 */
export default function Router(_params) {

    const instance = Object.create(Router.prototype);

    const { routes, storageService, localisationService, controlsAddressBar } = transfer(_params, {
        routes: [],
        storageService: null,
        localisationService: null,
        controlsAddressBar: false
    });

    let _onRoute = null;
    let _pages = {};
    let _routeMap = {};
    let _currentRouteId = null;
    let $content = null;


    function _init() {

        _buildRouteMap();
        _buildView();

        if (localisationService) {
            localisationService.onChange(function() {
                _updateLabels();
            });
        }

        if (controlsAddressBar) {
            if (_addressBarClaimed) {
                throw new Error('Router: only one instance can control the address bar');
            }
            _addressBarClaimed = true;

            window.addEventListener('popstate', function() {
                _resolve(window.location.pathname, false);
            });
        }

        return instance;
    }


    function _buildRouteMap() {

        for (let i = 0; i < routes.length; i++) {

            const item = routes[i];

            if (item.type === 'link') {
                _routeMap[item.entry.path] = item.entry;
            }
            else if (item.type === 'group') {
                for (let j = 0; j < item.entries.length; j++) {
                    _routeMap[item.entries[j].path] = item.entries[j];
                }
            }
        }
    }


    function _localise(termId) {
        return localisationService ? localisationService.getTerm(termId) : termId;
    }


    function _buildLink(entry) {

        const li = document.createElement('li');
        const a = document.createElement('a');

        const termId = entry.localisedLabel || entry.label;
        a.textContent = _localise(termId);
        a.setAttribute('data-localised', termId);
        a.href = entry.path;
        a.setAttribute('data-route', entry.path);

        a.addEventListener('click', function(evt) {
            evt.preventDefault();
            instance.navigateTo(entry.path);
        });

        li.appendChild(a);
        return li;
    }


    function _buildView() {

        instance.view = document.createElement('ul');
        instance.view.className = 'Router-nav';
        instance.view.setAttribute('data-alkimia-service', 'Router');

        for (let i = 0; i < routes.length; i++) {

            const item = routes[i];

            if (item.type === 'link') {

                instance.view.appendChild(_buildLink(item.entry));
            }
            else if (item.type === 'group') {

                const groupLi = document.createElement('li');
                groupLi.className = 'Router-group';

                if (item.label) {

                    const termId = item.localisedLabel || item.label;
                    const label = document.createElement('span');
                    label.className = 'Router-group-label';
                    label.textContent = _localise(termId);

                    if (localisationService) {
                        label.setAttribute('data-localised', termId);
                    }

                    groupLi.appendChild(label);
                }

                const groupList = document.createElement('ul');
                groupList.className = 'Router-group-list';

                for (let j = 0; j < item.entries.length; j++) {
                    groupList.appendChild(_buildLink(item.entries[j]));
                }

                groupLi.appendChild(groupList);
                instance.view.appendChild(groupLi);
            }
        }
    }


    function _updateLabels() {

        const elements = instance.view.querySelectorAll('[data-localised]');

        for (let i = 0; i < elements.length; i++) {

            const el = elements[i];
            el.textContent = _localise(el.getAttribute('data-localised'));
        }
    }


    function _highlightActive(path) {

        const links = instance.view.querySelectorAll('a');

        for (let i = 0; i < links.length; i++) {

            if (links[i].getAttribute('data-route') === path) {
                links[i].classList.add('active');
            }
            else {
                links[i].classList.remove('active');
            }
        }
    }


    function _showPage(path) {

        if (!$content) { return; }

        if (_currentRouteId && _pages[_currentRouteId]) {
            _pages[_currentRouteId].view.hidden = true;
        }

        const route = _routeMap[path];

        if (!_pages[path] && route && route.page) {
            _pages[path] = route.page({ localisationService });
            $content.appendChild(_pages[path].view);
        }

        if (_pages[path]) {
            _pages[path].view.hidden = false;
        }

        _currentRouteId = path;
    }


    function _resolve(fullPath, pushState) {

        const parts = fullPath.split('#');
        const pathname = parts[0];
        const hash = parts[1] || null;

        for (const path in _routeMap) {

            const isExact = pathname === path;
            const isNested = pathname.startsWith(path + '/');

            if (isExact || isNested) {

                if (controlsAddressBar && pushState) {
                    history.pushState(null, '', fullPath);
                }

                if (storageService) {
                    storageService.set('currentRoute', path);
                }

                _highlightActive(path);
                _showPage(path);

                if (_onRoute) {
                    _onRoute(path, _routeMap[path], hash);
                }

                return;
            }
        }

        console.error('unknown route:', fullPath);
    }


    // --- Public API ---

    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };

    instance.mountPages = function(container) {
        $content = container;
    };

    instance.navigateTo = function(path, pushToHistory) {
        _resolve(path, pushToHistory !== false);
    };

    instance.onRoute = function(callback) {
        _onRoute = callback;
    };

    instance.getRoutes = function() {
        return _routeMap;
    };

    instance.getPage = function(path) {
        return _pages[path] || null;
    };


    return _init();
}
