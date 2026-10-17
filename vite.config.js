import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/recharts')) {
                        return 'vendor-charts';
                    }
                    if (id.includes('node_modules/@hello-pangea/dnd')) {
                        return 'vendor-dnd';
                    }
                    if (
                        id.includes('node_modules/lucide-react') ||
                        id.includes('node_modules/sonner') ||
                        id.includes('node_modules/@headlessui/react') ||
                        id.includes('node_modules/cmdk')
                    ) {
                        return 'vendor-ui';
                    }
                },
            },
        },
    },
});
