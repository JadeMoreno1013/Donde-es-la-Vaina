import { EVENT_TYPES, MS_PER_DAY, RECENT_SALES_COUNT, SALES_CHART_DAYS } from '../../config.js';
import { eventsApi, purchasesApi, usersApi } from '../../api/resources.js';
import { getEventState } from '../../domain/event-state.js';
import { h } from '../../ui/dom.js';
import { renderAsync } from '../../ui/components.js';
import { dataTable, kpiCard, pageHeader } from '../../ui/admin-components.js';
import { formatDate, formatPrice, formatShortDate, toDateInput } from '../../ui/format.js';

const sumTotals = (purchases) => purchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);

const dailyTotals = (purchases) => Array.from({ length: SALES_CHART_DAYS }, (_, index) => {
    const day = new Date(Date.now() - (SALES_CHART_DAYS - 1 - index) * MS_PER_DAY);
    const key = toDateInput(day);
    return { label: formatShortDate(day), total: sumTotals(purchases.filter((purchase) => toDateInput(purchase.purchase_date) === key)) };
});

const salesBars = (purchases) => {
    const days = dailyTotals(purchases);
    const peak = Math.max(1, ...days.map((day) => day.total));
    return h(
        'div',
        { className: 'panel' },
        h('h3', {}, 'Rendimiento de ventas'),
        h('div', { className: 'bars' }, days.map((day) => h('div', { className: 'bars__item', title: formatPrice(day.total) }, h('div', { className: 'bars__bar', style: `height: ${(day.total / peak) * 100}%` }), day.label)))
    );
};

const categoryDonut = (purchases) => {
    const total = Math.max(1, sumTotals(purchases));
    let accumulated = 0;
    const slices = Object.entries(EVENT_TYPES).map(([key, type]) => {
        const amount = sumTotals(purchases.filter((purchase) => purchase.event_type === key));
        const start = accumulated;
        accumulated += (amount / total) * 100;
        return { type, percent: Math.round((amount / total) * 100), gradient: `${type.color} ${start}% ${accumulated}%` };
    });
    return h(
        'div',
        { className: 'panel' },
        h('h3', {}, 'Ventas por categoría'),
        h('div', { className: 'donut', style: `background: conic-gradient(${slices.map((slice) => slice.gradient).join(', ')})` }),
        h('div', { className: 'legend' }, slices.map((slice) => h('span', {}, h('i', { style: `background: ${slice.type.color}` }), `${slice.type.plural} ${slice.percent}%`)))
    );
};

const dashboardView = ({ purchases, events, users }) => {
    const today = toDateInput(new Date());
    const salesToday = sumTotals(purchases.filter((purchase) => toDateInput(purchase.purchase_date) === today));
    const ticketsSold = purchases.reduce((sum, purchase) => sum + purchase.ticket_count, 0);
    const activeEvents = events.filter((event) => getEventState(event).canBuy).length;
    return h(
        'div',
        { className: 'admin__main' },
        pageHeader('Dashboard', 'Resumen general de la plataforma', h('a', { className: 'btn', href: '#/admin/events/new' }, 'Nuevo evento')),
        h('div', { className: 'kpi-grid' }, kpiCard('Ventas del día', formatPrice(salesToday)), kpiCard('Entradas vendidas', String(ticketsSold)), kpiCard('Eventos activos', String(activeEvents)), kpiCard('Usuarios registrados', String(users.length))),
        h('div', { className: 'charts' }, salesBars(purchases), categoryDonut(purchases)),
        h('h2', {}, 'Ventas recientes'),
        dataTable(
            [
                { header: 'Fecha', cell: (purchase) => formatDate(purchase.purchase_date) },
                { header: 'Comprador', cell: (purchase) => purchase.buyer_name },
                { header: 'Evento', cell: (purchase) => purchase.event_name },
                { header: 'Entradas', cell: (purchase) => String(purchase.ticket_count) },
                { header: 'Total', cell: (purchase) => formatPrice(purchase.total_amount) }
            ],
            purchases.slice(0, RECENT_SALES_COUNT),
            'Aún no hay ventas registradas'
        )
    );
};

export const dashboardPage = () => {
    const container = h('div', { className: 'stack' });
    renderAsync(
        container,
        async () => {
            const [purchases, events, users] = await Promise.all([purchasesApi.list(), eventsApi.list(), usersApi.list()]);
            return { purchases, events, users };
        },
        dashboardView
    );
    return container;
};
