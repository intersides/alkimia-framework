import StorageService from '../StorageService.js';

const output = document.getElementById('output');
const controls = document.getElementById('controls');

const storage = StorageService({ namespace: 'playground' });

function log(msg) {
    output.textContent += msg + '\n';
}

// Set a value
storage.set('username', 'demo-user');
log('set username = "demo-user"');

// Get it back
log('get username = ' + JSON.stringify(storage.get('username')));

// Set with persistence
storage.set('theme', 'dark', true);
log('set theme = "dark" (persisted)');

// Remove
storage.remove('username');
log('removed username');
log('get username = ' + JSON.stringify(storage.get('username')));

// Persisted value survives
log('get theme = ' + JSON.stringify(storage.get('theme')));
