import Menu from '../Menu.js';
import addThemeToggle from '../../../../lib/playground/themeToggle.js';

const $log = document.getElementById('log');

const menu = Menu({
    label: 'Options',
    items: [
        { key: 'account', label: 'Account', items: [
            { key: 'profile',  label: 'Profile' },
            { key: 'settings', label: 'Settings' },
            { key: 'billing',  label: 'Billing' }
        ]},
        { key: 'data', label: 'Data', items: [
            { key: 'import', label: 'Import', items: [
                { key: 'import-csv',  label: 'From CSV' },
                { key: 'import-json', label: 'From JSON' },
                { key: 'import-api',  label: 'From API' }
            ]},
            { key: 'export', label: 'Export', items: [
                { key: 'export-pdf', label: 'As PDF' },
                { key: 'export-csv', label: 'As CSV' }
            ]}
        ]},
        { key: 'notifications', label: 'Notifications', expandable: true, items: [
            { key: 'notif-info',     label: 'Info',     className: 'menu-info' },
            { key: 'notif-warnings', label: 'Warnings', className: 'menu-warning' },
            { key: 'notif-errors',   label: 'Errors',   className: 'menu-critical' }
        ]},
        { key: 'logout', label: 'Logout' }
    ]
});

menu.onSelect(function(key, item) {
    $log.textContent += 'Selected: ' + key + ' (' + item.label + ')\n';
});

menu.appendTo(document.getElementById('mount'));

addThemeToggle();
