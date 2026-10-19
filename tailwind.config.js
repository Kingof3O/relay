import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'Figtree', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                zinc: {
                    750: '#333338',
                    850: '#1f1f23',
                    925: '#111114',
                },
                obsidian: {
                    DEFAULT: '#07090e',
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#07090e',
                    surface: '#0b0f19',
                    panel: '#0d1322',
                    card: '#111827',
                    cardHover: '#151e32',
                    border: 'rgba(255, 255, 255, 0.08)',
                    borderHover: 'rgba(255, 255, 255, 0.16)',
                },
            },
            boxShadow: {
                'specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
                'specular-lg': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14)',
                'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
                'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
                'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
                'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
            },
        },
    },

    plugins: [forms],
};
