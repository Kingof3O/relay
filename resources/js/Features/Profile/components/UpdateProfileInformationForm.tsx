import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Check, Mail, AtSign, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function UpdateProfileInformation({
    className = '',
}: {
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            username: user.username,
            email: user.email ?? '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <section className={`rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7 ${className}`}>
            <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                        <User className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">Profile Information</h2>
                        <p className="text-xs text-zinc-400">
                            Update your public display identity, system handle, and notification address.
                        </p>
                    </div>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#121318] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
                    <Sparkles className="h-3 w-3 text-violet-400" />
                    <span>Public Identity</span>
                </div>
            </header>

            {hasErrors && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <div className="space-y-0.5">
                        {Object.values(errors).map((err, i) => (
                            <p key={i}>{err}</p>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-5">
                {/* 2-Column Responsive Grid for Display Name & Username Handle */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Display Name */}
                    <div>
                        <InputLabel htmlFor="name" value="Display Name" />
                        <div className="relative mt-1.5">
                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                            <TextInput
                                id="name"
                                className="block w-full pl-9 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                                autoComplete="name"
                                placeholder="Your full name"
                            />
                        </div>
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    {/* Username Handle */}
                    <div>
                        <InputLabel htmlFor="username" value="Username Handle" />
                        <div className="relative mt-1.5">
                            <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                            <TextInput
                                id="username"
                                type="text"
                                className="block w-full pl-9 font-mono text-violet-300 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="handle (e.g. alex)"
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">
                            Identifier for mentions, task assignments, and activity logs.
                        </p>
                        <InputError className="mt-2" message={errors.username} />
                    </div>
                </div>

                {/* Email Address */}
                <div>
                    <InputLabel htmlFor="email" value="Email Address" />
                    <div className="relative mt-1.5">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                        <TextInput
                            id="email"
                            type="email"
                            className="block w-full pl-9 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="email"
                            placeholder="name@studio.relay"
                        />
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">
                        Transactional notifications, ticket alerts, and weekly digest emails will be sent here.
                    </p>
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Submission & Feedback */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
                    <PrimaryButton
                        disabled={processing}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-sm"
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Saving changes…</span>
                            </span>
                        ) : (
                            'Save Profile'
                        )}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>Profile updated successfully</span>
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
