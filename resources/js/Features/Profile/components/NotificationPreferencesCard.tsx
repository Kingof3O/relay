import React, { FormEventHandler } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Bell, Mail, Check, UserCheck, RefreshCw, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationPreferencesCard({
    className = '',
}: {
    className?: string;
}) {
    const user = usePage().props.auth.user as any;
    const existingPrefs = user.notification_preferences || {};

    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        notification_preferences: {
            email_on_assignment: existingPrefs.email_on_assignment !== false,
            email_on_status_change: existingPrefs.email_on_status_change !== false,
            email_on_comment: existingPrefs.email_on_comment !== false,
        },
    });

    const handleToggle = (key: 'email_on_assignment' | 'email_on_status_change' | 'email_on_comment') => {
        setData('notification_preferences', {
            ...data.notification_preferences,
            [key]: !data.notification_preferences[key],
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Notification preferences updated successfully');
            },
        });
    };

    const toggles = [
        {
            key: 'email_on_assignment' as const,
            label: 'Email on Assignment',
            description: 'Receive email alerts whenever work requests or issues are assigned directly to your account.',
            icon: UserCheck,
            enabled: data.notification_preferences.email_on_assignment,
        },
        {
            key: 'email_on_status_change' as const,
            label: 'Email on Status Change',
            description: 'Receive notifications when your assigned or requested items change state (e.g. In Review, Done, Blocked).',
            icon: RefreshCw,
            enabled: data.notification_preferences.email_on_status_change,
        },
        {
            key: 'email_on_comment' as const,
            label: 'Email on New Comment / Mention',
            description: 'Receive email notifications when team members comment on your tickets or tag you via @mentions.',
            icon: MessageSquare,
            enabled: data.notification_preferences.email_on_comment,
        },
    ];

    return (
        <section className={`rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7 ${className}`}>
            <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-200">
                        <Bell className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">Notification Preferences</h2>
                        <p className="text-xs text-zinc-400">
                            Configure transactional email delivery rules for your workspace activities.
                        </p>
                    </div>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#121318] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 font-mono">
                    <Mail className="h-3 w-3 text-zinc-400" />
                    <span>Transactional Engine</span>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="divide-y divide-zinc-800/60 rounded-lg border border-zinc-800/80 bg-[#111216]">
                    {toggles.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.key}
                                className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-850/30"
                            >
                                <div className="flex items-start gap-3.5 pr-4">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-zinc-200">
                                            {item.label}
                                        </span>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={item.enabled}
                                    onClick={() => handleToggle(item.key)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0c0d12] ${
                                        item.enabled ? 'bg-violet-600' : 'bg-zinc-800'
                                    }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                            item.enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="flex items-center gap-2">
                        {processing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Check className="h-3.5 w-3.5" />
                        )}
                        <span>Save Preferences</span>
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-200"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <p className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <Check className="h-3.5 w-3.5" />
                            <span>Saved successfully.</span>
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
