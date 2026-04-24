import { transfer } from '../../../lib/utilities/index.js';
import Input from '../../widgets/Input/Input.js';

/**
 * AuthenticationService
 *
 * Manages the full authentication flow: login, registration, 2FA, session.
 * Morphs its view based on current state. Emits state change events.
 *
 * States:
 *   IDLE           → shows login/register links
 *   LOGIN_FORM     → email + password
 *   AWAITING_2FA   → code input after login
 *   REGISTER_FORM  → email + password + confirm
 *   REGISTER_2FA   → QR code scan + code verify
 *   AUTHENTICATED  → user info + logout
 *
 * Dependencies: transfer, Input
 */

const State = Object.freeze({
    IDLE:           'idle',
    LOGIN_FORM:     'login-form',
    AWAITING_2FA:   'awaiting-2fa',
    REGISTER_FORM:  'register-form',
    REGISTER_2FA:   'register-2fa',
    AUTHENTICATED:  'authenticated'
});


export default function AuthenticationService(_params) {

    const instance = Object.create(AuthenticationService.prototype);

    const { storageService, localisationService, iconService, apiUrl } = transfer(_params, {
        storageService: null,
        localisationService: null,
        iconService: null,
        apiUrl: ''
    });

    let _state = State.IDLE;
    let _user = null;
    let _token = null;
    let _listeners = [];
    let _views = {};
    let _pendingToken = null;
    let _pendingEmail = null;
    let _pending2FAUri = null;
    let _pending2FASecret = null;
    let _pending2FAQrCode = null;


    function _init() {

        instance.view = document.createElement('div');
        instance.view.className = 'AuthenticationService';
        instance.view.setAttribute('data-alkimia-service', 'AuthenticationService');

        _setState(State.IDLE);

        return instance;
    }


    function _setState(newState) {

        const previousState = _state;
        _state = newState;

        _render();

        for (let i = 0; i < _listeners.length; i++) {
            _listeners[i](_state, previousState);
        }
    }


    function _render() {

        instance.view.innerHTML = '';

        // Rebuild stateful views each time (forms need fresh state)
        if (_state === State.AWAITING_2FA || _state === State.AUTHENTICATED) {
            _views[_state] = _buildView(_state);
        }

        if (!_views[_state]) {
            _views[_state] = _buildView(_state);
        }

        instance.view.appendChild(_views[_state]);
    }


    function _buildView(state) {

        const container = document.createElement('div');
        container.className = state;

        if (state === State.IDLE)           { return _buildIdleView(container); }
        if (state === State.LOGIN_FORM)     { return _buildLoginFormView(container); }
        if (state === State.AWAITING_2FA)   { return _buildAwaiting2FAView(container); }
        if (state === State.REGISTER_FORM)  { return _buildRegisterFormView(container); }
        if (state === State.REGISTER_2FA)   { return _buildRegister2FAView(container); }
        if (state === State.AUTHENTICATED)  { return _buildAuthenticatedView(container); }

        return container;
    }


    function _post(endpoint, body) {

        return fetch(apiUrl + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(function(response) {
            return response.json().then(function(data) {
                return { ok: response.ok, data: data };
            });
        });
    }


    // --- Views ---

    function _buildIdleView(container) {

        const loginLink = document.createElement('button');
        loginLink.className = 'link';
        loginLink.textContent = 'Login';
        loginLink.addEventListener('click', function() {
            _setState(State.LOGIN_FORM);
        });

        const registerLink = document.createElement('button');
        registerLink.className = 'link';
        registerLink.textContent = 'Register';
        registerLink.addEventListener('click', function() {
            _setState(State.REGISTER_FORM);
        });

        container.appendChild(loginLink);
        container.appendChild(registerLink);

        return container;
    }


    function _buildLoginFormView(container) {

        const title = document.createElement('h4');
        title.textContent = 'Login';

        const emailInput = Input({
            label: 'Email',
            type: Input.Type.EMAIL,
            placeholder: 'demo@alkimia.io',
            localisationService: localisationService,
            validators: [
                {
                    on: 'focusout',
                    validate: function(value) {
                        this.clearIssues();
                        if (value.length === 0) {
                            this.markInvalid();
                            this.showIssue({ type: Input.IssueType.ERROR, message: 'Required' });
                        } else {
                            this.markValid();
                        }
                    }
                }
            ]
        });

        const passwordInput = Input({
            label: 'Password',
            type: Input.Type.PASSWORD,
            placeholder: 'demo1234',
            passwordIcons: { visible: iconService.getIcon("eye-opened"), hidden: iconService.getIcon("eye-closed") },
            localisationService: localisationService,
            validators: [
                {
                    on: 'focusout',
                    validate: function(value) {
                        this.clearIssues();
                        if (value.length === 0) {
                            this.markInvalid();
                            this.showIssue({ type: Input.IssueType.ERROR, message: 'Required' });
                        } else {
                            this.markValid();
                        }
                    }
                }
            ]
        });

        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error';
        errorMessage.hidden = true;

        const submitButton = document.createElement('button');
        submitButton.className = 'submit';
        submitButton.textContent = 'Sign in';
        submitButton.addEventListener('click', function() {

            errorMessage.hidden = true;

            const email = emailInput.getValue();
            const password = passwordInput.getValue();

            if (!email || !password) {
                errorMessage.textContent = 'Please fill in all fields';
                errorMessage.hidden = false;
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Signing in...';

            _post('/api/auth/login', { email: email, password: password })
                .then(function(result) {

                    submitButton.disabled = false;
                    submitButton.textContent = 'Sign in';

                    if (!result.ok) {
                        errorMessage.textContent = result.data.error || 'Login failed';
                        errorMessage.hidden = false;
                        return;
                    }

                    _pendingToken = result.data.token;
                    _pendingEmail = email;

                    if (result.data.requires2FA) {
                        _setState(State.AWAITING_2FA);
                    } else {
                        _user = result.data.user;
                        _token = result.data.token;
                        _pendingToken = null;
                        _setState(State.AUTHENTICATED);
                    }
                });
        });

        const backLink = document.createElement('button');
        backLink.className = 'back-link';
        backLink.textContent = '← Back';
        backLink.addEventListener('click', function() {
            _setState(State.IDLE);
        });

        container.appendChild(title);
        emailInput.appendTo(container);
        passwordInput.appendTo(container);
        container.appendChild(errorMessage);
        container.appendChild(submitButton);
        container.appendChild(backLink);

        return container;
    }


    function _buildAwaiting2FAView(container) {

        const title = document.createElement('h4');
        title.textContent = 'Two-Factor Authentication';

        const instruction = document.createElement('p');
        instruction.className = 'instruction';
        instruction.textContent = 'Enter the 6-digit code from your authenticator app.';

        const codeInput = Input({
            label: 'Code',
            type: Input.Type.TEXT,
            placeholder: '123456',
            localisationService: localisationService
        });

        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error';
        errorMessage.hidden = true;

        const submitButton = document.createElement('button');
        submitButton.className = 'submit';
        submitButton.textContent = 'Verify';
        submitButton.addEventListener('click', function() {

            errorMessage.hidden = true;

            const code = codeInput.getValue();

            if (!code) {
                errorMessage.textContent = 'Please enter the code';
                errorMessage.hidden = false;
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Verifying...';

            _post('/api/auth/verify-2fa', { code: code, token: _pendingToken, email: _pendingEmail })
                .then(function(result) {

                    submitButton.disabled = false;
                    submitButton.textContent = 'Verify';

                    if (!result.ok) {
                        errorMessage.textContent = result.data.error || 'Verification failed';
                        errorMessage.hidden = false;
                        return;
                    }

                    _user = result.data.user;
                    _token = result.data.token;
                    _pendingToken = null;
                    _pendingEmail = null;
                    _setState(State.AUTHENTICATED);
                });
        });

        const backLink = document.createElement('button');
        backLink.className = 'back-link';
        backLink.textContent = '← Back to login';
        backLink.addEventListener('click', function() {
            _pendingToken = null;
            _setState(State.LOGIN_FORM);
        });

        container.appendChild(title);
        container.appendChild(instruction);
        codeInput.appendTo(container);
        container.appendChild(errorMessage);
        container.appendChild(submitButton);
        container.appendChild(backLink);

        return container;
    }


    function _buildRegisterFormView(container) {

        const title = document.createElement('h4');
        title.textContent = 'Register';

        const emailInput = Input({
            label: 'Email',
            type: Input.Type.EMAIL,
            placeholder: 'you@example.com',
            localisationService: localisationService,
            validators: [
                {
                    on: 'focusout',
                    validate: function(value) {
                        this.clearIssues();
                        if (value.length === 0) {
                            this.markInvalid();
                            this.showIssue({ type: Input.IssueType.ERROR, message: 'Required' });
                        } else {
                            this.markValid();
                        }
                    }
                }
            ]
        });

        const passwordInput = Input({
            label: 'Password',
            type: Input.Type.PASSWORD,
            placeholder: 'Choose a password',
            passwordIcons: { visible: iconService.getIcon("eye-opened"), hidden: iconService.getIcon("eye-closed") },
            localisationService: localisationService,
            validators: [
                {
                    on: 'keyup',
                    validate: function(value) {
                        this.clearIssues();
                        if (value.length > 0 && value.length < 6) {
                            this.markInvalid();
                            this.showIssue({ type: Input.IssueType.WARNING, message: 'Minimum 6 characters' });
                        } else if (value.length >= 6) {
                            this.markValid();
                        }
                    }
                }
            ]
        });

        const confirmInput = Input({
            label: 'Confirm password',
            type: Input.Type.PASSWORD,
            placeholder: 'Repeat password',
            passwordIcons: { visible: iconService.getIcon("eye-opened"), hidden: iconService.getIcon("eye-closed") },
            localisationService: localisationService,
            validators: [
                {
                    on: 'keyup',
                    validate: function(value) {
                        this.clearIssues();
                        if (value.length === 0) { return; }
                        if (value !== passwordInput.getValue()) {
                            this.markInvalid();
                            this.showIssue({ type: Input.IssueType.ERROR, message: 'Passwords do not match' });
                        } else {
                            this.markValid();
                            this.showIssue({ type: Input.IssueType.FEEDBACK, message: 'Passwords match' });
                        }
                    }
                }
            ]
        });

        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error';
        errorMessage.hidden = true;

        const submitButton = document.createElement('button');
        submitButton.className = 'submit';
        submitButton.textContent = 'Create account';
        submitButton.addEventListener('click', function() {

            errorMessage.hidden = true;

            const email = emailInput.getValue();
            const password = passwordInput.getValue();
            const confirm = confirmInput.getValue();

            if (!email || !password || !confirm) {
                errorMessage.textContent = 'Please fill in all fields';
                errorMessage.hidden = false;
                return;
            }

            if (password !== confirm) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.hidden = false;
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Creating account...';

            _post('/api/auth/register', { email: email, password: password })
                .then(function(result) {

                    submitButton.disabled = false;
                    submitButton.textContent = 'Create account';

                    if (!result.ok) {
                        errorMessage.textContent = result.data.error || 'Registration failed';
                        errorMessage.hidden = false;
                        return;
                    }

                    _pendingToken = result.data.token;
                    _pendingEmail = email;
                    _user = result.data.user;

                    if (result.data.setup2FA) {
                        _pending2FAUri = result.data.totpUri;
                        _pending2FASecret = result.data.totpSecret;
                        _pending2FAQrCode = result.data.qrCode;
                        _setState(State.REGISTER_2FA);
                    } else {
                        _token = result.data.token;
                        _pendingToken = null;
                        _setState(State.AUTHENTICATED);
                    }
                });
        });

        const backLink = document.createElement('button');
        backLink.className = 'back-link';
        backLink.textContent = '← Back';
        backLink.addEventListener('click', function() {
            _setState(State.IDLE);
        });

        container.appendChild(title);
        emailInput.appendTo(container);
        passwordInput.appendTo(container);
        confirmInput.appendTo(container);
        container.appendChild(errorMessage);
        container.appendChild(submitButton);
        container.appendChild(backLink);

        return container;
    }


    function _buildRegister2FAView(container) {

        const title = document.createElement('h4');
        title.textContent = 'Set up Two-Factor Authentication';

        const instruction = document.createElement('p');
        instruction.className = 'instruction';
        instruction.textContent = 'Scan this QR code with your authenticator app, then enter the code below.';

        const secretDisplay = document.createElement('div');
        secretDisplay.className = 'totp-secret';
        secretDisplay.textContent = 'Manual entry: ' + (_pending2FASecret || '');

        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-code';
        if (_pending2FAQrCode) {
            qrContainer.innerHTML = _pending2FAQrCode;
        }

        const codeInput = Input({
            label: 'Verification code',
            type: Input.Type.TEXT,
            placeholder: '123456',
            localisationService: localisationService
        });

        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error';
        errorMessage.hidden = true;

        const submitButton = document.createElement('button');
        submitButton.className = 'submit';
        submitButton.textContent = 'Verify and complete';
        submitButton.addEventListener('click', function() {

            errorMessage.hidden = true;

            const code = codeInput.getValue();

            if (!code) {
                errorMessage.textContent = 'Please enter the code';
                errorMessage.hidden = false;
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Verifying...';

            _post('/api/auth/verify-2fa', { code: code, token: _pendingToken, email: _pendingEmail })
                .then(function(result) {

                    submitButton.disabled = false;
                    submitButton.textContent = 'Verify and complete';

                    if (!result.ok) {
                        errorMessage.textContent = result.data.error || 'Verification failed';
                        errorMessage.hidden = false;
                        return;
                    }

                    _user = result.data.user;
                    _token = result.data.token;
                    _pendingToken = null;
                    _pendingEmail = null;
                    _pending2FAUri = null;
                    _pending2FASecret = null;
                    _setState(State.AUTHENTICATED);
                });
        });

        container.appendChild(title);
        container.appendChild(instruction);
        container.appendChild(qrContainer);
        container.appendChild(secretDisplay);
        codeInput.appendTo(container);
        container.appendChild(errorMessage);
        container.appendChild(submitButton);

        return container;
    }


    function _buildAuthenticatedView(container) {

        const info = document.createElement('span');
        info.className = 'user-info';
        info.textContent = _user ? _user.name || _user.email : 'User';

        const logoutButton = document.createElement('button');
        logoutButton.className = 'link';
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', function() {
            instance.logout();
        });

        container.appendChild(info);
        container.appendChild(logoutButton);

        return container;
    }


    // --- Public API ---

    instance.getState = function() {
        return _state;
    };

    instance.getUser = function() {
        return _user;
    };

    instance.getToken = function() {
        return _token;
    };

    instance.isAuthenticated = function() {
        return _state === State.AUTHENTICATED;
    };

    instance.onStateChange = function(callback) {
        _listeners.push(callback);
    };

    instance.setUser = function(user, token) {
        _user = user;
        _token = token;
        _setState(State.AUTHENTICATED);
    };

    instance.logout = function() {
        _user = null;
        _token = null;
        _pendingToken = null;
        _pendingEmail = null;
        _pending2FAUri = null;
        _pending2FASecret = null;
        _pending2FAQrCode = null;
        _views = {};
        _setState(State.IDLE);
    };

    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}

AuthenticationService.State = State;
