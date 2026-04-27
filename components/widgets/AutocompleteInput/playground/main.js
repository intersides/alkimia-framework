import AutocompleteInput from '../AutocompleteInput.js';
import IconService from '../../../services/IconService/IconService.js';
import addThemeToggle from '../../../../lib/playground/themeToggle.js';

const $log = document.getElementById('log');
const iconService = IconService({ skin: 'default' });

const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
    'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China', 'Colombia',
    'Croatia', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Estonia',
    'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'India',
    'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Latvia',
    'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands',
    'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines',
    'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia',
    'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea',
    'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine',
    'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
    'Venezuela', 'Vietnam'
];

const autocomplete = AutocompleteInput({
    label: 'Country',
    items: countries,
    maxVisible: 6,
    placeholder: 'Start typing a country name...',
    clearIcon: iconService.getIcon('close-circle', 'icon-small')
});

autocomplete.appendTo(document.getElementById('mount'));

autocomplete.onSelect(function(value) {
    $log.textContent += 'Selected: ' + value + '\n';
});

addThemeToggle();
