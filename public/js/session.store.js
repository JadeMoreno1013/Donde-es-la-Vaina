import { STORAGE_KEYS } from './config.js';

const stores = [localStorage, sessionStorage];

const readFrom = (store) => {
    const token = store.getItem(STORAGE_KEYS.token);
    const user = store.getItem(STORAGE_KEYS.user);
    return token && user ? { token, user: JSON.parse(user) } : null;
};

export const getSession = () => stores.map(readFrom).find(Boolean) ?? null;

export const getToken = () => getSession()?.token ?? null;

export const isAdmin = () => Boolean(getSession()?.user.is_admin);

export const clearSession = () => {
    stores.forEach((store) => {
        store.removeItem(STORAGE_KEYS.token);
        store.removeItem(STORAGE_KEYS.user);
    });
};

export const saveSession = ({ token, user }, remember) => {
    clearSession();
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEYS.token, token);
    store.setItem(STORAGE_KEYS.user, JSON.stringify(user));
};

export const rememberRedirect = (hash) => sessionStorage.setItem(STORAGE_KEYS.redirect, hash);

export const takeRedirect = () => {
    const hash = sessionStorage.getItem(STORAGE_KEYS.redirect);
    sessionStorage.removeItem(STORAGE_KEYS.redirect);
    return hash;
};
