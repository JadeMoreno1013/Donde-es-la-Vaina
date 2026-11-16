import { MAX_RATING } from '../config.js';
import { reviewsApi } from '../api/resources.js';
import { h } from '../ui/dom.js';
import { bindForm, field, openModal, selectField, showToast, textareaField } from '../ui/components.js';

const ratingOptions = (allowBlank) => [
    ...(allowBlank ? [{ value: '', label: 'Sin calificar' }] : []),
    ...Array.from({ length: MAX_RATING }, (_, index) => ({ value: String(index + 1), label: `${index + 1} de ${MAX_RATING}` }))
];

const buildReviewBody = (values) => ({
    rating: Number(values.rating),
    seat_rating: values.seat_rating ? Number(values.seat_rating) : null,
    comment: values.comment.trim() || null,
    tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
});

export const openReviewForm = ({ review, purchaseId, onSaved }) => {
    const form = h(
        'form',
        { className: 'form' },
        selectField({ label: 'Calificación', name: 'rating', options: ratingOptions(false), value: review?.rating ?? MAX_RATING, required: true }),
        selectField({ label: 'Calificación de la ubicación del asiento (opcional)', name: 'seat_rating', options: ratingOptions(true), value: review?.seat_rating ?? '' }),
        textareaField({ label: 'Comentario (opcional)', name: 'comment', value: review?.comment ?? '' }),
        field({ label: 'Etiquetas (opcional)', name: 'tags', value: (review?.tags ?? []).join(', '), hint: 'Separadas por comas, máximo 30 caracteres cada una' }),
        h('button', { className: 'btn btn--block', type: 'submit' }, 'Guardar reseña')
    );
    const close = openModal(review ? 'Editar reseña' : 'Publicar reseña', form);
    bindForm(form, async (values) => {
        const body = buildReviewBody(values);
        if (review) {
            await reviewsApi.update(review.id_review, body);
        } else {
            await reviewsApi.create({ purchase_id: purchaseId, ...body });
        }
        close();
        showToast('Reseña guardada');
        onSaved();
    });
};
