import { LOW_STOCK_RATIO } from '../config.js';

export const getEventState = (event) => {
    if (event.status === 'cancelled') {
        return { key: 'cancelled', label: 'Cancelado', canBuy: false };
    }
    if (event.status === 'finished' || new Date(event.event_date) <= new Date()) {
        return { key: 'finished', label: 'Finalizado', canBuy: false };
    }
    if (event.available_tickets === 0) {
        return { key: 'soldOut', label: 'Agotado', canBuy: false };
    }
    if (event.available_tickets <= event.event_capacity * LOW_STOCK_RATIO) {
        return { key: 'lowStock', label: 'Últimas entradas', canBuy: true };
    }
    return { key: 'available', label: 'Disponible', canBuy: true };
};
