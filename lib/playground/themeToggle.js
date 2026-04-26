/**
 * Adds a theme toggle button to the page.
 * Flips data-mode between 'dark' and 'light' on <html>.
 */
export default function addThemeToggle() {

    const btn = document.createElement('button');
    btn.textContent = '☀';
    btn.className = 'theme-toggle-btn';
    btn.title = 'Toggle theme';

    btn.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-mode');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-mode', next);
        btn.textContent = next === 'dark' ? '☀' : '☾';
    });

    document.body.insertBefore(btn, document.body.firstChild);
}
