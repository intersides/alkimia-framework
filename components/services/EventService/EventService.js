import { transfer } from '../../../lib/utilities/index.js';

/**
 * EventService
 *
 * Pub/sub event bus. Components publish events, other components listen.
 * No prop drilling, no context providers, no tree coupling.
 *
 * Usage:
 *   const eventService = EventService();
 *   eventService.on('theme:changed', function(mode) { ... });
 *   eventService.emit('theme:changed', 'dark');
 *   eventService.off('theme:changed', handler);
 *
 * Dependencies: transfer
 */
export default function EventService(_params) {

    const instance = Object.create(EventService.prototype);

    transfer(_params, {});

    const _listeners = {};


    function _init() {
        return instance;
    }


    instance.on = function(event, handler) {

        if (!_listeners[event]) {
            _listeners[event] = [];
        }

        _listeners[event].push(handler);
    };


    instance.off = function(event, handler) {

        if (!_listeners[event]) { return; }

        const list = _listeners[event];

        for (let i = list.length - 1; i >= 0; i--) {

            if (list[i] === handler) {
                list.splice(i, 1);
            }
        }
    };


    instance.emit = function(event, data) {

        if (!_listeners[event]) { return; }

        const list = _listeners[event];

        for (let i = 0; i < list.length; i++) {
            list[i](data);
        }
    };


    instance.once = function(event, handler) {

        function wrapper(data) {
            instance.off(event, wrapper);
            handler(data);
        }

        instance.on(event, wrapper);
    };


    return _init();
}
