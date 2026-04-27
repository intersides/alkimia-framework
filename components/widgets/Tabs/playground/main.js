import Tabs from '../Tabs.js';
import addThemeToggle from '../../../../lib/playground/themeToggle.js';

const $log = document.getElementById('log');

const tabs = Tabs({
    tabs: [
        { key: 'overview', label: 'Overview' },
        { key: 'details',  label: 'Details' },
        { key: 'settings', label: 'Settings' }
    ]
});

tabs.setContent('overview', function() {
    const view = document.createElement('div');
    view.innerHTML = '<h4>Overview</h4><p>This content was created lazily on first click. Switch away and back. It persists.</p>';
    $log.textContent += 'Created: overview\n';
    return view;
});

tabs.setContent('details', function() {
    const view = document.createElement('div');
    const heading = document.createElement('h4');
    heading.textContent = 'Details';
    const p = document.createElement('p');
    p.textContent = 'Type something below. Switch tabs. Come back. It survives.';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'demo-input';
    input.placeholder = 'Type here...';
    view.appendChild(heading);
    view.appendChild(p);
    view.appendChild(input);
    $log.textContent += 'Created: details\n';
    return view;
});

tabs.setContent('settings', function() {
    const view = document.createElement('div');
    const heading = document.createElement('h4');
    heading.textContent = 'Settings';
    const label = document.createElement('label');
    label.className = 'demo-checkbox';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' Enable notifications'));
    view.appendChild(heading);
    view.appendChild(label);
    $log.textContent += 'Created: settings\n';
    return view;
});

tabs.appendTo(document.getElementById('tabs-mount'));
tabs.activate('overview');

tabs.onChange(function(key) {
    $log.textContent += 'Activated: ' + key + '\n';
});

addThemeToggle();
