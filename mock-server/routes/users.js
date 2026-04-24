const names = [
    'Alice Martin', 'Bob Chen', 'Clara Rossi', 'David Kim', 'Eva Schmidt',
    'Frank Dubois', 'Grace Tanaka', 'Hugo Ferreira', 'Iris Johansson', 'Jack Murphy',
    'Kira Novak', 'Leo Bianchi', 'Maya Patel', 'Noah Fischer', 'Olivia Santos',
    'Paul Moreau', "Quinn O'Brien", 'Rosa Hernandez', 'Sam Virtanen', 'Tina Larsson',
    'Uri Goldberg', 'Vera Kowalski', 'Will Thompson', 'Xena Papadopoulos', 'Yuki Sato'
];

const roles = ['Admin', 'Editor', 'Viewer', 'Moderator', 'Developer'];
const statuses = ['Active', 'Inactive', 'Pending', 'Suspended'];
const domains = ['alkimia.io', 'example.com', 'test.org', 'demo.net'];

let users = [];
let nextId = 1;

function _generate() {

    users = [];
    nextId = 1;

    for (let i = 0; i < 1000; i++) {

        const name = names[i % names.length];
        const firstName = name.split(' ')[0].toLowerCase();

        users.push({
            id: nextId++,
            name: name,
            email: firstName + i + '@' + domains[i % domains.length],
            role: roles[i % roles.length],
            status: statuses[i % statuses.length]
        });
    }
}

_generate();


export function handleUsers(req, res, pathname, url, body, json) {

    if (req.method !== 'POST') {
        return json(res, 405, { error: 'POST only' });
    }

    // POST /api/users/list
    if (pathname === '/api/users/list') {

        const page = body.page || 0;
        const size = body.size || 20;
        const filter = (body.filter || '').toLowerCase();
        const sort = body.sort || null;
        const dir = body.dir || 'asc';

        let result = users;

        if (filter) {
            result = result.filter(function(row) {
                return Object.values(row).some(function(val) {
                    return String(val).toLowerCase().indexOf(filter) !== -1;
                });
            });
        }

        if (sort) {
            const direction = dir === 'desc' ? -1 : 1;
            result = result.slice().sort(function(a, b) {
                const valA = a[sort];
                const valB = b[sort];
                if (valA === valB) { return 0; }
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return (valA - valB) * direction;
                }
                return String(valA).localeCompare(String(valB)) * direction;
            });
        }

        const total = result.length;
        const start = page * size;
        const rows = result.slice(start, start + size);

        return json(res, 200, { rows: rows, total: total, page: page, size: size });
    }

    // POST /api/users/create
    if (pathname === '/api/users/create') {

        if (!body || !body.name || !body.email) {
            return json(res, 400, { error: 'name and email required' });
        }

        const user = {
            id: nextId++,
            name: body.name,
            email: body.email,
            role: body.role || 'Viewer',
            status: body.status || 'Active'
        };

        users.push(user);
        return json(res, 201, user);
    }

    // POST /api/users/update
    if (pathname === '/api/users/update') {

        if (!body || !body.id) {
            return json(res, 400, { error: 'id required' });
        }

        const user = users.find(function(u) { return u.id === body.id; });

        if (!user) {
            return json(res, 404, { error: 'user not found' });
        }

        if (body.name !== undefined) { user.name = body.name; }
        if (body.email !== undefined) { user.email = body.email; }
        if (body.role !== undefined) { user.role = body.role; }
        if (body.status !== undefined) { user.status = body.status; }

        return json(res, 200, user);
    }

    // POST /api/users/delete
    if (pathname === '/api/users/delete') {

        if (!body || !body.id) {
            return json(res, 400, { error: 'id required' });
        }

        const index = users.findIndex(function(u) { return u.id === body.id; });

        if (index === -1) {
            return json(res, 404, { error: 'user not found' });
        }

        users.splice(index, 1);
        return json(res, 200, { deleted: body.id });
    }

    return json(res, 404, { error: 'users endpoint not found' });
}
