import { EVENT_TYPES, POLL_INTERVAL_MS } from '../config.js';
import { eventsApi, purchasesApi } from '../api/resources.js';
import { getEventState } from '../domain/event-state.js';
import { getZoneOptions } from '../domain/zones.js';
import { getSession, rememberRedirect } from '../session.store.js';
import { h } from '../ui/dom.js';
import { badge, bindForm, field, icon, renderAsync, selectField, showToast } from '../ui/components.js';
import { coverStyle } from '../ui/event-card.js';
import { formatDateTime, formatPrice } from '../ui/format.js';

const infoRenderers = {
    concert: {
        title: 'Lineup y horarios',
        render: (details) => h('ul', { className: 'info-list' }, details.lineup.map((slot) => h('li', {}, `${slot.time} - ${slot.artist}`)))
    },
    sports: {
        title: 'Marcador en vivo',
        render: (details) => h(
            'div',
            { className: 'scoreboard' },
            h('div', {}, h('p', {}, details.home_team), h('strong', {}, String(details.score.home))),
            h('span', {}, 'vs'),
            h('div', {}, h('p', {}, details.away_team), h('strong', {}, String(details.score.away)))
        )
    },
    theater: {
        title: 'Reparto e intermedios',
        render: (details) => h(
            'div',
            { className: 'stack' },
            h('ul', { className: 'info-list' }, details.cast.map((member) => h('li', {}, `${member.performer} como ${member.character}`))),
            details.intermissions.length > 0 && h('p', { className: 'muted' }, `Intermedios: ${details.intermissions.map((intermission) => intermission.time).join(', ')}`)
        )
    }
};

const infoPanel = (eventType, details) => {
    const renderer = infoRenderers[eventType];
    return h('section', { className: 'panel' }, h('h3', {}, renderer.title), renderer.render(details));
};

const loadEvent = async (id) => {
    const event = await eventsApi.get(id);
    const info = getSession() ? await eventsApi.getInfo(id).catch((error) => {
        if (error.status === 403) {
            return null;
        }
        throw error;
    }) : null;
    return { event, info };
};

const confirmationPanel = (purchase, reload) => h(
    'aside',
    { className: 'panel confirmation stack' },
    h('h3', {}, 'Compra confirmada'),
    h('p', {}, `Total pagado: ${formatPrice(purchase.total_amount)}`),
    h('div', { className: 'stack' }, purchase.tickets.map((ticket) => h('div', {}, h('p', { className: 'muted' }, ticket.zone), h('span', { className: 'ticket-code' }, ticket.ticket_code)))),
    h('div', { className: 'row' }, h('a', { className: 'btn btn--small', href: '#/my-tickets' }, 'Ver mis entradas'), h('button', { className: 'btn btn--ghost btn--small', type: 'button', onClick: reload }, 'Ver información del evento'))
);

const purchaseForm = (event, onPurchased) => {
    const zones = getZoneOptions(event);
    const total = h('strong', {}, formatPrice(zones[0].price));
    const zoneSelect = selectField({ label: 'Tipo de entrada', name: 'zone', options: zones.map((zone) => ({ value: zone.name, label: `${zone.name} (${formatPrice(zone.price)})` })) });
    const quantityField = field({ label: 'Cantidad', name: 'quantity', type: 'number', min: 1, max: event.available_tickets, value: 1, required: true, hint: `${event.available_tickets} entradas disponibles` });
    const priceOf = () => zones.find((zone) => zone.name === zoneSelect.querySelector('select').value).price;
    const refreshTotal = () => {
        total.textContent = formatPrice(priceOf() * (Number(quantityField.querySelector('input').value) || 0));
    };
    zoneSelect.addEventListener('change', refreshTotal);
    quantityField.addEventListener('input', refreshTotal);
    const form = h('form', { className: 'form' }, zoneSelect, quantityField, h('p', {}, 'Total: ', total), h('button', { className: 'btn btn--block', type: 'submit' }, 'Comprar entradas'));
    return bindForm(form, async (values) => {
        const quantity = Number(values.quantity);
        const price = zones.find((zone) => zone.name === values.zone).price;
        const purchase = await purchasesApi.create({
            event_id: event.id_event,
            tickets: Array.from({ length: quantity }, () => ({ zone: values.zone, price_paid: price }))
        });
        showToast('Compra realizada con éxito');
        onPurchased(purchase);
    });
};

const purchasePanel = (event, reload) => {
    const state = getEventState(event);
    const panel = h('aside', { className: 'panel stack' }, h('h3', {}, 'Comprar entradas'));
    if (!state.canBuy) {
        panel.append(h('p', { className: 'muted' }, `Este evento está ${state.label.toLowerCase()} y no admite compras.`));
    } else if (!getSession()) {
        panel.append(
            h('p', { className: 'muted' }, 'Inicia sesión para comprar tus entradas.'),
            h('a', { className: 'btn', href: '#/login', onClick: () => rememberRedirect(window.location.hash) }, 'Iniciar sesión')
        );
    } else {
        panel.append(purchaseForm(event, (purchase) => panel.replaceWith(confirmationPanel(purchase, reload))));
    }
    return panel;
};

const eventView = ({ event, info }, reload, infoHolder) => {
    const state = getEventState(event);
    infoHolder.replaceChildren(...(info ? [infoPanel(event.event_type, info.event_details)] : []));
    return h(
        'div',
        { className: 'detail' },
        h(
            'div',
            { className: 'stack' },
            h('div', { className: `detail__cover cover--${event.event_type}`, style: coverStyle(event) }),
            h('div', { className: 'row' }, badge(EVENT_TYPES[event.event_type].label, event.event_type), badge(state.label, state.key)),
            h('h1', { className: 'detail__title' }, event.name),
            h('div', { className: 'row muted' }, icon('calendar'), formatDateTime(event.event_date), icon('pin'), `${event.venue_name}, ${event.venue_city}`),
            h('p', {}, event.description),
            h('p', { className: 'price' }, `${formatPrice(event.price_min)} - ${formatPrice(event.price_max)}`),
            infoHolder
        ),
        purchasePanel(event, reload)
    );
};

export const eventDetailPage = ({ params, onLeave }) => {
    const container = h('div', { className: 'container' });
    const infoHolder = h('div');
    let timerId = null;
    onLeave(() => clearInterval(timerId));

    const startPolling = ({ event, info }) => {
        clearInterval(timerId);
        if (!info || event.event_type !== 'sports' || getEventState(event).key === 'finished') {
            return;
        }
        timerId = setInterval(async () => {
            const fresh = await eventsApi.getInfo(event.id_event).catch(() => null);
            if (fresh) {
                infoHolder.replaceChildren(infoPanel(event.event_type, fresh.event_details));
            }
        }, POLL_INTERVAL_MS);
    };

    renderAsync(container, () => loadEvent(params.id), (data, reload) => {
        startPolling(data);
        return eventView(data, reload, infoHolder);
    });
    return container;
};
