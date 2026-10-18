import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface OAuthProviderStatus {
    enabled: boolean;
    configured: boolean;
    has_override: boolean;
    client_id: string | null;
}

export interface OAuthProvidersCardProps {
    initialProviders?: Record<string, OAuthProviderStatus>;
}

export default function OAuthProvidersCard({
    initialProviders = {
        github: { enabled: false, configured: false, has_override: false, client_id: null },
        google: { enabled: false, configured: false, has_override: false, client_id: null },
    },
}: OAuthProvidersCardProps) {
    const [providers, setProviders] = useState<Record<string, OAuthProviderStatus>>(initialProviders);
    const [toggling, setToggling] = useState<string | null>(null);

    const toggleProvider = async (provider: 'github' | 'google') => {
        const current = providers[provider];
        const newEnabled = !current?.enabled;
        setToggling(provider);

        // Optimistic update
        setProviders((prev) => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                enabled: newEnabled,
            },
        }));

        try {
            const { data } = await axios.post(route('settings.oauth.toggle'), {
                provider,
                enabled: newEnabled,
            });

            if (data.oauthProviders) {
                setProviders(data.oauthProviders);
            }
            toast.success(
                `${provider === 'github' ? 'GitHub' : 'Google'} sign-in has been ${
                    newEnabled ? 'enabled' : 'disabled'
                }. ${newEnabled ? 'The button will now appear on the login page.' : 'The button is now hidden from the login page.'}`
            );
        } catch (err: any) {
            // Revert
            setProviders((prev) => ({
                ...prev,
                [provider]: current,
            }));
            const msg = err.response?.data?.message || `Failed to update ${provider} authentication status.`;
            toast.error(msg);
        } finally {
            setToggling(null);
        }
    };

    const providerList: Array<{
        id: 'github' | 'google';
        name: string;
        description: string;
        icon: React.ReactNode;
    }> = [
        {
            id: 'github',
            name: 'GitHub Authentication',
            description: 'Allow team members and developers to sign in with their GitHub account.',
            icon: (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                </svg>
            ),
        },
        {
            id: 'google',
            name: 'Google Workspace Authentication',
            description: 'Allow team members to sign in with their Google or G-Suite credentials.',
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <div className="rounded-2xl border border-zinc-800 bg-[#090a0f] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/80 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                        <h2 className="text-sm font-semibold text-zinc-100">
                            OAuth & Social Authentication
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                        Enable or disable third-party login providers. When a provider is disabled, its button is completely hidden from the sign-in page and incoming callbacks are rejected.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {providerList.map((item) => {
                    const status = providers[item.id] || {
                        enabled: false,
                        configured: false,
                        has_override: false,
                        client_id: null,
                    };
                    const isBusy = toggling === item.id;

                    return (
                        <div
                            key={item.id}
                            className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 ${
                                status.enabled
                                    ? 'border-zinc-700/80 bg-[#111216] shadow-sm'
                                    : 'border-zinc-800/80 bg-[#0c0d12]/60 opacity-80'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                                                status.enabled
                                                    ? 'border-zinc-700 bg-[#16171d] text-white'
                                                    : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                                            }`}
                                        >
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-zinc-200">
                                                {item.name}
                                            </h3>
                                            <p className="text-[10px] text-zinc-500">
                                                Provider key: <code className="font-mono text-zinc-400">{item.id}</code>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            status.enabled
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                                        }`}
                                    >
                                        {status.enabled ? (
                                            <>
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Visible on Login
                                            </>
                                        ) : (
                                            <>
                                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                                                Hidden from Login
                                            </>
                                        )}
                                    </span>
                                </div>

                                <p className="mt-3 text-xs text-zinc-400">
                                    {item.description}
                                </p>

                                <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
                                    {status.configured ? (
                                        <span className="flex items-center gap-1 text-emerald-400">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>Credentials configured</span>
                                            {status.client_id && (
                                                <span className="text-zinc-500">({status.client_id})</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-amber-400">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>Missing CLIENT_ID in .env</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Toggle Button */}
                            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                                <span className="text-[11px] text-zinc-400">
                                    {status.enabled ? 'Allowed for workspace sign-in' : 'Disabled & rejected'}
                                </span>

                                <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => toggleProvider(item.id)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 ${
                                        status.enabled ? 'bg-emerald-500' : 'bg-zinc-800'
                                    }`}
                                >
                                    <span className="sr-only">Toggle {item.name}</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            status.enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    >
                                        {isBusy && (
                                            <Loader2 className="h-3 w-3 animate-spin text-zinc-950" />
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
