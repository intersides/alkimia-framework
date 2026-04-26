import { transfer } from '../../../lib/utilities/index.js';

/**
 * Notifier
 *
 * Notification stack with positioning, animation, auto-dismiss, and alert levels.
 *
 * Usage:
 *   const notifier = Notifier({ position: Notifier.Position.TOP_RIGHT });
 *   notifier.appendTo(document.body);
 *   notifier.notify({ message: 'Saved', level: Notifier.Level.INFO });
 *
 * Dependencies: transfer
 */

Notifier.Position = Object.freeze({
    TOP_LEFT:       'top-left',
    TOP_CENTER:     'top-center',
    TOP_RIGHT:      'top-right',
    MIDDLE_LEFT:    'middle-left',
    MIDDLE_CENTER:  'middle-center',
    MIDDLE_RIGHT:   'middle-right',
    BOTTOM_LEFT:    'bottom-left',
    BOTTOM_CENTER:  'bottom-center',
    BOTTOM_RIGHT:   'bottom-right'
});

Notifier.Level = Object.freeze({
    INFO:     'info',
    WARNING:  'warning',
    CRITICAL: 'critical'
});

Notifier.Animation = Object.freeze({
    SLIDE: 'slide',
    POP:   'pop'
});


export default function Notifier(_params) {

    const instance = Object.create(Notifier.prototype);

    const { position, animation, autoDismiss } = transfer(_params, {
        position: Notifier.Position.TOP_RIGHT,
        animation: Notifier.Animation.SLIDE,
        autoDismiss: 4000
    });


    function _init() {

        instance.view = document.createElement('div');
        instance.view.className = 'Notifier';
        instance.view.setAttribute('data-alkimia-widget', 'Notifier');
        instance.view.setAttribute('data-position', position);
        instance.view.setAttribute('data-animation', animation);

        return instance;
    }


    instance.notify = function(options) {

        const { message, level, dismiss } = transfer(options, {
            message: '',
            level: Notifier.Level.INFO,
            dismiss: true
        });

        const item = document.createElement('div');
        item.className = 'Notifier-item';
        item.setAttribute('data-level', level);

        const text = document.createElement('span');
        text.className = 'Notifier-message';
        text.textContent = message;
        item.appendChild(text);

        if (dismiss) {

            const closeBtn = document.createElement('button');
            closeBtn.className = 'Notifier-close';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', function() {
                _remove(item);
            });
            item.appendChild(closeBtn);
        }

        // Animate in
        item.classList.add('entering');

        const isBottom = position.indexOf('bottom') === 0;

        if (isBottom) {
            instance.view.appendChild(item);
        } else {
            instance.view.insertBefore(item, instance.view.firstChild);
        }

        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                item.classList.remove('entering');
                item.classList.add('visible');
            });
        });

        // Auto-dismiss
        if (autoDismiss > 0) {

            setTimeout(function() {
                _remove(item);
            }, autoDismiss);
        }

        return item;
    };


    function _remove(item) {

        if (!item.parentNode) { return; }

        item.classList.remove('visible');
        item.classList.add('leaving');

        item.addEventListener('transitionend', function() {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, { once: true });

        // Fallback if transition doesn't fire
        setTimeout(function() {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, 400);
    }


    instance.clear = function() {

        while (instance.view.firstChild) {
            instance.view.removeChild(instance.view.firstChild);
        }
    };


    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}
