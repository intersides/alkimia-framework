import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = process.env.LOCALES_DIR || path.join(__dirname, '..', '..', 'locales');


export function handleLocales(req, res, pathname, json) {

    if (req.method !== 'GET') {
        return json(res, 405, { error: 'GET only' });
    }

    // GET /api/locales — list available languages
    if (pathname === '/api/locales') {

        try {
            const files = fs.readdirSync(localesDir)
                .filter(function(f) { return f.endsWith('.json'); })
                .map(function(f) { return f.replace('.json', ''); });

            return json(res, 200, { languages: files });
        }
        catch (e) {
            return json(res, 500, { error: 'cannot read locales directory' });
        }
    }

    // GET /api/locales/fr — get a specific language
    const langMatch = pathname.match(/^\/api\/locales\/(\w+)$/);

    if (langMatch) {

        const langId = langMatch[1];
        const filePath = path.join(localesDir, langId + '.json');

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            return json(res, 200, content);
        }
        catch (e) {
            return json(res, 404, { error: 'language not found: ' + langId });
        }
    }

    return json(res, 404, { error: 'locales endpoint not found' });
}
