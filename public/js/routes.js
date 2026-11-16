import { homePage } from './pages/home.page.js';
import { catalogPage } from './pages/catalog.page.js';
import { eventDetailPage } from './pages/event-detail.page.js';
import { loginPage, registerPage, adminLoginPage } from './pages/auth.pages.js';
import { myTicketsPage } from './pages/my-tickets.page.js';
import { myReviewsPage } from './pages/my-reviews.page.js';
import { dashboardPage } from './pages/admin/dashboard.page.js';
import { adminEventsPage } from './pages/admin/events.page.js';
import { eventFormPage } from './pages/admin/event-form.page.js';
import { salesPage } from './pages/admin/sales.page.js';
import { usersPage } from './pages/admin/users.page.js';

export const routes = [
    { path: '/', page: homePage, layout: 'public' },
    { path: '/events', page: catalogPage, layout: 'public' },
    { path: '/events/:id', page: eventDetailPage, layout: 'public' },
    { path: '/login', page: loginPage, layout: 'auth', access: 'guest' },
    { path: '/admin/login', page: adminLoginPage, layout: 'adminAuth', access: 'admin-guest' },
    { path: '/register', page: registerPage, layout: 'auth', access: 'guest' },
    { path: '/my-tickets', page: myTicketsPage, layout: 'public', access: 'user' },
    { path: '/my-reviews', page: myReviewsPage, layout: 'public', access: 'user' },
    { path: '/admin', page: dashboardPage, layout: 'admin', access: 'admin' },
    { path: '/admin/events', page: adminEventsPage, layout: 'admin', access: 'admin' },
    { path: '/admin/events/new', page: eventFormPage, layout: 'admin', access: 'admin' },
    { path: '/admin/events/:id/edit', page: eventFormPage, layout: 'admin', access: 'admin' },
    { path: '/admin/sales', page: salesPage, layout: 'admin', access: 'admin' },
    { path: '/admin/users', page: usersPage, layout: 'admin', access: 'admin' }
];
