import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    AccountTelemetryCard,
    NotificationPreferencesCard,
    TwoFactorSecurityCard,
    UpdatePasswordForm,
    UpdateProfileInformationForm,
    VisualIdentityHero,
} from '@/Features/Profile';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export interface ProfileEditProps {
    stats?: {
        assigned_count: number;
        completed_count: number;
    };
    twoFactorEnabled?: boolean;
}

export default function Edit({ stats, twoFactorEnabled = false }: ProfileEditProps) {
    const pageProps = usePage<PageProps>().props;
    const alertMessage = pageProps.flash?.alert || (pageProps.auth?.user?.force_password_reset ? 'Please update your default password to secure your account.' : null);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-semibold uppercase tracking-wider text-zinc-400">
                                Account
                            </span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-500">Identity & Security</span>
                        </div>
                        <h1 className="mt-1 text-lg font-semibold text-zinc-100">
                            Studio Profile & Credentials
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 font-medium text-zinc-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Identity Verified · Active Session</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Profile & Security · Studio Account" />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {alertMessage && (
                    <div className="flex items-center gap-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 shadow-lg shadow-amber-500/5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/20 text-amber-400">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-amber-200 uppercase tracking-wider">Security Notice</div>
                            <div className="text-xs text-amber-300/90 mt-0.5">{alertMessage}</div>
                        </div>
                    </div>
                )}

                {/* Full-width Visual Identity Hero Banner across the top */}
                <VisualIdentityHero stats={stats} />

                {/* 12-Column Responsive Workspace Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Column (lg:col-span-4 space-y-6): Account Telemetry & Identity Card */}
                    <div className="space-y-6 lg:col-span-4">
                        <AccountTelemetryCard stats={stats} />
                    </div>

                    {/* Right Column (lg:col-span-8 space-y-6): Full-width Form Sections */}
                    <div className="space-y-6 lg:col-span-8">
                        <UpdateProfileInformationForm />
                        <TwoFactorSecurityCard initialEnabled={twoFactorEnabled} />
                        <NotificationPreferencesCard />
                        <UpdatePasswordForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
