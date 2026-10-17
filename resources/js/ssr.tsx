import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { renderToString } from 'react-dom/server';
import { route, type RouteName } from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.tsx`,
                import.meta.glob('./Pages/**/*.tsx'),
            ) as any,
        setup: ({ App, props }) => {
            const ziggy = (page.props as any)?.ziggy;

            // @ts-expect-error global route helper for SSR environment
            global.route = (name: RouteName, params?: any, absolute?: boolean) =>
                route(
                    name,
                    params,
                    absolute,
                    ziggy
                        ? {
                              ...ziggy,
                              location: new URL(ziggy.location),
                          }
                        : undefined,
                );

            return <App {...props} />;
        },
    }),
);
