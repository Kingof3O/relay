import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

router.on('httpException', (event) => {
    const status = (event.detail.response as any)?.status;
    if (status === 419) {
        event.preventDefault();
        window.location.reload();
    }
});

function getInitialPage() {
    if (typeof window === 'undefined') return undefined;

    // 1. Inertia v2/v3 script element
    const scriptEl = document.querySelector<HTMLScriptElement>(
        'script[data-page="app"][type="application/json"]'
    );
    if (scriptEl?.textContent) {
        try {
            return JSON.parse(scriptEl.textContent);
        } catch {
            // fallback
        }
    }

    // 2. Inertia v1 data-page attribute on root div
    const appEl = document.getElementById('app');
    if (appEl?.dataset?.page) {
        try {
            return JSON.parse(appEl.dataset.page);
        } catch {
            // fallback
        }
    }

    return undefined;
}

function initApp() {
    const initialPage = getInitialPage();

    // If no Inertia page payload is present (e.g. non-Inertia or error page), avoid unhandled exception
    if (typeof window !== 'undefined' && !initialPage) {
        return;
    }

    createInertiaApp({
        title: (title) => `${title} - ${appName}`,
        ...(initialPage ? { page: initialPage } : {}),
        resolve: async (name) => {
            const pages = import.meta.glob('./Pages/**/*.tsx') as unknown as Record<
                string,
                () => Promise<{ default: ComponentType }>
            >;
            const page = await resolvePageComponent<{ default: ComponentType }>(
                `./Pages/${name}.tsx`,
                pages,
            );
            return page.default ?? (page as unknown as ComponentType);
        },
        setup({ el, App, props }) {
            if (!el) return;
            const root = createRoot(el);
            root.render(<App {...props} />);
        },
        progress: {
            color: '#3b82f6',
        },
    });
}

if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp(), { once: true });
} else {
    initApp();
}
