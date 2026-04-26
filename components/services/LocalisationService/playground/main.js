import LocalisationService from '../LocalisationService.js';
import addThemeToggle from '../../../../lib/playground/themeToggle.js';

const output = document.getElementById('output');

const dictionaries = {
    en: {
        'greeting': 'Hello',
        'farewell': 'Goodbye',
        'welcome': 'Welcome to the playground'
    },
    fr: {
        'greeting': 'Bonjour',
        'farewell': 'Au revoir',
        'welcome': 'Bienvenue dans le playground'
    },
    ja: {
        'greeting': 'こんにちは',
        'farewell': 'さようなら',
        'welcome': 'プレイグラウンドへようこそ'
    }
};

const localisationService = LocalisationService({ defaultLang: 'en', dictionaries });

localisationService.appendTo(document.getElementById('selector-mount'));

localisationService.onChange(function(langId) {
    output.textContent += 'language changed: ' + langId + '\n';
});

addThemeToggle();
