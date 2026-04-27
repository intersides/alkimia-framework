import { transfer } from '../../../lib/utilities/index.js';

/**
 * Input
 *
 * Text input with label. Supports text, email, and password types.
 * Password type gets a toggle button using icons from IconService.
 *
 * Validators are passed as an array of { on, validate } objects.
 * The validate function receives the input value and is called with
 * the Input instance as `this`, giving access to:
 *   this.markValid()      — set valid state (propagates to forms)
 *   this.markInvalid()    — set invalid state (propagates to forms)
 *   this.showIssue({})    — display a message below the input
 *   this.clearIssues()    — remove messages
 *
 * Dependencies: transfer, IconService (required for password toggle)
 */

Input.IssueType = Object.freeze({
    ERROR:    'error',
    WARNING:  'warning',
    FEEDBACK: 'feedback'
});

Input.Type = Object.freeze({
    TEXT:     'text',
    EMAIL:    'email',
    PASSWORD: 'password'
});


export default function Input(_params) {

    const instance = Object.create(Input.prototype);

    const { label, type, placeholder, passwordIcons, localisationService, localisationTerm, validators } = transfer(_params, {
        label: '',
        type: Input.Type.TEXT,
        placeholder: '',
        iconService: null,
        passwordIcons: null,
        localisationService: null,
        localisationTerm: null,
        validators: []
    });

    let _vInput = null;
    let _vLabel = null;
    let _vField = null;
    let _vIssue = null;
    let _passwordVisible = false;
    let _valid = true;
    let _onInput = null;
    let _onValidityChange = null;


    function _init() {

        instance.view = document.createElement('div');
        instance.view.className = 'Input';
        instance.view.setAttribute('data-alkimia-widget', 'Input');

        _vLabel = document.createElement('label');
        _vLabel.className = 'label';
        _vLabel.textContent = _localise(localisationTerm) || label;

        if (localisationTerm) {
            _vLabel.setAttribute('data-localised', localisationTerm);
        }

        _vField = document.createElement('div');
        _vField.className = 'field';

        _vInput = document.createElement('input');
        _vInput.className = 'input';
        _vInput.type = type;
        _vInput.placeholder = placeholder;
        _vInput.autocomplete = _getAutocomplete();

        _vInput.addEventListener('input', function() {
            if (_onInput) { _onInput(_vInput.value); }
        });

        _vField.appendChild(_vInput);

        if (type === Input.Type.PASSWORD && passwordIcons) {
            _vField.appendChild(_buildPasswordToggle());
        }

        _vIssue = document.createElement('div');
        _vIssue.className = 'issue';
        _vIssue.hidden = true;

        instance.view.appendChild(_vLabel);
        instance.view.appendChild(_vField);
        instance.view.appendChild(_vIssue);

        _bindValidators();

        if (localisationService) {
            localisationService.onChange(function() {
                localisationService.localise();
            });
        }

        return instance;
    }


    function _localise(termId) {
        if (!termId) { return null; }
        return localisationService ? localisationService.getTerm(termId) : termId;
    }


    function _getAutocomplete() {
        if (type === 'email') { return 'email'; }
        if (type === 'password') { return 'current-password'; }
        return 'off';
    }


    function _bindValidators() {

        for (let i = 0; i < validators.length; i++) {

            const entry = validators[i];

            _vInput.addEventListener(entry.on, function() {
                entry.validate.call(instance, _vInput.value);
            });
        }
    }


    function _buildPasswordToggle() {

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'toggle';
        button.setAttribute('aria-label', 'Toggle password visibility');

        const showIcon = passwordIcons.visible;
        const hideIcon = passwordIcons.hidden;

        showIcon.classList.add('icon-small');
        hideIcon.classList.add('icon-small');

        showIcon.style.display = 'none';
        button.appendChild(showIcon);
        button.appendChild(hideIcon);

        button.addEventListener('click', function() {

            _passwordVisible = !_passwordVisible;
            _vInput.type = _passwordVisible ? 'text' : 'password';

            showIcon.style.display = _passwordVisible ? 'inline-block' : 'none';
            hideIcon.style.display = _passwordVisible ? 'none' : 'inline-block';
        });

        return button;
    }


    // --- Public API ---

    instance.markValid = function() {
        _valid = true;
        _vField.classList.remove('invalid');
        _vField.classList.add('valid');

        if (_onValidityChange) {
            _onValidityChange(true);
        }
    };

    instance.markInvalid = function() {
        _valid = false;
        _vField.classList.remove('valid');
        _vField.classList.add('invalid');

        if (_onValidityChange) {
            _onValidityChange(false);
        }
    };

    instance.showIssue = function(issue) {

        const text = _localise(issue.localisationId) || issue.message;

        _vIssue.textContent = text;
        _vIssue.className = 'issue ' + issue.type;
        _vIssue.hidden = false;
    };

    instance.clearIssues = function() {
        _vIssue.textContent = '';
        _vIssue.className = 'issue';
        _vIssue.hidden = true;
    };

    instance.isValid = function() {
        return _valid;
    };

    instance.onValidityChange = function(callback) {
        _onValidityChange = callback;
    };

    instance.getValue = function() {
        return _vInput.value;
    };

    instance.setValue = function(value) {
        _vInput.value = value;
    };

    instance.onInput = function(callback) {
        _onInput = callback;
    };

    instance.focus = function() {
        _vInput.focus();
    };

    instance.reset = function() {
        _vInput.value = '';
        _valid = true;
        _vField.classList.remove('invalid', 'valid');
        instance.clearIssues();

        if (type === 'password') {
            _passwordVisible = false;
            _vInput.type = 'password';
        }
    };

    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}
