import { EVENT_TYPES } from '../../config.js';
import { eventsApi } from '../../api/resources.js';
import { getEventState } from '../../domain/event-state.js';
import { h } from '../../ui/dom.js';
import { badge, confirmDialog, icon, renderAsync, showToast } from '../../ui/components.js';
import { dataTable, pageHeader } from '../../ui/admin-components.js';
import { countLabel, formatDate, formatPrice } from '../../ui/format.js';

const deleteEvent = async (event, reload) => {
    if (await confirmDialog(`¿Desea eliminar el evento ${event.name}?`)) {
        eventsApi.remove(event.id_event).then(() => {
            showToast('Evento eliminado');
            reload();
        }).catch((error) => showToast(error.message, 'error'));
    }
};

const eventsTable = (events, reload) => dataTable(
    [
        { header: 'Evento', cell: (event) => event.name },
        { header: 'Categoría', cell: (event) => badge(EVENT_TYPES[event.event_type].label, event.event_type) },
        { header: 'Fecha', cell: (event) => formatDate(event.event_date) },
        { header: 'Lugar', cell: (event) => `${event.venue_name}, ${event.venue_city}` },
        { header: 'Precio desde', cell: (event) => formatPrice(event.price_min) },
        { header: 'Estado', cell: (event) => badge(getEventState(event).label, getEventState(event).key) },
        {
            header: 'Acciones',
            cell: (event) => h(
                'div',
                { className: 'table__actions' },
                h('a', { className: 'icon-btn', href: `#/admin/events/${event.id_event}/edit`, 'aria-label': 'Editar evento' }, icon('edit')),
                h('button', { className: 'icon-btn', type: 'button', 'aria-label': 'Eliminar evento', onClick: () => deleteEvent(event, reload) }, icon('trash'))
            )
        }
    ],
    events,
    'No hay eventos que coincidan con la búsqueda'
);

const eventsView = (events, reload) => {
    const tableHolder = h('div');
    const paint = (text) => {
        const term = text.trim().toLowerCase();
        tableHolder.replaceChildren(eventsTable(events.filter((event) => event.name.toLowerCase().includes(term)), reload));
    };
    const search = h('input', { type: 'search', placeholder: 'Buscar evento', 'aria-label': 'Buscar evento', onInput: () => paint(search.value) });
    paint('');
    return h('div', { className: 'stack' }, pageHeader('Eventos', `${countLabel(events.length, 'evento', 'eventos')} en total`, h('a', { className: 'btn', href: '#/admin/events/new' }, icon('plus'), 'Crear evento')), h('div', { className: 'field' }, search), tableHolder);
};

export const adminEventsPage = () => {
    const container = h('div', { className: 'stack' });
    renderAsync(container, () => eventsApi.list(), eventsView);
    return container;
};
