import { purchasesApi, usersApi } from '../../api/resources.js';
import { getSession } from '../../session.store.js';
import { h } from '../../ui/dom.js';
import { badge, confirmDialog, icon, renderAsync, showToast } from '../../ui/components.js';
import { dataTable, pageHeader } from '../../ui/admin-components.js';
import { countLabel, formatDate, initials } from '../../ui/format.js';

const runAction = async (action, successMessage, reload) => {
    try {
        await action();
        showToast(successMessage);
        reload();
    } catch (error) {
        showToast(error.message, 'error');
    }
};

const toggleAdmin = async (user, reload) => {
    const message = user.is_admin ? `¿Quitar el rol de administrador a ${user.name}?` : `¿Dar el rol de administrador a ${user.name}?`;
    if (await confirmDialog(message, 'Confirmar')) {
        runAction(() => usersApi.update(user.id_user, { is_admin: !user.is_admin }), 'Rol actualizado', reload);
    }
};

const deleteUser = async (user, reload) => {
    if (await confirmDialog(`¿Desea eliminar a ${user.name} ${user.last_name}?`)) {
        runAction(() => usersApi.remove(user.id_user), 'Usuario eliminado', reload);
    }
};

const usersTable = (users, ticketsByUser, reload) => {
    const currentId = getSession().user.id_user;
    return dataTable(
        [
            { header: 'Usuario', cell: (user) => h('div', { className: 'row' }, h('span', { className: 'avatar' }, initials(user)), h('span', {}, `${user.name} ${user.last_name}`, h('br'), h('small', { className: 'muted' }, user.email))) },
            { header: 'Rol', cell: (user) => (user.is_admin ? badge('Admin', 'admin') : badge('Usuario', 'finished')) },
            { header: 'Registro', cell: (user) => formatDate(user.registration_date) },
            { header: 'Entradas', cell: (user) => String(ticketsByUser.get(user.id_user) ?? 0) },
            {
                header: 'Acciones',
                cell: (user) => h(
                    'div',
                    { className: 'table__actions' },
                    h('button', { className: 'icon-btn', type: 'button', disabled: user.id_user === currentId, 'aria-label': 'Cambiar rol', onClick: () => toggleAdmin(user, reload) }, icon('shield')),
                    h('button', { className: 'icon-btn', type: 'button', disabled: user.id_user === currentId, 'aria-label': 'Eliminar usuario', onClick: () => deleteUser(user, reload) }, icon('trash'))
                )
            }
        ],
        users,
        'No hay usuarios que coincidan con la búsqueda'
    );
};

const usersView = ({ users, ticketsByUser }, reload) => {
    const tableHolder = h('div');
    const paint = (text) => {
        const term = text.trim().toLowerCase();
        const visible = users.filter((user) => `${user.name} ${user.last_name} ${user.email}`.toLowerCase().includes(term));
        tableHolder.replaceChildren(usersTable(visible, ticketsByUser, reload));
    };
    const search = h('input', { type: 'search', placeholder: 'Buscar usuario por nombre o email', 'aria-label': 'Buscar usuario', onInput: () => paint(search.value) });
    paint('');
    return h('div', { className: 'stack' }, pageHeader('Usuarios', `${countLabel(users.length, 'usuario', 'usuarios')} en total`), h('div', { className: 'field' }, search), tableHolder);
};

export const usersPage = () => {
    const container = h('div', { className: 'stack' });
    renderAsync(
        container,
        async () => {
            const [users, purchases] = await Promise.all([usersApi.list(), purchasesApi.list()]);
            const ticketsByUser = new Map();
            purchases.forEach((purchase) => ticketsByUser.set(purchase.app_user_id, (ticketsByUser.get(purchase.app_user_id) ?? 0) + purchase.ticket_count));
            return { users, ticketsByUser };
        },
        usersView
    );
    return container;
};
