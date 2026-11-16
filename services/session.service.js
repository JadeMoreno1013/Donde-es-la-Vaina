const { randomUUID } = require('crypto');
const AppError = require('../utils/app-error');
const pick = require('../utils/pick');
const userDao = require('../dao/user.dao');
const passwordService = require('./password.service');

const PUBLIC_USER_FIELDS = ['id_user', 'name', 'last_name', 'email', 'registration_date', 'is_admin'];

const activeSessions = new Map();

const create = async (credentials) => {
    const user = await userDao.findByEmail(credentials.email);
    const passwordMatches = user && await passwordService.verify(credentials.password, user.password);
    if (!passwordMatches) {
        throw new AppError(401, 'Credenciales inválidas');
    }
    const token = randomUUID();
    activeSessions.set(token, { id_user: user.id_user, is_admin: Boolean(user.is_admin) });
    return { token, user: pick(user, PUBLIC_USER_FIELDS) };
};

const find = (token) => activeSessions.get(token);

const destroy = (token) => {
    activeSessions.delete(token);
};

module.exports = { create, find, destroy };
