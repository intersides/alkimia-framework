/**
 * Tooltip
 *
 * Singleton tooltip that attaches to any element.
 * Positions relative to the mouse cursor, not the element center.
 * Supports text or rich DOM content, configurable position and delay.
 *
 * Usage:
 *   Tooltip.attach({
 *       target: someElement,
 *       content: 'Helpful text',
 *       position: Tooltip.Position.TOP,
 *       delay: 300
 *   });
 *
 * Returns a detach function to remove the tooltip binding.
 *
 * Dependencies: none
 */

Tooltip.Position = Object.freeze({
    TOP:    'top',
    BOTTOM: 'bottom',
    LEFT:   'left',
    RIGHT:  'right'
});

let _vTooltip = null;
let _vContent = null;
let _vArrow = null;
let _showTimeout = null;
let _mounted = false;
let _currentTarget = null;


function _ensureMounted() {

    if (_mounted) { return; }

    _vTooltip = document.createElement('div');
    _vTooltip.className = 'Tooltip';
    _vTooltip.setAttribute('data-alkimia-widget', 'Tooltip');
    _vTooltip.hidden = true;

    _vContent = document.createElement('div');
    _vContent.className = 'Tooltip-content';

    _vArrow = document.createElement('div');
    _vArrow.className = 'Tooltip-arrow';

    _vTooltip.appendChild(_vContent);
    _vTooltip.appendChild(_vArrow);
    document.body.appendChild(_vTooltip);

    _mounted = true;
}


function _show(target, content, position) {

    _ensureMounted();
    _currentTarget = target;

    _vContent.innerHTML = '';

    if (typeof content === 'string') {
        _vContent.textContent = content;
    } else if (content instanceof Element) {
        _vContent.appendChild(content.cloneNode(true));
    }

    _vTooltip.setAttribute('data-position', position);
    _vTooltip.hidden = false;

    _position(position);
}


function _position(position) {

    const gap = 8;
    const ttRect = _vTooltip.getBoundingClientRect();
    const target = _currentTarget;
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const result = _resolvePosition(position, rect, ttRect, gap, vw, vh);
    _vTooltip.style.top = result.top + 'px';
    _vTooltip.style.left = result.left + 'px';
    _vTooltip.setAttribute('data-position', result.actual);
}


function _calcPosition(pos, rect, ttRect, gap) {

    let top = 0;
    let left = 0;

    if (pos === Tooltip.Position.TOP) {
        top = rect.top - ttRect.height - gap;
        left = rect.left + (rect.width - ttRect.width) / 2;
    } else if (pos === Tooltip.Position.BOTTOM) {
        top = rect.bottom + gap;
        left = rect.left + (rect.width - ttRect.width) / 2;
    } else if (pos === Tooltip.Position.LEFT) {
        top = rect.top + (rect.height - ttRect.height) / 2;
        left = rect.left - ttRect.width - gap;
    } else if (pos === Tooltip.Position.RIGHT) {
        top = rect.top + (rect.height - ttRect.height) / 2;
        left = rect.right + gap;
    }

    return { top, left };
}


function _fitsViewport(top, left, ttRect, vw, vh) {

    return top >= 4 && left >= 4 &&
        left + ttRect.width <= vw - 4 &&
        top + ttRect.height <= vh - 4;
}


function _resolvePosition(preferred, rect, ttRect, gap, vw, vh) {

    const clockwise = {
        top: ['top', 'right', 'bottom', 'left'],
        right: ['right', 'bottom', 'left', 'top'],
        bottom: ['bottom', 'left', 'top', 'right'],
        left: ['left', 'top', 'right', 'bottom']
    };

    const order = clockwise[preferred];

    for (let i = 0; i < order.length; i++) {
        const pos = _calcPosition(order[i], rect, ttRect, gap);
        if (_fitsViewport(pos.top, pos.left, ttRect, vw, vh)) {
            return { top: pos.top, left: pos.left, actual: order[i] };
        }
    }

    // Nothing fits — clamp preferred to viewport
    const pos = _calcPosition(preferred, rect, ttRect, gap);
    pos.top = Math.max(4, Math.min(pos.top, vh - ttRect.height - 4));
    pos.left = Math.max(4, Math.min(pos.left, vw - ttRect.width - 4));
    return { top: pos.top, left: pos.left, actual: preferred };
}


function _hide() {

    if (_showTimeout) {
        clearTimeout(_showTimeout);
        _showTimeout = null;
    }

    if (_vTooltip) {
        _vTooltip.hidden = true;
    }
}


export default function Tooltip() {}


Tooltip.attach = function(params) {

    const target = params.target;
    const content = params.content;
    const position = params.position || Tooltip.Position.TOP;
    const delay = params.delay !== undefined ? params.delay : 300;

    function onEnter(e) {
        if (delay > 0) {
            _showTimeout = setTimeout(function() {
                _show(target, content, position);
            }, delay);
        } else {
            _show(target, content, position);
        }
    }

    function onLeave() {
        _hide();
    }

    target.addEventListener('mouseenter', onEnter);
    target.addEventListener('mouseleave', onLeave);

    return function detach() {
        target.removeEventListener('mouseenter', onEnter);
        target.removeEventListener('mouseleave', onLeave);
        _hide();
    };
};
