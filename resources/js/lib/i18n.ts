/**
 * Relay Studio Lightweight Localization (i18n) Helper
 */

import { usePage } from '@inertiajs/react';

type TranslationDictionary = Record<string, any>;

let cachedTranslations: TranslationDictionary | null = null;

/**
 * Extract translations from the DOM or memory cache.
 */
export function getTranslations(): TranslationDictionary {
    if (cachedTranslations) {
        return cachedTranslations;
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
            const appElement = document.getElementById('app');
            if (appElement?.dataset?.page) {
                const parsed = JSON.parse(appElement.dataset.page);
                cachedTranslations = parsed?.props?.translations || parsed?.props?.i18n?.translations || {};
                return cachedTranslations ?? {};
            }
        } catch {
            // Silently fall through to empty dictionary
        }
    }

    return {};
}

/**
 * Explicitly set or extend current translations dictionary.
 */
export function setTranslations(translations: TranslationDictionary): void {
    cachedTranslations = {
        ...(cachedTranslations ?? {}),
        ...translations,
    };
}

/**
 * Resolve a dot-notated key from a dictionary.
 */
function resolveKey(dict: TranslationDictionary, key: string): string | undefined {
    const segments = key.split('.');
    let current: any = dict;

    for (const segment of segments) {
        if (current && typeof current === 'object' && segment in current) {
            current = current[segment];
        } else {
            return undefined;
        }
    }

    return typeof current === 'string' ? current : undefined;
}

/**
 * Translates a key using the shared translations dictionary.
 * Supports dot notation: t('status.statuses.doing', 'In Progress')
 *
 * @param key The dot-notated translation key
 * @param fallback Optional fallback string if the key cannot be resolved
 * @returns The resolved translated string or the fallback / key itself
 */
export function t(key: string, fallback?: string): string {
    const dict = getTranslations();
    const resolved = resolveKey(dict, key);

    if (resolved !== undefined) {
        return resolved;
    }

    return fallback !== undefined ? fallback : key;
}

/**
 * React hook to access translations directly from Inertia PageProps.
 */
export function useTranslation() {
    let pageProps: any;

    try {
        pageProps = usePage().props;
    } catch {
        // Rendered outside of Inertia context
    }

    const dict = pageProps?.translations || pageProps?.i18n?.translations || getTranslations();

    const translate = (key: string, fallback?: string): string => {
        const resolved = resolveKey(dict, key);
        if (resolved !== undefined) {
            return resolved;
        }
        return fallback !== undefined ? fallback : key;
    };

    return {
        t: translate,
        locale: (pageProps?.locale || pageProps?.i18n?.locale || 'en') as string,
        translations: dict,
    };
}

export default t;
