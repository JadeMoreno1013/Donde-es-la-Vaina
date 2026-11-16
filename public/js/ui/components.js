import { TOAST_DURATION_MS, MAX_RATING } from '../config.js';
import { h } from './dom.js';
import { icons } from './icons.js';

export const icon = (name) => {
    const element = h('span', { className: 'icon', 'aria-hidden': 'true' });
    element.innerHTML = icons[name];
    return element;
};

export const badge = (text, tone) => h('span', { className: `badge badge--${tone}` }, text);

export const stars = (rating) => h(
    'span',
    { className: 'stars', 'aria-label': `${rating} de ${MAX_RATING}` },
    Array.from({ length: MAX_RATING }, (_, index) => icon(index < rating ? 'starFilled' : 'star'))
);

const loadingState = () => h(
    'div',
    { className: 'state' },
    h('div', { className: 'spinner', role: 'status', 'aria-label': 'Cargando' }),
    h('p', {}, 'Cargando información')
);

const errorState = (message, onRetry) => h(
    'div',
    { className: 'state state--error' },
    h('p', {}, message),
    h('button', { className: 'btn btn--ghost', type: 'button', onClick: onRetry }, 'Reintentar')
);

export const emptyState = (message) => h('div', { className: 'state' }, h('p', {}, message));

export const renderAsync = async (container, loader, render) => {
    const load = async () => {
        container.replaceChildren(loadingState());
        try {
            const data = await loader();
            container.replaceChildren(render(data, load));
        } catch (error) {
            container.replaceChildren(errorState(error.message, load));
        }
    };
    await load();
};

export const showToast = (message, tone = 'success') => {
    const toast = h('div', { className: `toast toast--${tone}`, role: 'status' }, message);
    document.getElementById('toast-region').append(toast);
    setTimeout(() => toast.remove(), TOAST_DURATION_MS);
};

export const openModal = (title, content) => {
    const close = () => {
        overlay.remove();
        document.removeEventListener('keydown', onKeyDown);
    };
    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            close();
        }
    };
    const overlay = h(
        'div',
        { className: 'overlay', onClick: (event) => event.target === overlay && close() },
        h(
            'div',
            { className: 'modal', role: 'dialog', 'aria-label': title },
            h('div', { className: 'modal__header' }, h('h2', {}, title), h('button', { className: 'icon-btn', type: 'button', 'aria-label': 'Cerrar', onClick: close }, icon('close'))),
            content
        )
    );
    document.addEventListener('keydown', onKeyDown);
    document.body.append(overlay);
    return close;
};

export const confirmDialog = (message, confirmLabel = 'Eliminar') => new Promise((resolve) => {
    let close = () => {};
    const answer = (value) => {
        close();
        resolve(value);
    };
    close = openModal('Confirmar acción', h(
        'div',
        { className: 'stack' },
        h('p', {}, message),
        h(
            'div',
            { className: 'row' },
            h('button', { className: 'btn btn--danger', type: 'button', onClick: () => answer(true) }, confirmLabel),
            h('button', { className: 'btn btn--ghost', type: 'button', onClick: () => answer(false) }, 'Cancelar')
        )
    ));
});

export const field = ({ label, hint, ...attributes }) => h(
    'label',
    { className: 'field' },
    h('span', {}, label),
    h('input', attributes),
    hint && h('span', { className: 'field__hint' }, hint)
);

export const textareaField = ({ label, hint, value = '', ...attributes }) => {
    const textarea = h('textarea', attributes);
    textarea.value = value;
    return h('label', { className: 'field' }, h('span', {}, label), textarea, hint && h('span', { className: 'field__hint' }, hint));
};

export const selectField = ({ label, options, value, ...attributes }) => {
    const select = h('select', attributes, options.map((option) => h('option', { value: option.value }, option.label)));
    if (value !== undefined) {
        select.value = String(value);
    }
    return h('label', { className: 'field' }, h('span', {}, label), select);
};

const setBusy = (button, busy) => {
    if (busy) {
        button.dataset.label = button.textContent;
        button.textContent = 'Procesando';
    } else {
        button.textContent = button.dataset.label;
    }
    button.disabled = busy;
};

const showFormError = (form, error) => {
    form.querySelector('.form-error')?.remove();
    const items = (error.details ?? []).map((detail) => h('li', {}, detail));
    const box = h('div', { className: 'form-error', role: 'alert' }, error.message, items.length > 0 && h('ul', {}, items));
    form.prepend(box);
};

export const bindForm = (form, action) => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        form.querySelector('.form-error')?.remove();
        const button = form.querySelector('[type=submit]');
        setBusy(button, true);
        try {
            await action(Object.fromEntries(new FormData(form)));
        } catch (error) {
            showFormError(form, error);
        } finally {
            setBusy(button, false);
        }
    });
    return form;
};
