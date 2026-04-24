import IconService from '../../../services/IconService/IconService.js';
import AuthenticationService from '../AuthenticationService.js';

const output = document.getElementById('output');

const iconService = IconService({ skin: 'default' });

const auth = AuthenticationService({
    iconService: iconService,
    apiUrl: 'https://alkimia-framework.localhost:3443'
});

auth.appendTo(document.getElementById('auth'));

auth.onStateChange(function(state, previousState) {
    output.textContent += previousState + ' → ' + state + '\n';
});
