import { transfer } from '../../../lib/utilities/index.js';

/**
 * DataTable
 *
 * Sortable, filterable data table with paginated or infinite scroll modes.
 * Double-click a row to expand an inline editing drawer.
 *
 * Column config: { key, label, sortable, editable }
 * editable defaults to true. Set false for read-only fields (e.g. id).
 *
 * Dependencies: transfer
 */

DataTable.SortDirection = Object.freeze({
    ASC:  'asc',
    DESC: 'desc',
    NONE: 'none'
});

DataTable.Mode = Object.freeze({
    PAGINATED: 'paginated',
    INFINITE:  'infinite'
});


export default function DataTable(_params) {

    const instance = Object.create(DataTable.prototype);

    const { columns, data, pageSize, mode, localisationService, onSave, onDelete } = transfer(_params, {
        columns: [],
        data: [],
        pageSize: 10,
        mode: DataTable.Mode.PAGINATED,
        localisationService: null,
        onSave: null,
        onDelete: null
    });

    let _data = data.slice();
    let _filtered = _data;
    let _sortColumn = null;
    let _sortDirection = DataTable.SortDirection.NONE;
    let _currentPage = 0;
    let _visibleCount = 0;
    let _filterText = '';
    let _onRowSelect = null;
    let _onLoadMore = null;
    let _onSave = onSave;
    let _onDelete = onDelete;
    let _loading = false;
    let _expandedRows = new Set();

    let _vTable = null;
    let _vThead = null;
    let _vTbody = null;
    let _vFilter = null;
    let _vPagination = null;
    let _vInfo = null;
    let _vScrollContainer = null;


    function _init() {

        instance.view = document.createElement('div');
        instance.view.className = 'DataTable';
        instance.view.setAttribute('data-alkimia-widget', 'DataTable');

        _buildFilter();
        _buildTable();

        if (mode === DataTable.Mode.PAGINATED) {
            _buildPagination();
        }

        _applyFilter();

        return instance;
    }


    function _buildFilter() {

        _vFilter = document.createElement('input');
        _vFilter.type = 'text';
        _vFilter.className = 'filter';
        _vFilter.placeholder = 'Filter...';

        _vFilter.addEventListener('input', function() {
            _filterText = _vFilter.value.toLowerCase();
            _currentPage = 0;
            _visibleCount = 0;
            _applyFilter();
        });

        instance.view.appendChild(_vFilter);
    }


    function _buildTable() {

        _vTable = document.createElement('table');
        _vTable.className = 'table';

        _vThead = document.createElement('thead');
        _vTbody = document.createElement('tbody');

        const headerRow = document.createElement('tr');

        for (let i = 0; i < columns.length; i++) {

            const col = columns[i];
            const th = document.createElement('th');
            th.textContent = col.label;
            th.setAttribute('data-key', col.key);

            if (col.sortable !== false) {

                th.className = 'sortable';
                th.addEventListener('click', function() {
                    _toggleSort(col.key);
                });
            }

            headerRow.appendChild(th);
        }

        if (_onSave || _onDelete) {
            const actionsTh = document.createElement('th');
            actionsTh.textContent = 'Actions';
            headerRow.appendChild(actionsTh);
        }

        _vThead.appendChild(headerRow);
        _vTable.appendChild(_vThead);
        _vTable.appendChild(_vTbody);

        _vScrollContainer = document.createElement('div');
        _vScrollContainer.className = 'scroll-container';
        _vScrollContainer.appendChild(_vTable);

        if (mode === DataTable.Mode.INFINITE) {

            _vScrollContainer.addEventListener('scroll', function() {

                const el = _vScrollContainer;
                const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;

                if (atBottom && _visibleCount < _filtered.length) {
                    _appendNextBatch();
                }
                else if (atBottom && _onLoadMore && !_loading) {
                    _loading = true;
                    _onLoadMore();
                }
            });
        }

        instance.view.appendChild(_vScrollContainer);
    }


    function _buildPagination() {

        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';

        const prevButton = document.createElement('button');
        prevButton.className = 'page-button';
        prevButton.textContent = '←';
        prevButton.addEventListener('click', function() {
            if (_currentPage > 0) {
                _currentPage--;
                _renderPage();
            }
        });

        const nextButton = document.createElement('button');
        nextButton.className = 'page-button';
        nextButton.textContent = '→';
        nextButton.addEventListener('click', function() {
            const totalPages = Math.ceil(_filtered.length / pageSize);
            if (_currentPage < totalPages - 1) {
                _currentPage++;
                _renderPage();
            }
        });

        _vInfo = document.createElement('span');
        _vInfo.className = 'page-info';

        _vPagination = paginationContainer;
        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(_vInfo);
        paginationContainer.appendChild(nextButton);
        instance.view.appendChild(paginationContainer);
    }


    function _toggleSort(key) {

        if (_sortColumn === key) {
            _sortDirection = _sortDirection === DataTable.SortDirection.ASC
                ? DataTable.SortDirection.DESC
                : DataTable.SortDirection.ASC;
        } else {
            _sortColumn = key;
            _sortDirection = DataTable.SortDirection.ASC;
        }

        _applySort();

        if (mode === DataTable.Mode.INFINITE) {
            _visibleCount = 0;
            _vTbody.innerHTML = '';
            _appendNextBatch();
        } else {
            _renderPage();
        }

        _updateSortIndicators();
    }


    function _applyFilter() {

        if (_filterText === '') {
            _filtered = _data.slice();
        } else {
            _filtered = _data.filter(function(row) {
                for (let i = 0; i < columns.length; i++) {
                    const value = String(row[columns[i].key] || '').toLowerCase();
                    if (value.indexOf(_filterText) !== -1) {
                        return true;
                    }
                }
                return false;
            });
        }

        _applySort();

        if (mode === DataTable.Mode.INFINITE) {
            _visibleCount = 0;
            _vTbody.innerHTML = '';
            _appendNextBatch();
        } else {
            _renderPage();
        }
    }


    function _applySort() {

        if (!_sortColumn || _sortDirection === DataTable.SortDirection.NONE) {
            return;
        }

        const key = _sortColumn;
        const dir = _sortDirection === DataTable.SortDirection.ASC ? 1 : -1;

        _filtered.sort(function(a, b) {

            const valA = a[key];
            const valB = b[key];

            if (valA === valB) { return 0; }
            if (valA === null || valA === undefined) { return 1; }
            if (valB === null || valB === undefined) { return -1; }

            if (typeof valA === 'number' && typeof valB === 'number') {
                return (valA - valB) * dir;
            }

            return String(valA).localeCompare(String(valB)) * dir;
        });
    }


    function _updateSortIndicators() {

        const headers = _vThead.querySelectorAll('th');

        for (let i = 0; i < headers.length; i++) {

            const th = headers[i];
            th.classList.remove('sort-asc', 'sort-desc');

            if (th.getAttribute('data-key') === _sortColumn) {
                th.classList.add('sort-' + _sortDirection);
            }
        }
    }


    function _createRowPair(row, index) {

        // --- Data row ---

        const tr = document.createElement('tr');
        tr.className = 'data-row';

        const cells = {};

        for (let j = 0; j < columns.length; j++) {

            const td = document.createElement('td');
            const col = columns[j];

            if (col.render) {
                td.appendChild(col.render(row[col.key], row));
            } else {
                td.textContent = row[col.key] !== undefined ? row[col.key] : '';
            }

            cells[col.key] = td;
            tr.appendChild(td);
        }

        tr.addEventListener('click', function() {
            if (_onRowSelect) { _onRowSelect(row, index); }
        });

        // --- Actions cell ---

        if (_onSave || _onDelete) {

            const actionsTd = document.createElement('td');
            actionsTd.className = 'actions-cell';

            if (_onSave) {
                const editBtn = document.createElement('button');
                editBtn.className = 'action-button edit';
                editBtn.textContent = 'Edit';
                editBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const nowHidden = !drawerTr.hidden;
                    drawerTr.hidden = nowHidden;
                    tr.classList.toggle('expanded', !nowHidden);
                    if (!nowHidden) { _expandedRows.add(row.id); }
                    else { _expandedRows.delete(row.id); }
                });
                actionsTd.appendChild(editBtn);
            }

            if (_onDelete) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-button delete';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteBtn.disabled = true;
                    deleteBtn.textContent = '...';
                    _onDelete(row, function() {
                        var dataIdx = _data.indexOf(row);
                        if (dataIdx !== -1) { _data.splice(dataIdx, 1); }
                        var filtIdx = _filtered.indexOf(row);
                        if (filtIdx !== -1) { _filtered.splice(filtIdx, 1); }
                        var totalPages = Math.ceil(_filtered.length / pageSize) || 1;
                        if (_currentPage >= totalPages) {
                            _currentPage = Math.max(0, totalPages - 1);
                        }
                        var scrollTop = _vScrollContainer.scrollTop;
                        _renderPage();
                        _vScrollContainer.scrollTop = scrollTop;
                    });
                });
                actionsTd.appendChild(deleteBtn);
            }

            tr.appendChild(actionsTd);
        }

        // --- Drawer row ---

        const drawerTr = document.createElement('tr');
        drawerTr.className = 'drawer-row';

        const isExpanded = _expandedRows.has(row.id);
        drawerTr.hidden = !isExpanded;
        if (isExpanded) { tr.classList.add('expanded'); }

        const drawerTd = document.createElement('td');
        const colSpan = (_onSave || _onDelete) ? columns.length + 1 : columns.length;
        drawerTd.setAttribute('colspan', colSpan);

        const drawerContent = document.createElement('div');
        drawerContent.className = 'drawer';

        const inputs = {};

        for (let j = 0; j < columns.length; j++) {

            const col = columns[j];
            const editable = col.editable !== false;

            const field = document.createElement('div');
            field.className = 'drawer-field';

            const label = document.createElement('label');
            label.textContent = col.label;

            let control;

            if (col.options && editable) {
                control = document.createElement('select');
                for (let k = 0; k < col.options.length; k++) {
                    const opt = document.createElement('option');
                    opt.value = col.options[k];
                    opt.textContent = col.options[k];
                    control.appendChild(opt);
                }
                control.value = row[col.key] || '';
            } else {
                control = document.createElement('input');
                control.type = 'text';
                control.value = row[col.key] !== undefined ? row[col.key] : '';
                control.disabled = !editable;
            }

            inputs[col.key] = control;

            field.appendChild(label);
            field.appendChild(control);
            drawerContent.appendChild(field);
        }

        const actions = document.createElement('div');
        actions.className = 'drawer-actions';

        const resetButton = document.createElement('button');
        resetButton.className = 'drawer-button reset';
        resetButton.textContent = 'Reset';
        resetButton.addEventListener('click', function() {
            for (let j = 0; j < columns.length; j++) {
                const col = columns[j];
                inputs[col.key].value = row[col.key] !== undefined ? row[col.key] : '';
            }
        });

        const saveButton = document.createElement('button');
        saveButton.className = 'drawer-button save';
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', function() {

            const updated = {};

            for (let j = 0; j < columns.length; j++) {

                const col = columns[j];

                if (col.editable !== false) {
                    updated[col.key] = inputs[col.key].value;
                }
            }

            updated.id = row.id;

            if (_onSave) {

                saveButton.disabled = true;
                saveButton.textContent = 'Saving...';

                _onSave(updated, function(savedRow) {

                    saveButton.disabled = false;
                    saveButton.textContent = 'Save';

                    // Update the data object
                    for (const key in savedRow) {
                        row[key] = savedRow[key];
                    }

                    // Update the display row cells
                    for (let j = 0; j < columns.length; j++) {

                        const col = columns[j];

                        if (cells[col.key]) {
                            cells[col.key].textContent = row[col.key] !== undefined ? row[col.key] : '';
                        }

                        inputs[col.key].value = row[col.key] !== undefined ? row[col.key] : '';
                    }
                });
            }
        });

        actions.appendChild(resetButton);
        actions.appendChild(saveButton);

        const closeButton = document.createElement('button');
        closeButton.className = 'drawer-button close';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', function() {
            drawerTr.hidden = true;
            tr.classList.remove('expanded');
            _expandedRows.delete(row.id);
        });
        actions.appendChild(closeButton);
        drawerContent.appendChild(actions);
        drawerTd.appendChild(drawerContent);
        drawerTr.appendChild(drawerTd);

        // --- Toggle drawer on double-click ---

        tr.addEventListener('dblclick', function() {

            const nowHidden = !drawerTr.hidden;
            drawerTr.hidden = nowHidden;
            tr.classList.toggle('expanded', !nowHidden);

            if (!nowHidden) {
                _expandedRows.add(row.id);
            } else {
                _expandedRows.delete(row.id);
            }
        });

        return { dataRow: tr, drawerRow: drawerTr };
    }


    function _appendNextBatch() {

        const end = Math.min(_visibleCount + pageSize, _filtered.length);

        for (let i = _visibleCount; i < end; i++) {

            const pair = _createRowPair(_filtered[i], i);
            _vTbody.appendChild(pair.dataRow);
            _vTbody.appendChild(pair.drawerRow);
        }

        _visibleCount = end;
    }


    function _renderPage() {

        _vTbody.innerHTML = '';

        const start = _currentPage * pageSize;
        const end = Math.min(start + pageSize, _filtered.length);
        const totalPages = Math.ceil(_filtered.length / pageSize) || 1;

        for (let i = start; i < end; i++) {

            const pair = _createRowPair(_filtered[i], i);
            _vTbody.appendChild(pair.dataRow);
            _vTbody.appendChild(pair.drawerRow);
        }

        if (_vInfo) {
            _vInfo.textContent = (_currentPage + 1) + ' / ' + totalPages + ' (' + _filtered.length + ' rows)';
        }
    }


    // --- Public API ---

    instance.setData = function(newData) {
        _data = newData.slice();
        _currentPage = 0;
        _visibleCount = 0;
        _applyFilter();
    };

    instance.appendData = function(newRows) {

        for (let i = 0; i < newRows.length; i++) {
            _data.push(newRows[i]);
            _filtered.push(newRows[i]);
        }

        _appendNextBatch();
        _loading = false;
    };

    instance.onRowSelect = function(callback) {
        _onRowSelect = callback;
    };

    instance.onLoadMore = function(callback) {
        _onLoadMore = callback;
    };

    instance.onSave = function(callback) {
        _onSave = callback;
    };

    instance.appendTo = function(parent) {
        parent.appendChild(instance.view);
    };


    return _init();
}
