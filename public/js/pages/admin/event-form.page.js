import { EVENT_TYPES } from '../../config.js';
import { eventsApi, venuesApi } from '../../api/resources.js';
import { h } from '../../ui/dom.js';
import { bindForm, field, icon, openModal, renderAsync, selectField, showToast, textareaField } from '../../ui/components.js';
import { toApiDateTime, toDateInput, toTimeInput } from '../../ui/format.js';

const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'Programado' },
    { value: 'finished', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' }
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const parseLines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

const parsePairs = (text, formatHint) => parseLines(text).map((line) => {
    const [first, second] = line.split('|').map((part) => part.trim());
    if (!first || !second) {
        throw new Error(`Cada línea debe tener el formato ${formatHint}`);
    }
    return [first, second];
});

const detailsFields = {
    concert: {
        render: (details) => [textareaField({ label: 'Lineup', name: 'lineup', value: (details?.lineup ?? []).map((slot) => `${slot.artist} | ${slot.time}`).join('\n'), hint: 'Una línea por artista: Artista | HH:MM' })],
        build: (values) => ({ lineup: parsePairs(values.lineup, 'Artista | HH:MM').map(([artist, time]) => ({ artist, time })) })
    },
    sports: {
        render: (details) => [
            h('div', { className: 'form-grid' }, field({ label: 'Equipo local', name: 'home_team', value: details?.home_team ?? '', required: true }), field({ label: 'Equipo visitante', name: 'away_team', value: details?.away_team ?? '', required: true })),
            h('div', { className: 'form-grid' }, field({ label: 'Marcador local', name: 'score_home', type: 'number', min: 0, value: details?.score.home ?? 0, required: true }), field({ label: 'Marcador visitante', name: 'score_away', type: 'number', min: 0, value: details?.score.away ?? 0, required: true }))
        ],
        build: (values) => ({ home_team: values.home_team.trim(), away_team: values.away_team.trim(), score: { home: Number(values.score_home), away: Number(values.score_away) } })
    },
    theater: {
        render: (details) => [
            textareaField({ label: 'Reparto', name: 'cast', value: (details?.cast ?? []).map((member) => `${member.performer} | ${member.character}`).join('\n'), hint: 'Una línea por integrante: Intérprete | Personaje' }),
            textareaField({ label: 'Intermedios', name: 'intermissions', value: (details?.intermissions ?? []).map((intermission) => intermission.time).join('\n'), hint: 'Una hora por línea: HH:MM' })
        ],
        build: (values) => {
            const times = parseLines(values.intermissions);
            if (!times.every((time) => TIME_PATTERN.test(time))) {
                throw new Error('Cada intermedio debe tener el formato HH:MM');
            }
            return { cast: parsePairs(values.cast, 'Intérprete | Personaje').map(([performer, character]) => ({ performer, character })), intermissions: times.map((time) => ({ time })) };
        }
    }
};

const openVenueForm = (onCreated) => {
    const form = h(
        'form',
        { className: 'form' },
        field({ label: 'Nombre del lugar', name: 'name', required: true, maxlength: 100 }),
        field({ label: 'Dirección', name: 'address', required: true, maxlength: 150 }),
        h('div', { className: 'form-grid' }, field({ label: 'Ciudad', name: 'city', required: true, maxlength: 45 }), field({ label: 'Capacidad', name: 'venue_capacity', type: 'number', min: 1, required: true })),
        h('button', { className: 'btn btn--block', type: 'submit' }, 'Crear lugar')
    );
    const close = openModal('Nuevo lugar', form);
    bindForm(form, async (values) => {
        const venue = await venuesApi.create({ name: values.name.trim(), address: values.address.trim(), city: values.city.trim(), venue_capacity: Number(values.venue_capacity) });
        close();
        showToast('Lugar creado');
        onCreated(venue);
    });
};

const buildEventBody = (values, eventType, isEdit) => {
    const body = {
        venue_id: Number(values.venue_id),
        name: values.name.trim(),
        description: values.description.trim(),
        image_url: values.image_url.trim() || (isEdit ? null : undefined),
        event_date: toApiDateTime(values.date, values.time),
        price_min: Number(values.price_min),
        price_max: Number(values.price_max),
        event_details: detailsFields[eventType].build(values)
    };
    return isEdit ? { ...body, status: values.status } : { ...body, event_type: eventType, event_capacity: Number(values.event_capacity) };
};

const eventFormView = ({ venues: initialVenues, event }) => {
    const isEdit = Boolean(event);
    let venues = initialVenues;
    let eventType = event?.event_type ?? 'concert';
    const venueHolder = h('div');
    const detailsHolder = h('div', { className: 'stack' });
    const venueOptions = () => venues.map((venue) => ({ value: venue.id_venue, label: `${venue.name}, ${venue.city} (capacidad ${venue.venue_capacity})` }));
    const paintVenues = (selected) => venueHolder.replaceChildren(selectField({ label: 'Lugar', name: 'venue_id', options: venueOptions(), value: selected ?? event?.venue_id ?? venues[0]?.id_venue ?? '', required: true }));
    const paintDetails = () => detailsHolder.replaceChildren(...detailsFields[eventType].render(event?.event_type === eventType ? event.event_details : null));
    const typeSelect = selectField({ label: 'Categoría', name: 'event_type', options: Object.entries(EVENT_TYPES).map(([value, type]) => ({ value, label: type.label })), value: eventType, disabled: isEdit });
    typeSelect.querySelector('select').addEventListener('change', (changeEvent) => {
        eventType = changeEvent.target.value;
        paintDetails();
    });
    paintVenues();
    paintDetails();
    const form = h(
        'form',
        { className: 'form' },
        h('div', { className: 'panel stack' }, h('h3', {}, 'Información general'), field({ label: 'Nombre del evento', name: 'name', value: event?.name ?? '', required: true, maxlength: 100 }), typeSelect, textareaField({ label: 'Descripción', name: 'description', value: event?.description ?? '', required: true }), field({ label: 'Imagen del evento (URL, opcional)', name: 'image_url', type: 'url', value: event?.image_url ?? '', maxlength: 255 })),
        h(
            'div',
            { className: 'panel stack' },
            h('h3', {}, 'Fecha y ubicación'),
            h('div', { className: 'form-grid' }, field({ label: 'Fecha', name: 'date', type: 'date', value: event ? toDateInput(event.event_date) : '', required: true }), field({ label: 'Hora', name: 'time', type: 'time', value: event ? toTimeInput(event.event_date) : '', required: true })),
            venueHolder,
            h('button', { className: 'btn btn--ghost btn--small', type: 'button', onClick: () => openVenueForm((venue) => { venues = [...venues, venue]; paintVenues(venue.id_venue); }) }, icon('plus'), 'Nuevo lugar')
        ),
        h(
            'div',
            { className: 'panel stack' },
            h('h3', {}, 'Entradas'),
            h('div', { className: 'form-grid' }, field({ label: 'Precio mínimo', name: 'price_min', type: 'number', min: 0, step: 'any', value: event?.price_min ?? '', required: true }), field({ label: 'Precio máximo', name: 'price_max', type: 'number', min: 0, step: 'any', value: event?.price_max ?? '', required: true })),
            field({ label: 'Cupo del evento', name: 'event_capacity', type: 'number', min: 1, value: event?.event_capacity ?? '', required: true, disabled: isEdit, hint: isEdit ? 'El cupo no se modifica después de crear el evento' : 'No puede superar la capacidad del lugar' }),
            isEdit && selectField({ label: 'Estado', name: 'status', options: STATUS_OPTIONS, value: event.status })
        ),
        h('div', { className: 'panel stack' }, h('h3', {}, 'Información propia de la categoría'), detailsHolder),
        h('button', { className: 'btn', type: 'submit' }, isEdit ? 'Guardar cambios' : 'Crear evento')
    );
    return h(
        'div',
        { className: 'stack' },
        h('h1', { className: 'page-title' }, isEdit ? 'Editar evento' : 'Crear evento'),
        bindForm(form, async (values) => {
            const body = buildEventBody(values, eventType, isEdit);
            await (isEdit ? eventsApi.update(event.id_event, body) : eventsApi.create(body));
            showToast(isEdit ? 'Evento actualizado' : 'Evento creado');
            window.location.hash = '#/admin/events';
        })
    );
};

export const eventFormPage = ({ params }) => {
    const container = h('div', { className: 'stack' });
    renderAsync(
        container,
        async () => {
            const [venues, event] = await Promise.all([venuesApi.list(), params.id ? eventsApi.get(params.id) : null]);
            return { venues, event };
        },
        eventFormView
    );
    return container;
};
