/**
 * transfer(from, to)
 *
 * Deep-merges properties from `from` into `to`,
 * but only for keys that already exist in `to`.
 *
 * - Unknown keys in `from` are ignored
 * - Nested objects are merged recursively
 * - Arrays from `from` replace arrays in `to` entirely
 * - Null or non-object `from` returns `to` unchanged
 *
 * This is Alkimia's dependency injection and parameter defaulting.
 *
 * @param {Object} from - source values
 * @param {Object} to - target with defaults
 * @return {Object} the mutated `to` object
 */
export function transfer(from, to) {

    if (typeof from !== 'object' || from === null || from === undefined) {
        return to;
    }

    if (Array.isArray(from)) {
        return from;
    }

    const keys = Object.keys(from);

    for (let i = 0; i < keys.length; i++) {

        const key = keys[i];

        if (to.hasOwnProperty(key)) {

            const toValue = to[key];
            const fromValue = from[key];

            const toIsObject = typeof toValue === 'object'
                && toValue !== null
                && !Array.isArray(toValue);

            const fromIsObject = typeof fromValue === 'object'
                && fromValue !== null
                && !Array.isArray(fromValue);

            if (toIsObject && fromIsObject) {
                to[key] = transfer(fromValue, toValue);
            }
            else {
                to[key] = fromValue;
            }
        }
    }

    return to;
}
