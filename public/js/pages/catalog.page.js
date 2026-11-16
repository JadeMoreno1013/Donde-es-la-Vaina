import { EVENT_TYPES } from '../config.js';
import { eventsApi } from '../api/resources.js';
import { getEventState } from '../domain/event-state.js';
import { h } from '../ui/dom.js';
import { emptyState, renderAsync, selectField } from '../ui/components.js';
import { eventGrid } from '../ui/event-card.js';
import { formatPrice } from '../ui/format.js';

const STATE_OPTIONS = [
    { value: '', label: 'Cualquier estado' },
    { value: 'available', label: 'Disponible' },
    { value: 'soldOut', label: 'Agotado' },
    { value: 'finished', label: 'Finalizado' }
];

const ORDER_OPTIONS = [
    { value: 'asc', label: 'Fecha: más próximo' },
    { value: 'desc', label: 'Fecha: más lejano' }
];

const matchesState = (event, stateFilter) => {
    const state = getEventState(event);
    return stateFilter === '' || (stateFilter === 'available' ? state.canBuy : state.key === stateFilter);
};

export const catalogPage = ({ query }) => {
    const filters = { type: query.get('type') ?? '', search: query.get('search') ?? '', state: '', maxPrice: null, order: 'asc' };
    let events = [];
    const gridHolder = h('div');
    const results = h('div', { className: 'container section' });
    const priceInput = h('input', { type: 'range', min: 0, max: 0, step: 1, value: 0, 'aria-label': 'Precio máximo' });
    const priceLabel = h('span', {}, formatPrice(0));

    const paint = () => {
        const direction = filters.order === 'asc' ? 1 : -1;
        const visible = events
            .filter((event) => matchesState(event, filters.state) && event.price_min <= filters.maxPrice)
            .sort((first, second) => direction * (new Date(first.event_date) - new Date(second.event_date)));
        gridHolder.replaceChildren(visible.length > 0 ? eventGrid(visible) : emptyState('No hay eventos que coincidan con los filtros'));
    };

    const load = () => renderAsync(
        results,
        () => eventsApi.list({ event_type: filters.type, search: filters.search }),
        (data) => {
            events = data;
            if (filters.maxPrice === null) {
                filters.maxPrice = Math.max(0, ...data.map((event) => event.price_min));
                priceInput.max = filters.maxPrice;
                priceInput.value = filters.maxPrice;
                priceLabel.textContent = formatPrice(filters.maxPrice);
            }
            paint();
            return gridHolder;
        }
    );

    const typeChips = [{ key: '', label: 'Todos' }, ...Object.entries(EVENT_TYPES).map(([key, type]) => ({ key, label: type.plural }))].map((chip) => h(
        'button',
        {
            className: `chip ${filters.type === chip.key ? 'is-active' : ''}`,
            type: 'button',
            onClick: (event) => {
                filters.type = chip.key;
                event.currentTarget.parentElement.querySelectorAll('.chip').forEach((element) => element.classList.remove('is-active'));
                event.currentTarget.classList.add('is-active');
                load();
            }
        },
        chip.label
    ));

    const searchInput = h('input', { type: 'search', value: filters.search, placeholder: 'Busca un evento, artista o teatro', 'aria-label': 'Buscar evento' });
    const searchForm = h('form', { className: 'search', onSubmit: (event) => { event.preventDefault(); filters.search = searchInput.value.trim(); load(); } }, searchInput, h('button', { className: 'btn', type: 'submit' }, 'Buscar'));

    const stateSelect = selectField({ label: 'Estado', options: STATE_OPTIONS });
    const orderSelect = selectField({ label: 'Orden', options: ORDER_OPTIONS });
    stateSelect.querySelector('select').addEventListener('change', (event) => { filters.state = event.target.value; paint(); });
    orderSelect.querySelector('select').addEventListener('change', (event) => { filters.order = event.target.value; paint(); });
    priceInput.addEventListener('input', () => { filters.maxPrice = Number(priceInput.value); priceLabel.textContent = formatPrice(filters.maxPrice); paint(); });

    load();
    return h(
        'div',
        {},
        h('section', { className: 'hero hero--compact' }, h('div', { className: 'container' }, h('h1', { className: 'hero__title' }, 'Encuentra tu próximo evento'), h('p', { className: 'hero__text' }, 'Conciertos, deportes, teatros y más.'), searchForm)),
        h(
            'div',
            { className: 'container' },
            h('div', { className: 'filters' }, h('div', { className: 'chips' }, typeChips), stateSelect.querySelector('select'), h('label', {}, 'Precio máx', priceInput, priceLabel), orderSelect.querySelector('select'))
        ),
        results
    );
};
