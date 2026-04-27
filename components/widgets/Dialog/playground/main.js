import Dialog from '../Dialog.js';
import IconService from '../../../services/IconService/IconService.js';
import addThemeToggle from '../../../../lib/playground/themeToggle.js';

const iconService = IconService({ skin: 'default' });

function makeDialog(size) {

    const closeIcon = iconService.getIcon('close-circle', 'icon-medium');
    const dialog = Dialog({ size: size, dismissOnBackdrop: true, closeIcon: closeIcon });
    dialog.appendTo(document.body);
    return dialog;
}

// Simple content dialogs
document.getElementById('open-small').addEventListener('click', function() {

    const dialog = makeDialog(Dialog.Size.SMALL);
    const content = document.createElement('div');
    content.innerHTML = '<h3>Small Dialog</h3><p>A compact confirmation or message.</p>';
    dialog.open(content);
});

document.getElementById('open-medium').addEventListener('click', function() {

    const dialog = makeDialog(Dialog.Size.MEDIUM);
    const content = document.createElement('div');
    content.innerHTML = '<h3>Medium Dialog</h3><p>The default size. Good for forms, details, or short content.</p>';
    dialog.open(content);
});

document.getElementById('open-large').addEventListener('click', function() {

    const dialog = makeDialog(Dialog.Size.LARGE);
    const content = document.createElement('div');
    content.innerHTML = '<h3>Large Dialog</h3><p>For complex content — tables, multi-step forms, previews.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>';
    dialog.open(content);
});

document.getElementById('open-full').addEventListener('click', function() {

    const dialog = makeDialog(Dialog.Size.FULL);
    const content = document.createElement('div');
    content.innerHTML = '<h3>Full Dialog</h3><p>Nearly full screen. For immersive content or editors.</p>';
    dialog.open(content);
});

// Form inside dialog
document.getElementById('open-form').addEventListener('click', function() {

    const dialog = makeDialog(Dialog.Size.MEDIUM);

    const form = document.createElement('div');
    form.innerHTML = `
        <h3>Edit User</h3>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px;">
            <label style="font-size:0.8rem;color:var(--text-muted);">Name
                <input type="text" value="Marco" style="display:block;width:100%;padding:6px 10px;margin-top:4px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:0.9rem;">
            </label>
            <label style="font-size:0.8rem;color:var(--text-muted);">Email
                <input type="email" value="marco@alkimia.io" style="display:block;width:100%;padding:6px 10px;margin-top:4px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:0.9rem;">
            </label>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
                <button id="cancel-btn" style="padding:6px 14px;border:1px solid var(--border);background:transparent;color:var(--text-muted);border-radius:4px;cursor:pointer;">Cancel</button>
                <button style="padding:6px 14px;border:none;background:var(--accent);color:#fff;border-radius:4px;cursor:pointer;">Save</button>
            </div>
        </div>
    `;

    dialog.open(form);

    form.querySelector('#cancel-btn').addEventListener('click', function() {
        dialog.close();
    });
});

addThemeToggle();
