import { ZONE_NAMES } from '../config.js';

export const getZoneOptions = (event) => {
    const middle = Math.round((event.price_min + event.price_max) / 2);
    const prices = [event.price_min, middle, event.price_max];
    const options = ZONE_NAMES.map((name, index) => ({ name, price: prices[index] }));
    return event.price_min === event.price_max ? options.slice(0, 1) : options;
};
