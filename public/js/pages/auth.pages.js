import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, SESSION_CHANGED_EVENT } from '../config.js';
import { sessionsApi, usersApi } from '../api/resources.js';
import { clearSession, saveSession, takeRedirect } from '../session.store.js';
import { h } from '../ui/dom.js';
import { bindForm, field, showToast } from '../ui/components.js';

const finishLogin = (session, remember) => {
    saveSession(session, remember);
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
    window.location.hash = takeRedirect() ?? '#/';
    showToast(`Bienvenido, ${session.user.name}`);
};

const passwordAttributes = { type: 'password', required: true, minlength: MIN_PASSWORD_LENGTH, maxlength: MAX_PASSWORD_LENGTH };

export const loginPage = () => {
    const form = h(
        'form',
        { className: 'form' },
        field({ label: 'Email', name: 'email', type: 'email', required: true, placeholder: 'correo@ejemplo.com', autocomplete: 'email' }),
        field({ label: 'Contraseña', name: 'password', type: 'password', required: true, autocomplete: 'current-password' }),
        h('label', { className: 'check' }, h('input', { type: 'checkbox', name: 'remember' }), 'Recordarme en este dispositivo'),
        h('button', { className: 'btn btn--block', type: 'submit' }, 'Iniciar sesión')
    );
    bindForm(form, async (values) => {
        const session = await sessionsApi.create({ email: values.email, password: values.password });
        finishLogin(session, values.remember === 'on');
    });
    return h('div', { className: 'auth__form' }, h('h1', {}, 'Iniciar sesión'), h('p', { className: 'muted' }, '¿No tienes cuenta? ', h('a', { className: 'link', href: '#/register' }, 'Crear una cuenta')), form, h('p', { className: 'muted auth__alt' }, '¿Eres administrador? ', h('a', { className: 'link', href: '#/admin/login' }, 'Inicia sesión aquí')));
};

export const registerPage = () => {
    const form = h(
        'form',
        { className: 'form' },
        h('div', { className: 'form-grid' }, field({ label: 'Nombre', name: 'name', required: true, maxlength: 45 }), field({ label: 'Apellido', name: 'last_name', required: true, maxlength: 45 })),
        field({ label: 'Email', name: 'email', type: 'email', required: true, maxlength: 100, autocomplete: 'email' }),
        field({ label: 'Contraseña', name: 'password', autocomplete: 'new-password', hint: `Entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`, ...passwordAttributes }),
        field({ label: 'Confirmar contraseña', name: 'confirmation', autocomplete: 'new-password', ...passwordAttributes }),
        h('label', { className: 'check' }, h('input', { type: 'checkbox', name: 'terms', required: true }), 'Acepto los términos y condiciones y la política de privacidad'),
        h('button', { className: 'btn btn--block', type: 'submit' }, 'Crear una cuenta')
    );
    bindForm(form, async (values) => {
        if (values.password !== values.confirmation) {
            throw new Error('Las contraseñas no coinciden');
        }
        await usersApi.register({ name: values.name, last_name: values.last_name, email: values.email, password: values.password });
        const session = await sessionsApi.create({ email: values.email, password: values.password });
        finishLogin(session, false);
    });
    return h('div', { className: 'auth__form' }, h('h1', {}, 'Crear cuenta'), h('p', { className: 'muted' }, '¿Ya tienes cuenta? ', h('a', { className: 'link', href: '#/login' }, 'Inicia sesión')), form);
};

export const adminLoginPage = () => {
    const form = h(
        'form',
        { className: 'form' },
        field({ label: 'Email', name: 'email', type: 'email', required: true, placeholder: 'admin@ejemplo.com', autocomplete: 'email' }),
        field({ label: 'Contraseña', name: 'password', type: 'password', required: true, autocomplete: 'current-password' }),
        h('label', { className: 'check' }, h('input', { type: 'checkbox', name: 'remember' }), 'Recordarme en este dispositivo'),
        h('button', { className: 'btn btn--block', type: 'submit' }, 'Iniciar sesión')
    );
    bindForm(form, async (values) => {
        const session = await sessionsApi.create({ email: values.email, password: values.password });
        if (!session.user.is_admin) {
            saveSession(session, false);
            await sessionsApi.destroy().catch(() => null);
            clearSession();
            throw new Error('Esta cuenta no tiene permisos de administrador');
        }
        saveSession(session, values.remember === 'on');
        window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
        window.location.hash = takeRedirect() ?? '#/admin';
        showToast(`Bienvenido, ${session.user.name}`);
    });
    return h('div', { className: 'auth__form' }, h('h1', {}, 'Iniciar sesión'), h('p', { className: 'muted' }, '¿Eres cliente? ', h('a', { className: 'link', href: '#/login' }, 'Ingresa aquí')), form);
};
