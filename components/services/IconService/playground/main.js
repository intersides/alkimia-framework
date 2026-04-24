import IconService from '../IconService.js';

const container = document.getElementById('icons');
const iconService = IconService({ skin: 'default' });

const icons = ['eye', 'eyeSlash', 'logout', 'check', 'person', 'emergency'];

for (let i = 0; i < icons.length; i++) {

    const row = document.createElement('div');
    row.className = 'icon-row';

    const icon = iconService.getIcon(icons[i]);
    const label = document.createElement('span');
    label.textContent = icons[i];

    row.appendChild(icon);
    row.appendChild(label);
    container.appendChild(row);
}
