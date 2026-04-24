import DataTable from '../DataTable.js';

const container = document.getElementById('table');
const output = document.getElementById('output');

const API = '/api/users';

function rpc(action, body) {

    return fetch(API + '/' + action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(function(res) { return res.json(); });
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
});
