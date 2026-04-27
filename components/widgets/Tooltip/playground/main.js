import Tooltip from '../Tooltip.js';
import IconService from '../../../services/IconService/IconService.js';
import Input from '../../../widgets/Input/Input.js';
import logoDark from '../../../../skins/default/logo-dark.svg?raw';
import logoLight from '../../../../skins/default/logo-light.svg?raw';
import addThemeToggle from '../../../../lib/playground/themeToggle.js';


// Large target — login panel as factory function
function LoginPanel() {

    const instance = {};

    instance.view = document.createElement('div');
    instance.view.className = 'demo-panel';

    const title = document.createElement('h4');
    title.textContent = 'Login';
    instance.view.appendChild(title);

    const emailInput = Input({
        label: 'Email',
        type: Input.Type.EMAIL,
        placeholder: 'you@example.com'
    });
    emailInput.appendTo(instance.view);

    const iconService = IconService({ skin: 'default' });
    const passwordInput = Input({
        label: 'Password',
        type: Input.Type.PASSWORD,
        placeholder: 'Enter password',
        passwordIcons: {
            visible: iconService.getIcon('eye-opened', 'icon-small'),
            hidden: iconService.getIcon('eye-closed', 'icon-small')
        }
    });
    passwordInput.appendTo(instance.view);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'demo-target';
    submitBtn.textContent = 'Sign in';
    instance.view.appendChild(submitBtn);

    instance.getPasswordInput = function() {
        return passwordInput;
    };

    return instance;
}


Tooltip.attach({
    target: document.getElementById('btn-top'),
    content: 'I appear to the top if possible',
    position: Tooltip.Position.TOP
});

Tooltip.attach({
    target: document.getElementById('btn-bottom'),
    content: 'I appear to the bottom if possible',
    position: Tooltip.Position.BOTTOM
});

Tooltip.attach({
    target: document.getElementById('btn-left'),
    content: 'I appear to the left if possible',
    position: Tooltip.Position.LEFT
});

Tooltip.attach({
    target: document.getElementById('btn-right'),
    content: 'I appear to the right if possible',
    position: Tooltip.Position.RIGHT
});

const richContent = document.createElement('div');
richContent.className = 'tooltip-rich';
const isDark = document.documentElement.getAttribute('data-mode') !== 'light';
richContent.innerHTML = '<div class="tooltip-logo">' + (isDark ? logoDark : logoLight) + '</div><p><strong>Alkimia</strong><br>The non-framework framework</p>';

Tooltip.attach({
    target: document.getElementById('btn-rich'),
    content: richContent,
    position: Tooltip.Position.BOTTOM,
    delay: 0
});

const loginPanel = LoginPanel();
document.getElementById('large-panel-mount').appendChild(loginPanel.view);

Tooltip.attach({
    target: loginPanel.view,
    content: 'I appear to the left if possible',
    position: Tooltip.Position.LEFT,
    delay: 200
});

Tooltip.attach({
    target: loginPanel.getPasswordInput().view,
    content: 'At least 8 characters, one uppercase letter, one number, and one special character (!@#$%)',
    position: Tooltip.Position.RIGHT,
    delay: 0
});

addThemeToggle();
