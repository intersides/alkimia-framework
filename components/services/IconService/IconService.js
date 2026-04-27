import { transfer } from '../../../lib/utilities/index.js';
import defaultSprite from '../../../skins/default/icon-set.svg?raw';

/**
 * IconService
 *
 * Loads an SVG icon set exported from Affinity Designer.
 * Icons are identified by their layer/group name (exported as id).
 * getIcon() clones the icon element and forces currentColor.
 *
 * Dependencies: transfer
 */

const _sprites = {
    default: defaultSprite
};

IconService.Size = Object.freeze({
    SMALL:  'icon-small',
    MEDIUM: 'icon-medium',
    LARGE:  'icon-large'
});


export default function IconService(_params) {

    const instance = Object.create(IconService.prototype);

    const { skin } = transfer(_params, {
        skin: 'default'
    });

    let _icons = {};


    function _init() {

        const parser = new DOMParser();
        const doc = parser.parseFromString(_sprites[skin], 'image/svg+xml');
        const elements = doc.querySelectorAll('[id]');

        for (let i = 0; i < elements.length; i++) {

            const el = elements[i];
            const tag = el.tagName.toLowerCase();

            if (tag === 'path' || tag === 'g') {
                _icons[el.getAttribute('id')] = el;
            }
        }

        return instance;
    }


    function _applyCurrentColor(element) {

        const paths = element.tagName === 'path'
            ? [element]
            : Array.from(element.querySelectorAll('path'));

        for (let i = 0; i < paths.length; i++) {

            const style = paths[i].getAttribute('style') || '';

            if (style.indexOf('fill:none') === -1) {
                paths[i].style.fill = 'currentColor';
            }

            if (style.indexOf('stroke:') !== -1 && style.indexOf('stroke:none') === -1) {
                paths[i].style.stroke = 'currentColor';
            }
        }
    }


    instance.getIcon = function(iconId, className) {

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', className || 'icon');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');

        const source = _icons[iconId];

        if (source) {
            const clone = source.cloneNode(true);
            const bbox = _getBBox(clone);
            svg.setAttribute('viewBox', bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height);
            _applyCurrentColor(clone);
            svg.appendChild(clone);
        }
        else {
            console.error('IconService: icon "' + iconId + '" not found');
        }

        return svg;
    };


    function _getBBox(element) {

        var paths = element.tagName === 'path'
            ? [element]
            : Array.from(element.querySelectorAll('path'));

        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (var i = 0; i < paths.length; i++) {

            var d = paths[i].getAttribute('d') || '';
            var numbers = d.match(/-?[\d.]+/g);

            if (!numbers) { continue; }

            for (var j = 0; j < numbers.length; j += 2) {

                var x = parseFloat(numbers[j]);
                var y = parseFloat(numbers[j + 1]);

                if (!isNaN(x) && !isNaN(y)) {
                    if (x < minX) { minX = x; }
                    if (x > maxX) { maxX = x; }
                    if (y < minY) { minY = y; }
                    if (y > maxY) { maxY = y; }
                }
            }
        }

        var padding = 4;

        return {
            x: minX - padding,
            y: minY - padding,
            width: (maxX - minX) + padding * 2,
            height: (maxY - minY) + padding * 2
        };
    }


    return _init();
}
