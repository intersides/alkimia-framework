import { transfer } from '../../../lib/utilities/index.js';

/**
 * StorageService
 *
 * Namespaced wrapper over sessionStorage and localStorage.
 * Provides get/set with optional persistence flag.
 *
 * Dependencies: transfer
 */
export default function StorageService(_params) {

    const instance = Object.create(StorageService.prototype);

    const { namespace } = transfer(_params, {
        namespace: 'alkimia'
    });


    function _key(name) {
        return namespace + ':' + name;
    }


    instance.get = function(name) {

        const key = _key(name);

        let value = sessionStorage.getItem(key);

        if (value === null) {
            value = localStorage.getItem(key);
        }

        if (value === null) {
            return null;
        }

        try {
            return JSON.parse(value);
        }
        catch (e) {
            return value;
        }
    };


    instance.set = function(name, value, persist) {

        const key = _key(name);
        const serialized = JSON.stringify(value);

        sessionStorage.setItem(key, serialized);

        if (persist) {
            localStorage.setItem(key, serialized);
        }
    };


    instance.remove = function(name) {

        const key = _key(name);

        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    };


    return instance;
}
