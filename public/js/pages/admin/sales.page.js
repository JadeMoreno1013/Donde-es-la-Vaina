import { purchasesApi } from '../../api/resources.js';
import { h } from '../../ui/dom.js';
import { renderAsync } from '../../ui/components.js';
import { dataTable, kpiCard, pageHeader } from '../../ui/admin-components.js';
import { formatDateTime, formatPrice } from '../../ui/format.js';

const salesTable = (purchases) => dataTable(
    [
        { header: 'Fecha', cell: (purchase) => formatDateTime(purchase.purchase_date) },
        { header: 'Comprador', cell: (purchase) => h('span', {}, purchase.buyer_name, h('br'), h('small', { className: 'muted' }, purchase.buyer_email)) },
        { header: 'Evento', cell: (purchase) => purchase.event_name },
        { header: 'Entradas', cell: (purchase) => String(purchase.ticket_count) },
        { header: 'Total', cell: (purchase) => formatPrice(purchase.total_amount) }
    ],
    purchases,
    'No hay ventas para el filtro seleccionado'
);

const salesView = (purchases) => h(
    'div',
    { className: 'stack' },
    h(
        'div',
        { className: 'kpi-grid' },
        kpiCard('Ventas totales', formatPrice(purchases.reduce((sum, purchase) => sum + purchase.total_amount, 0))),
        kpiCard('Transacciones', String(purchases.length)),
        kpiCard('Entradas vendidas', String(purchases.reduce((sum, purchase) => sum + purchase.ticket_count, 0)))
    ),
    salesTable(purchases)
);

export const salesPage = () => {
    const results = h('div');
    const load = (date) => renderAsync(results, () => purchasesApi.list({ date }), salesView);
    const dateInput = h('input', { type: 'date', 'aria-label': 'Filtrar por fecha', onChange: () => load(dateInput.value) });
    const clearButton = h('button', { className: 'btn btn--ghost btn--small', type: 'button', onClick: () => { dateInput.value = ''; load(''); } }, 'Ver todas');
    load('');
    return h(
        'div',
        { className: 'stack' },
        pageHeader('Ventas', 'Historial completo de transacciones', h('div', { className: 'row' }, h('label', { className: 'field' }, 'Fecha', dateInput), clearButton)),
        results
    );
};
