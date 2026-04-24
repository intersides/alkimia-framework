import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'components.json');


export function handleComponents(req, res, pathname, json) {

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    if (pathname === '/api/components') {
        return json(res, 200, data);
    }

    // /api/components/:name
    const name = pathname.replace('/api/components/', '');
    const component = data.find(function(c) { return c.name === name; });

    if (component) {
        return json(res, 200, component);
    }

    return json(res, 404, { error: 'component not found' });
}
