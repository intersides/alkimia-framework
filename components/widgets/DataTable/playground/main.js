import addThemeToggle from '../../../../lib/playground/themeToggle.js';
import DataTable from '../DataTable.js';
import Notifier from '../../Notifier/Notifier.js';

const container = document.getElementById('table');
const output = document.getElementById('output');

const notifier = Notifier({
    position: Notifier.Position.TOP_RIGHT,
    animation: Notifier.Animation.SLIDE,
    autoDismiss: 0
});
notifier.appendTo(document.body);

const API = '/api/users';

function rpc(action, body) {

    return fetch(API + '/' + action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(function(res) {
        if (!res.ok) { throw new Error(res.status + ' ' + res.statusText); }
        return res.json();
    });
}

rpc('list', { page: 0, size: 1000 }).then(function(result) {

    const table = DataTable({
        columns: [
            { key: 'id',     label: '#',      sortable: true,  editable: false },
            { key: 'name',   label: 'Name',   sortable: true },
            { key: 'email',  label: 'Email',  sortable: true },
            { key: 'role',   label: 'Role',   sortable: true },
            { key: 'status', label: 'Status', sortable: true, options: ['Active', 'Inactive', 'Pending', 'Suspended'] }
        ],
        data: result.rows,
        pageSize: 200,
        mode: DataTable.Mode.PAGINATED,
        onSave: function(updated, done) {
            output.textContent += 'Saving #' + updated.id + '...\n';
            rpc('update', updated).then(function(savedRow) {
                output.textContent += 'Saved #' + savedRow.id + ': ' + savedRow.name + '\n';
                done(savedRow);
            });
        },
        onDelete: function(row, done) {
            output.textContent += 'Deleting #' + row.id + '...\n';
            rpc('delete', { id: row.id }).then(function() {
                output.textContent += 'Deleted #' + row.id + '\n';
                done();
            });
        }
    });

    table.appendTo(container);

    table.onRowSelect(function(row) {
        output.textContent += 'Selected: #' + row.id + ' ' + row.name + '\n';
    });

}).catch(function() {
    notifier.notify({
        message: 'Cannot reach the mock server. Start it with: cd mock-server && docker compose up --build',
        level: Notifier.Level.CRITICAL,
        dismiss: true
    });
});

addThemeToggle();
