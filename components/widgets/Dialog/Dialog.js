import { transfer } from '../../../lib/utilities/index.js';

/**
 * Dialog
 *
 * Wraps the native <dialog> element. Handles open/close, backdrop dismiss,
 * ESC dismiss (native), optional close button, and size presets.
 * Content is injected — the consumer owns what goes inside.
 *
 * Usage:
 *   const dialog = Dialog({ size: Dialog.Size.MEDIUM, dismissOnBackdrop: true });
 *   dialog.appendTo(document.body);
 *   dialog.open(someElement);
 *   dialog.close();
 *
 * Dependencies: transfer
 */

Dialog.Size = Object.freeze({
    SMALL:  'small',
    MEDIUM: 'medium',
    LARGE:  'large',
    FULL:   'full'
});


export default function Dialog(_params) {

    const instance = Object.create(Dialog.prototype);

    const { size, dismissOnBackdrop, showClose, closeIcon } = transfer(_params, {
        size: Dialog.Size.MEDIUM,
        dismissOnBackdrop: true,
        showClose: true,
        closeIcon: null
    });

    let _onClose = null;
    let _contentContainer = null;
    let _closeBtn = null;


    function _init() {

        instance.view = document.createElement('dialog');
        instance.view.className = 'Dialog';
        instance.view.setAttribute('data-alkimia-widget', 'Dialog');
        instance.view.setAttribute('data-size', size);

        _contentContainer = document.createElement('div');
        _contentContainer.className = 'Dialog-content';
        instance.view.appendChild(_contentContainer);

        if (showClose) {
            _closeBtn = document.createElement('button');
            _closeBtn.className = 'Dialog-close';

            if (closeIcon instanceof Element) {
                _closeBtn.appendChild(closeIcon);
            } else {
                _closeBtn.textContent = '×';
            }

            _closeBtn.addEventListener('click', function() {
                instance.close();
            });
            instance.view.appendChild(_closeBtn);
        }

        if (dismissOnBackdrop) {
            instance.view.addEventListener('click', function(e) {
                if (e.target === instance.view) {
                    instance.close();
                }
            });
        }

        instance.view.addEventListener('close', function() {
            _contentContainer.innerHTML = '';
            if (_onClose) { _onClose(); }
            if (instance.view.parentNode) {
                instance.view.parentNode.removeChild(instance.view);
            }
        });

        return instance;
    }


    instance.open = function(content) {

        _contentContainer.innerHTML = '';

        if (typeof content === 'string') {
            _contentContainer.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            _contentContainer.appendChild(content);
        }

        instance.view.showModal();
    };


    instance.close = function() {
        instance.view.close();
    };


    instance.onClose = function(fn) {
        _onClose = fn;
    };


    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}
