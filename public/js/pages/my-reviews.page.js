import { reviewsApi, eventsApi } from '../api/resources.js';
import { getSession } from '../session.store.js';
import { h } from '../ui/dom.js';
import { badge, confirmDialog, emptyState, icon, renderAsync, showToast, stars } from '../ui/components.js';
import { coverStyle } from '../ui/event-card.js';
import { formatDate } from '../ui/format.js';
import { openReviewForm } from './review-form.js';

const loadReviews = async () => {
    const [reviews, events] = await Promise.all([reviewsApi.list({ user_id: getSession().user.id_user }), eventsApi.list()]);
    return { reviews, eventsById: new Map(events.map((event) => [event.id_event, event])) };
};

const removeReview = async (review, reload) => {
    if (await confirmDialog('¿Desea eliminar esta reseña?')) {
        await reviewsApi.remove(review.id_review).then(() => {
            showToast('Reseña eliminada');
            reload();
        }).catch((error) => showToast(error.message, 'error'));
    }
};

const reviewCard = (review, event, reload) => h(
    'article',
    { className: 'list-card' },
    h('div', { className: `list-card__cover cover--${event?.event_type ?? 'concert'}`, style: event ? coverStyle(event) : '' }),
    h(
        'div',
        { className: 'list-card__body' },
        h('h3', {}, event?.name ?? 'Evento'),
        h('div', { className: 'row' }, stars(review.rating), h('span', { className: 'muted' }, formatDate(review.review_date))),
        review.comment && h('p', {}, review.comment),
        (review.tags ?? []).length > 0 && h('div', { className: 'tags' }, review.tags.map((tag) => badge(tag, 'concert'))),
        review.seat_rating && h('div', { className: 'row muted' }, 'Valoración del asiento', stars(review.seat_rating))
    ),
    h(
        'div',
        { className: 'list-card__side' },
        h('span', {}),
        h(
            'div',
            { className: 'row' },
            h('button', { className: 'icon-btn', type: 'button', 'aria-label': 'Editar reseña', onClick: () => openReviewForm({ review, onSaved: reload }) }, icon('edit')),
            h('button', { className: 'icon-btn', type: 'button', 'aria-label': 'Eliminar reseña', onClick: () => removeReview(review, reload) }, icon('trash'))
        )
    )
);

const reviewsView = ({ reviews, eventsById }, reload) => h(
    'div',
    {},
    h('h1', { className: 'page-title' }, 'Mis reseñas'),
    h('p', { className: 'muted' }, 'Comparte tu experiencia y ayuda a la comunidad'),
    h('h2', { className: 'section__title' }, `Mis valoraciones (${reviews.length})`),
    reviews.length > 0 ? reviews.map((review) => reviewCard(review, eventsById.get(review.event_id), reload)) : emptyState('Aún no has publicado reseñas. Puedes reseñar tus eventos pasados desde Mis entradas.')
);

export const myReviewsPage = () => {
    const container = h('div', { className: 'container section' });
    renderAsync(container, loadReviews, reviewsView);
    return container;
};
