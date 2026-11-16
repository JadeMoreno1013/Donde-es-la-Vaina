import { EVENT_TYPES } from '../config.js';
import { eventsApi, purchasesApi, reviewsApi } from '../api/resources.js';
import { getEventState } from '../domain/event-state.js';
import { getSession } from '../session.store.js';
import { h } from '../ui/dom.js';
import { badge, emptyState, icon, renderAsync } from '../ui/components.js';
import { coverStyle } from '../ui/event-card.js';
import { countLabel, formatDateTime, formatPrice } from '../ui/format.js';
import { openReviewForm } from './review-form.js';

const loadTickets = async () => {
    const userId = getSession().user.id_user;
    const [upcoming, past, events, reviews] = await Promise.all([
        purchasesApi.list({ period: 'upcoming', user_id: userId }),
        purchasesApi.list({ period: 'past', user_id: userId }),
        eventsApi.list(),
        reviewsApi.list({ user_id: userId })
    ]);
    return { upcoming, past, eventsById: new Map(events.map((event) => [event.id_event, event])), reviewedPurchases: new Set(reviews.map((review) => review.purchase_id)) };
};

const reviewAction = (purchase, reviewedPurchases, reload) => {
    if (reviewedPurchases.has(purchase.id_purchase)) {
        return badge('Reseñada', 'available');
    }
    return h('button', { className: 'btn btn--ghost btn--small', type: 'button', onClick: () => openReviewForm({ purchaseId: purchase.id_purchase, onSaved: reload }) }, 'Reseñar');
};

const purchaseCard = (purchase, { eventsById, reviewedPurchases }, isPast, reload) => {
    const event = eventsById.get(purchase.event_id);
    const state = event ? getEventState(event) : null;
    return h(
        'article',
        { className: 'list-card' },
        h('div', { className: `list-card__cover cover--${purchase.event_type}`, style: event ? coverStyle(event) : '' }),
        h(
            'div',
            { className: 'list-card__body' },
            h('div', { className: 'row' }, badge(EVENT_TYPES[purchase.event_type].label, purchase.event_type), state && badge(state.label, state.key)),
            h('h3', {}, purchase.event_name),
            h('div', { className: 'row muted' }, icon('calendar'), formatDateTime(purchase.event_date)),
            event && h('div', { className: 'row muted' }, icon('pin'), `${event.venue_name}, ${event.venue_city}`)
        ),
        h(
            'div',
            { className: 'list-card__side' },
            h('div', { className: 'price' }, formatPrice(purchase.total_amount), h('small', {}, countLabel(purchase.ticket_count, 'entrada', 'entradas'))),
            h('div', { className: 'row' }, isPast && reviewAction(purchase, reviewedPurchases, reload), h('a', { className: 'btn btn--small', href: `#/events/${purchase.event_id}` }, 'Ver entrada'))
        )
    );
};

const ticketsView = (data, reload) => {
    let active = 'upcoming';
    const list = h('div');
    const tabs = h('div', { className: 'tabs' });
    const paint = () => {
        tabs.replaceChildren(...[['upcoming', 'Próximas'], ['past', 'Pasadas']].map(([key, label]) => h('button', { className: `tab ${active === key ? 'is-active' : ''}`, type: 'button', onClick: () => { active = key; paint(); } }, `${label} (${data[key].length})`)));
        const purchases = data[active];
        list.replaceChildren(...(purchases.length > 0 ? purchases.map((purchase) => purchaseCard(purchase, data, active === 'past', reload)) : [emptyState('No tienes entradas en esta sección')]));
    };
    paint();
    return h('div', {}, h('h1', { className: 'page-title' }, 'Mis entradas'), h('p', { className: 'muted' }, 'Consulta y gestiona todas tus entradas'), tabs, list);
};

export const myTicketsPage = () => {
    const container = h('div', { className: 'container section' });
    renderAsync(container, loadTickets, ticketsView);
    return container;
};
