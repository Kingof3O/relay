import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        axios: typeof axios;
        Pusher: typeof Pusher;
        Echo?: Echo<any>;
    }
}

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

window.Pusher = Pusher;

if (typeof window !== 'undefined') {
    const getMeta = (name: string): string | undefined => {
        const el = document.querySelector(`meta[name="${name}"]`);
        return el ? (el.getAttribute('content') || undefined) : undefined;
    };

    const reverbKey = import.meta.env.VITE_REVERB_APP_KEY || getMeta('reverb-key') || 'relay_app_key_8124';
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;

    if (reverbKey) {
        const wsHost = import.meta.env.VITE_REVERB_HOST || getMeta('reverb-host') || window.location.hostname;
        const wsScheme = import.meta.env.VITE_REVERB_SCHEME || getMeta('reverb-scheme') || (window.location.protocol === 'https:' ? 'https' : 'http');
        const forceTLS = wsScheme === 'https' || window.location.protocol === 'https:';
        const portMeta = import.meta.env.VITE_REVERB_PORT || getMeta('reverb-port');
        const port = portMeta ? Number(portMeta) : (forceTLS ? 443 : 80);

        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: reverbKey,
            wsHost: wsHost,
            wsPort: port,
            wssPort: port,
            forceTLS: forceTLS,
            enabledTransports: ['ws', 'wss'],
        });
    } else if (pusherKey) {
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: pusherKey,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
            wsHost: import.meta.env.VITE_PUSHER_HOST || `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
            wsPort: import.meta.env.VITE_PUSHER_PORT ? Number(import.meta.env.VITE_PUSHER_PORT) : 80,
            wssPort: import.meta.env.VITE_PUSHER_PORT ? Number(import.meta.env.VITE_PUSHER_PORT) : 443,
            forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });
    }
}
