import addThemeToggle from '../../../../lib/playground/themeToggle.js';
import Notifier from '../Notifier.js';

const messages = {
    info:     ['User saved successfully', 'Settings updated', 'File uploaded', 'Session refreshed'],
    warning:  ['Disk space running low', 'Token expires in 5 minutes', 'Unsaved changes detected'],
    critical: ['Connection lost', 'Authentication failed', 'Server error — retry later']
};

let notifier = null;

function createNotifier() {

    if (notifier) {
        notifier.view.remove();
    }

    const pos = document.getElementById('position').value;
    const anim = document.getElementById('animation').value;

    notifier = Notifier({
        position: pos,
        animation: anim,
        autoDismiss: 4000
    });

    notifier.appendTo(document.body);
}

createNotifier();

document.getElementById('position').addEventListener('change', createNotifier);
document.getElementById('animation').addEventListener('change', createNotifier);

document.getElementById('fire').addEventListener('click', function() {

    const level = document.getElementById('level').value;
    const pool = messages[level];
    const message = pool[Math.floor(Math.random() * pool.length)];

    notifier.notify({
        message: message,
        level: level,
        dismiss: true
    });
});

document.getElementById('clear').addEventListener('click', function() {
    notifier.clear();
});
addThemeToggle();
