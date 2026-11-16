import { SESSION_CHANGED_EVENT } from '../config.js';
import { sessionsApi } from '../api/resources.js';
import { clearSession, getSession } from '../session.store.js';
import { h } from './dom.js';
import { icon, showToast } from './components.js';
import { initials } from './format.js';

const NAV_LINKS = [
    { href: '#/', label: 'Inicio', match: '/', exact: true },
    { href: '#/events', label: 'Eventos', match: '/events' },
    { href: '#/my-tickets', label: 'Mis entradas', match: '/my-tickets' },
    { href: '#/my-reviews', label: 'Mis reseñas', match: '/my-reviews' }
];

const ADMIN_LINKS = [
    { href: '#/admin', label: 'Dashboard', icon: 'dashboard', match: '/admin' },
    { href: '#/admin/events', label: 'Eventos', icon: 'calendar', match: '/admin/events' },
    { href: '#/admin/sales', label: 'Ventas', icon: 'chart', match: '/admin/sales' },
    { href: '#/admin/users', label: 'Usuarios', icon: 'user', match: '/admin/users' }
];

export const logout = async () => {
    await sessionsApi.destroy().catch(() => null);
    clearSession();
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
    window.location.hash = '#/';
    showToast('Sesión cerrada', 'info');
};

const brand = () => h('a', { className: 'brand', href: '#/' }, icon('ticket'), h('span', {}, 'Donde Es La ', h('b', {}, 'Vaina')));

const userMenu = (user) => {
    const menu = h(
        'div',
        { className: 'menu', style: 'display: none' },
        h('a', { href: '#/my-tickets' }, 'Mis entradas'),
        h('a', { href: '#/my-reviews' }, 'Mis reseñas'),
        Boolean(user.is_admin) && h('a', { href: '#/admin' }, 'Panel Admin'),
        h('button', { className: 'menu__danger', type: 'button', onClick: logout }, 'Cerrar sesión')
    );
    const close = () => {
        menu.style.display = 'none';
        document.removeEventListener('click', close);
    };
    const toggle = (event) => {
        event.stopPropagation();
        if (menu.style.display === 'none') {
            menu.style.display = 'flex';
            document.addEventListener('click', close);
        } else {
            close();
        }
    };
    return h(
        'div',
        { className: 'navbar__user' },
        h('button', { className: 'user-button', type: 'button', 'aria-haspopup': 'true', onClick: toggle }, h('span', { className: 'avatar' }, initials(user)), user.name, icon('chevron')),
        menu
    );
};

const navbar = (pathname) => {
    const session = getSession();
    const guestActions = h('div', { className: 'row' }, h('a', { href: '#/login' }, 'Iniciar sesión'), h('a', { className: 'btn btn--small', href: '#/register' }, 'Registrarse'));
    return h(
        'header',
        { className: 'navbar' },
        h(
            'div',
            { className: 'container navbar__inner' },
            brand(),
            h('nav', { className: 'navbar__links' }, NAV_LINKS.map((link) => h('a', { href: link.href, className: (link.exact ? pathname === link.match : pathname.startsWith(link.match)) ? 'is-active' : '' }, link.label))),
            session ? userMenu(session.user) : guestActions
        )
    );
};

const FOOTER_COLUMNS = [
    { title: 'Plataforma', links: [['Explorar eventos', '#/events'], ['Mis entradas', '#/my-tickets'], ['Conciertos', '#/events?type=concert'], ['Deportes', '#/events?type=sports'], ['Teatro', '#/events?type=theater']] },
    { title: 'Cuenta', links: [['Iniciar sesión', '#/login'], ['Registrarse', '#/register'], ['Mis reseñas', '#/my-reviews'], ['Acceso administrador', '#/admin/login']] }
];

const footerColumn = (column) => h('div', {}, h('h4', {}, column.title), h('ul', {}, column.links.map(([label, href]) => h('li', {}, h('a', { href }, label)))));

const footer = () => h(
    'footer',
    { className: 'footer' },
    h(
        'div',
        { className: 'container' },
        h('div', { className: 'footer__columns' }, h('div', {}, brand(), h('p', { className: 'footer__about' }, 'La plataforma de venta directa de entradas para conciertos, eventos deportivos y obras de teatro.')), FOOTER_COLUMNS.map(footerColumn)),
        h('div', { className: 'footer__bottom' }, h('span', {}, `© ${new Date().getFullYear()} Donde Es La Vaina. Todos los derechos reservados.`), h('span', {}, 'Hecho en Colombia'))
    )
);

export const publicLayout = (content, pathname) => [navbar(pathname), h('main', {}, content), footer()];

export const authLayout = (content, pathname) => [
    h(
        'div',
        { className: 'auth' },
        h(
            'aside',
            { className: 'auth__cover' },
            brand(),
            h('h2', {}, pathname === '/login' ? 'El plan empieza con tu cuenta.' : 'Únete y nunca te pierdas un plan.'),
            h('p', {}, 'Accede a tus entradas, descubre los mejores eventos y forma parte de la comunidad.')
        ),
        h('section', { className: 'auth__panel' }, content)
    )
];

export const adminAuthLayout = (content) => [
    h(
        'div',
        { className: 'auth auth--admin' },
        h('div', { className: 'auth__cover' }, brand(), h('p', { className: 'auth__mode' }, 'Modo Administrador')),
        h('section', { className: 'auth__panel' }, content)
    )
];

export const adminLayout = (content, pathname) => {
    const { user } = getSession();
    const isActive = (link) => (link.match === '/admin' ? pathname === '/admin' : pathname.startsWith(link.match));
    return [
        h(
            'div',
            { className: 'admin' },
            h(
                'aside',
                { className: 'admin__side' },
                h('div', {}, brand(), h('p', { className: 'muted' }, 'Admin Panel')),
                h('nav', { className: 'admin__nav' }, ADMIN_LINKS.map((link) => h('a', { href: link.href, className: isActive(link) ? 'is-active' : '' }, icon(link.icon), link.label))),
                h(
                    'div',
                    { className: 'admin__who' },
                    h('div', { className: 'row' }, h('span', { className: 'avatar' }, initials(user)), h('div', {}, h('strong', {}, `${user.name} ${user.last_name}`), h('p', { className: 'muted' }, user.email))),
                    h('a', { className: 'link', href: '#/' }, 'Volver al sitio'),
                    h('button', { className: 'btn btn--ghost btn--small', type: 'button', onClick: logout }, icon('logout'), 'Cerrar sesión')
                )
            ),
            h('main', { className: 'admin__main' }, content)
        )
    ];
};
