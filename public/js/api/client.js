import { SESSION_EXPIRED_EVENT } from '../config.js';
import { getToken } from '../session.store.js';

class ApiError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

const buildUrl = (path, query = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, value);
        }
    });
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
};

const request = async (method, path, { body, query } = {}) => {
    const token = getToken();
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    let response;
    try {
        response = await fetch(buildUrl(path, query), {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    } catch {
        throw new ApiError(0, 'No se pudo conectar con el servidor');
    }
    if (response.status === 204) {
        return null;
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        if (response.status === 401 && token) {
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        throw new ApiError(response.status, data?.error ?? 'Error inesperado del servidor', data?.details);
    }
    return data;
};

export const api = {
    get: (path, query) => request('GET', path, { query }),
    post: (path, body) => request('POST', path, { body }),
    put: (path, body) => request('PUT', path, { body }),
    patch: (path, body) => request('PATCH', path, { body }),
    delete: (path) => request('DELETE', path)
};
