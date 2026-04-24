import Router from '../Router.js';

const navContainer = document.getElementById('nav-container');
const content = document.getElementById('content');

const router = Router({
    routes: [
        { type: 'link', entry: { label: 'Home',    path: '/' } },
        { type: 'link', entry: { label: 'About',   path: '/about' } },
        { type: 'link', entry: { label: 'Contact', path: '/contact' } }
    ]
});

navContainer.appendChild(router.view);

router.onRoute(function(path, route, hash) {

    content.innerHTML = `
        <div class="page">
            <h2>${route.label}</h2>
            <p>Path: ${path}</p>
            <p>Hash: ${hash || 'none'}</p>
        </div>
    `;
});

router.navigateTo(window.location.pathname, false);
