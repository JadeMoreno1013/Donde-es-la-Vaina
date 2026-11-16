import { LOCALE } from '../config.js';

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const numberFormatter = new Intl.NumberFormat(LOCALE);

export const formatDate = (value) => dateFormatter.format(new Date(value));

export const formatShortDate = (value) => shortDateFormatter.format(new Date(value));

export const countLabel = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

export const formatDateTime = (value) => dateTimeFormatter.format(new Date(value));

export const formatPrice = (value) => `$${numberFormatter.format(value)}`;

const pad = (number) => String(number).padStart(2, '0');

export const toDateInput = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const toTimeInput = (value) => {
    const date = new Date(value);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toApiDateTime = (dateText, timeText) => `${dateText} ${timeText}:00`;

export const initials = (user) => `${user.name[0]}${user.last_name[0]}`.toUpperCase();
