export const LOCALE = 'es-CO';

export const STORAGE_KEYS = {
    token: 'vaina.token',
    user: 'vaina.user',
    redirect: 'vaina.redirect'
};

export const SESSION_EXPIRED_EVENT = 'session:expired';
export const SESSION_CHANGED_EVENT = 'session:changed';
export const POLL_INTERVAL_MS = 10000;
export const TOAST_DURATION_MS = 4000;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
export const LOW_STOCK_RATIO = 0.1;
export const FEATURED_EVENTS_COUNT = 4;
export const SALES_CHART_DAYS = 7;
export const RECENT_SALES_COUNT = 5;
export const MS_PER_DAY = 86400000;
export const MAX_RATING = 5;
export const ZONE_NAMES = ['General', 'Preferencial', 'VIP'];

export const EVENT_TYPES = {
    concert: { label: 'Concierto', plural: 'Conciertos', color: '#7c3aed' },
    sports: { label: 'Deporte', plural: 'Deportes', color: '#16a34a' },
    theater: { label: 'Teatro', plural: 'Teatro', color: '#ea580c' }
};
