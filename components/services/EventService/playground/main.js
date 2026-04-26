import addThemeToggle from '../../../../lib/playground/themeToggle.js';
import EventService from '../EventService.js';
import Notifier from '../../../widgets/Notifier/Notifier.js';
import Input from '../../../widgets/Input/Input.js';

const eventService = EventService();
const $log = document.getElementById('log');

const notifier = Notifier({
    position: Notifier.Position.TOP_RIGHT,
    animation: Notifier.Animation.SLIDE,
    autoDismiss: 3000
});
notifier.appendTo(document.body);

function log(message) {
    $log.textContent += message + '\n';
    $log.scrollTop = $log.scrollHeight;
}

const users = {
    'admin@alkimia.io':  { name: 'Marco', email: 'admin@alkimia.io', role: 'admin', token: 'tok_a8f3e1' },
    'viewer@alkimia.io': { name: 'Clara', email: 'viewer@alkimia.io', role: 'viewer', token: 'tok_b2c7d4' }
};


// --- Login Panel (Publisher) ---

function LoginPanel(container) {

    const title = document.createElement('h4');
    title.textContent = 'Login';
    container.appendChild(title);

    const emailInput = Input({
        label: 'Email',
        type: Input.Type.EMAIL,
        placeholder: 'admin@alkimia.io'
    });
    emailInput.setValue('admin@alkimia.io');
    emailInput.appendTo(container);

    const passwordInput = Input({
        label: 'Password',
        type: Input.Type.PASSWORD,
        placeholder: 'password'
    });
    passwordInput.setValue('demo');
    passwordInput.appendTo(container);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const $login = document.createElement('button');
    $login.className = 'btn';
    $login.textContent = 'Login';

    const $logout = document.createElement('button');
    $logout.className = 'btn';
    $logout.textContent = 'Logout';
    $logout.disabled = true;

    actions.appendChild($login);
    actions.appendChild($logout);
    container.appendChild(actions);

    $login.addEventListener('click', function() {

        const user = users[emailInput.getValue()];

        if (!user) {
            log('→ emit auth:failed');
            eventService.emit('auth:failed', { email: emailInput.getValue() });
            return;
        }

        log('→ emit auth:login { name: "' + user.name + '", role: "' + user.role + '" }');
        eventService.emit('auth:login', user);
        $login.disabled = true;
        $logout.disabled = false;
    });

    $logout.addEventListener('click', function() {
        log('→ emit auth:logout');
        eventService.emit('auth:logout');
        $login.disabled = false;
        $logout.disabled = true;
    });
}


// --- Header Panel (Subscriber) ---

function HeaderPanel(container) {

    container.innerHTML = `
        <h4>Header</h4>
        <p class="status">Not logged in</p>
        <span class="role-badge" hidden></span>
    `;

    const $status = container.querySelector('.status');
    const $badge = container.querySelector('.role-badge');

    eventService.on('auth:login', function(user) {
        log('  ← [Header] received auth:login');
        $status.textContent = 'Welcome, ' + user.name;
        $badge.textContent = user.role;
        $badge.hidden = false;
        notifier.notify({ message: 'Header updated: ' + user.name, level: Notifier.Level.INFO });
    });

    eventService.on('auth:logout', function() {
        log('  ← [Header] received auth:logout');
        $status.textContent = 'Not logged in';
        $badge.hidden = true;
        notifier.notify({ message: 'Header reset', level: Notifier.Level.WARNING });
    });

    eventService.on('auth:failed', function() {
        log('  ← [Header] received auth:failed');
        notifier.notify({ message: 'Login failed — unknown user', level: Notifier.Level.CRITICAL });
    });
}


// --- Sidebar Panel (Subscriber) ---

function SidebarPanel(container) {

    container.innerHTML = `
        <h4>Sidebar</h4>
        <ul class="nav">
            <li>Dashboard</li>
            <li>Settings</li>
            <li class="admin-link" hidden>Users (admin)</li>
            <li class="admin-link" hidden>Audit Log (admin)</li>
        </ul>
    `;

    const $adminLinks = container.querySelectorAll('.admin-link');

    eventService.on('auth:login', function(user) {
        log('  ← [Sidebar] received auth:login');
        const isAdmin = user.role === 'admin';

        for (let i = 0; i < $adminLinks.length; i++) {
            $adminLinks[i].hidden = !isAdmin;
        }

        notifier.notify({
            message: 'Sidebar: ' + (isAdmin ? 'admin links visible' : 'standard access'),
            level: Notifier.Level.INFO
        });
    });

    eventService.on('auth:logout', function() {
        log('  ← [Sidebar] received auth:logout');
        for (let i = 0; i < $adminLinks.length; i++) {
            $adminLinks[i].hidden = true;
        }
    });
}


// --- API Console Panel (Subscriber) ---

function ApiPanel(container) {

    container.innerHTML = `
        <h4>API Console</h4>
        <p class="token">Token: <code>none</code></p>
        <p class="request"></p>
    `;

    const $token = container.querySelector('.token code');
    const $request = container.querySelector('.request');

    eventService.on('auth:login', function(user) {
        log('  ← [API] received auth:login');
        $token.textContent = user.token;
        $request.textContent = '> GET /api/profile → 200 OK';
        notifier.notify({ message: 'API: token attached, request sent', level: Notifier.Level.INFO });
    });

    eventService.on('auth:logout', function() {
        log('  ← [API] received auth:logout');
        $token.textContent = 'none';
        $request.textContent = '> GET /api/profile → 401 Unauthorized';
    });
}


// --- Wire (they only share eventService) ---

LoginPanel(document.getElementById('login'));
HeaderPanel(document.getElementById('header'));
SidebarPanel(document.getElementById('sidebar'));
ApiPanel(document.getElementById('api'));
addThemeToggle();
