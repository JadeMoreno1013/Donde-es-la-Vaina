import { rememberRedirect, getSession, isAdmin } from './session.store.js';
import { showToast, emptyState } from './ui/components.js';
import { h } from './ui/dom.js';
import { publicLayout, authLayout, adminAuthLayout, adminLayout } from './ui/layouts.js';
import { routes } from './routes.js';

const layouts = { public: publicLayout, auth: authLayout, admin: adminLayout, adminAuth: adminAuthLayout };
const cleanups = [];

const compiledRoutes = routes.map((route) => {
    const names = [];
    const pattern = route.path.replace(/:(\w+)/g, (_, name) => {
        names.push(name);
        return '(\\d+)';
    });
    return { ...route, names, regex: new RegExp(`^${pattern}$`) };
});

const resolve = (pathname) => {
    for (const route of compiledRoutes) {
        const match = pathname.match(route.regex);
        if (match) {
            return { route, params: Object.fromEntries(route.names.map((name, index) => [name, Number(match[index + 1])])) };
        }
    }
    return null;
};

const redirect = (hash) => {
    window.location.hash = hash;
};

const checkAccess = (access) => {
    const session = getSession();
    if ((access === 'user' || access === 'admin') && !session) {
        rememberRedirect(window.location.hash);
        redirect(access === 'admin' ? '#/admin/login' : '#/login');
        return false;
    }
    if (access === 'admin-guest' && session) {
        redirect(isAdmin() ? '#/admin' : '#/');
        return false;
    }
    if (access === 'admin' && !isAdmin()) {
        showToast('No tiene permisos para acceder al panel', 'error');
        redirect('#/');
        return false;
    }
    if (access === 'guest' && session) {
        redirect('#/');
        return false;
    }
    return true;
};

export const renderRoute = () => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
    const [pathname, queryString = ''] = (window.location.hash.slice(1) || '/').split('?');
    const match = resolve(pathname);
    const app = document.getElementById('app');
    if (!match) {
        app.replaceChildren(...publicLayout(h('div', { className: 'container section' }, emptyState('La página que busca no existe')), pathname));
        return;
    }
    if (!checkAccess(match.route.access)) {
        return;
    }
    const context = { params: match.params, query: new URLSearchParams(queryString), onLeave: (cleanup) => cleanups.push(cleanup) };
    app.replaceChildren(...layouts[match.route.layout](match.route.page(context), pathname));
    window.scrollTo(0, 0);
};

export const startRouter = () => {
    window.addEventListener('hashchange', renderRoute);
    renderRoute();
};
