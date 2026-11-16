const wrap = (shapes, fill = 'none') => `<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes}</svg>`;

const STAR = '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>';

export const icons = {
    calendar: wrap('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    pin: wrap('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    trash: wrap('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    edit: wrap('<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'),
    plus: wrap('<path d="M12 5v14M5 12h14"/>'),
    star: wrap(STAR),
    starFilled: wrap(STAR, 'currentColor'),
    close: wrap('<path d="M6 6l12 12M18 6L6 18"/>'),
    user: wrap('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
    ticket: wrap('<path d="M3 8a2 2 0 0 0 0 8v3h18v-3a2 2 0 0 1 0-8V5H3v3z"/>'),
    chart: wrap('<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'),
    dashboard: wrap('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
    logout: wrap('<path d="M9 4H4v16h5M16 8l4 4-4 4M20 12H9"/>'),
    chevron: wrap('<path d="M6 9l6 6 6-6"/>'),
    shield: wrap('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>')
};
