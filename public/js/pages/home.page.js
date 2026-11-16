import { EVENT_TYPES, FEATURED_EVENTS_COUNT } from '../config.js';
import { eventsApi } from '../api/resources.js';
import { getEventState } from '../domain/event-state.js';
import { h } from '../ui/dom.js';
import { badge, renderAsync } from '../ui/components.js';
import { eventGrid } from '../ui/event-card.js';
import { countLabel } from '../ui/format.js';

const byDate = (first, second) => new Date(first.event_date) - new Date(second.event_date);

const categoryCards = (events) => h(
    'div',
    { className: 'category-grid' },
    Object.entries(EVENT_TYPES).map(([key, type]) => {
        const count = events.filter((event) => event.event_type === key).length;
        return h('a', { className: `category-card category-card--${key}`, href: `#/events?type=${key}` }, h('strong', {}, type.plural), h('span', {}, countLabel(count, 'evento', 'eventos')));
    })
);

const searchBar = () => {
    const input = h('input', { type: 'search', placeholder: 'Buscar un evento, artista o lugar', 'aria-label': 'Buscar evento' });
    return h('form', { className: 'search', role: 'search', onSubmit: (event) => { event.preventDefault(); window.location.hash = `#/events?search=${encodeURIComponent(input.value.trim())}`; } }, input, h('button', { className: 'btn', type: 'submit' }, 'Buscar'));
};

const section = (title, content) => h('section', { className: 'section container' }, h('h2', { className: 'section__title' }, title), content);

const homeContent = (events) => {
    const sellable = events.filter((event) => getEventState(event).canBuy).sort(byDate);
    const featured = sellable.slice(0, FEATURED_EVENTS_COUNT);
    const upcoming = sellable.slice(FEATURED_EVENTS_COUNT, FEATURED_EVENTS_COUNT * 2);
    return h(
        'div',
        {},
        h(
            'section',
            { className: 'hero' },
            h(
                'div',
                { className: 'container' },
                badge(`${countLabel(sellable.length, 'evento', 'eventos')} ${sellable.length === 1 ? 'disponible' : 'disponibles'}`, 'concert'),
                h('h1', { className: 'hero__title' }, '¿Dónde es la vaina?', h('em', {}, 'Aquí empieza el plan.')),
                h('p', { className: 'hero__text' }, 'Descubre y compra entradas directamente para los mejores conciertos, eventos deportivos y obras de teatro.'),
                searchBar(),
                h('div', { className: 'row' }, h('a', { className: 'btn', href: '#/events' }, 'Explorar eventos'), h('a', { className: 'btn btn--ghost', href: '#/my-tickets' }, 'Ver mis entradas'))
            )
        ),
        section('Categorías', categoryCards(sellable)),
        featured.length > 0 && section('Eventos destacados', eventGrid(featured)),
        upcoming.length > 0 && section('Próximos eventos', eventGrid(upcoming))
    );
};

export const homePage = () => {
    const container = h('div');
    renderAsync(container, () => eventsApi.list({ status: 'scheduled' }), homeContent);
    return container;
};
