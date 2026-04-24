import LocalisationService from '../LocalisationService.js';

const output = document.getElementById('output');

const localisationService = LocalisationService({ defaultLang: 'en' });

localisationService.appendTo(document.getElementById('selector-mount'));

localisationService.onChange(function(langId) {
    output.textContent += `language changed: ${langId}\n`;
});
