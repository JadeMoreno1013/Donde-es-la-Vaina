import { h } from './dom.js';
import { emptyState } from './components.js';

export const pageHeader = (title, subtitle, action) => h(
    'div',
    { className: 'row row--between' },
    h('div', {}, h('h1', { className: 'page-title' }, title), h('p', { className: 'muted' }, subtitle)),
    action
);

export const kpiCard = (label, value) => h('div', { className: 'kpi' }, h('span', { className: 'muted' }, label), h('strong', {}, value));

export const dataTable = (columns, rows, emptyMessage) => {
    if (rows.length === 0) {
        return emptyState(emptyMessage);
    }
    return h(
        'div',
        { className: 'table-wrap panel' },
        h(
            'table',
            { className: 'table' },
            h('thead', {}, h('tr', {}, columns.map((column) => h('th', {}, column.header)))),
            h('tbody', {}, rows.map((row) => h('tr', {}, columns.map((column) => h('td', {}, column.cell(row))))))
        )
    );
};
