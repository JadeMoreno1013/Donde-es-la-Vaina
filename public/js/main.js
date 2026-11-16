import { SESSION_CHANGED_EVENT, SESSION_EXPIRED_EVENT } from './config.js';
import { clearSession } from './session.store.js';
import { showToast } from './ui/components.js';
import { renderRoute, startRouter } from './router.js';

window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    clearSession();
    showToast('Su sesión expiró, inicie sesión de nuevo', 'error');
    renderRoute();
});

window.addEventListener(SESSION_CHANGED_EVENT, renderRoute);

startRouter();
