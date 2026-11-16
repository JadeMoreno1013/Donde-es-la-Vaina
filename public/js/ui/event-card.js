import { EVENT_TYPES } from '../config.js';
import { getEventState } from '../domain/event-state.js';
import { formatDate, formatPrice } from './format.js';
import { h } from './dom.js';
import { badge, icon } from './components.js';

export const coverStyle = (event) => (event.image_url ? `background-image: url('${encodeURI(event.image_url)}')` : '');

const eventCard = (event) => {
    const state = getEventState(event);
    const action = state.canBuy
        ? h('a', { className: 'btn btn--small', href: `#/events/${event.id_event}` }, 'Ver evento')
        : h('button', { className: 'btn btn--small', type: 'button', disabled: true }, state.label);
    return h(
        'article',
        { className: 'event-card' },
        h(
            'div',
            { className: `event-card__cover cover--${event.event_type}`, style: coverStyle(event) },
            h('div', { className: 'event-card__badges' }, badge(EVENT_TYPES[event.event_type].label, event.event_type), badge(state.label, state.key))
        ),
        h(
            'div',
            { className: 'event-card__body' },
            h('a', { className: 'event-card__title', href: `#/events/${event.id_event}` }, event.name),
            h('div', { className: 'event-card__meta' }, icon('calendar'), formatDate(event.event_date)),
            h('div', { className: 'event-card__meta' }, icon('pin'), `${event.venue_name}, ${event.venue_city}`),
            h('div', { className: 'event-card__footer' }, h('div', { className: 'price' }, h('small', {}, 'Desde'), formatPrice(event.price_min)), action)
        )
    );
};

export const eventGrid = (events) => h('div', { className: 'event-grid' }, events.map(eventCard));
