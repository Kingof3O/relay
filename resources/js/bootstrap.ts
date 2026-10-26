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
        const val = el ? (el.getAttribute('content') || undefined) : undefined;
        return val && val.trim().length > 0 ? val.trim() : undefined;
    };

    const isHttps = window.location.protocol === 'https:';
    const reverbKey = getMeta('reverb-key') || (import.meta.env.VITE_REVERB_APP_KEY as string | undefined);
    const pusherKey = getMeta('pusher-key') || (import.meta.env.VITE_PUSHER_APP_KEY as string | undefined);

    if (reverbKey) {
        // Dynamic runtime discovery: use meta tag if provided, otherwise default to current browser host
        const wsHost = getMeta('reverb-host') || window.location.hostname;
        const wsScheme = getMeta('reverb-scheme') || (isHttps ? 'https' : 'http');
        const forceTLS = wsScheme === 'https' || isHttps;
        const portMeta = getMeta('reverb-port');
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
        const pusherCluster = getMeta('pusher-cluster') || (import.meta.env.VITE_PUSHER_APP_CLUSTER as string | undefined) || 'mt1';
        const pusherHost = getMeta('pusher-host') || (import.meta.env.VITE_PUSHER_HOST as string | undefined) || `ws-${pusherCluster}.pusher.com`;
        const pusherPortMeta = getMeta('pusher-port') || (import.meta.env.VITE_PUSHER_PORT as string | undefined);
        const pusherPort = pusherPortMeta ? Number(pusherPortMeta) : (isHttps ? 443 : 80);

        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: pusherKey,
            cluster: pusherCluster,
            wsHost: pusherHost,
            wsPort: pusherPort,
            wssPort: pusherPort,
            forceTLS: isHttps,
            enabledTransports: ['ws', 'wss'],
        });
    }
}
