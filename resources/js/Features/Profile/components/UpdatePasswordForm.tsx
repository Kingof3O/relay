import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useRef, useState } from 'react';
import {
    KeyRound,
    Check,
    Shield,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Circle,
    Sparkles,
} from 'lucide-react';

interface StrengthResult {
    score: number; // 0 to 4
    label: string;
    widthClass: string;
    barColor: string;
    textColor: string;
}

function calculateStrength(pwd: string): StrengthResult {
    if (!pwd) {
        return {
            score: 0,
            label: 'None',
            widthClass: 'w-0',
            barColor: 'bg-zinc-700',
            textColor: 'text-zinc-500',
        };
    }

    let points = 0;
    if (pwd.length >= 8) points++;
    if (pwd.length >= 12) points++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) points++;
    if (/\d/.test(pwd)) points++;
    if (/[^A-Za-z0-9]/.test(pwd)) points++;

    let score: number;
    if (points >= 5) score = 4;
    else if (points >= 3) score = 3;
    else if (points >= 2) score = 2;
    else score = 1;

    switch (score) {
        case 1:
            return {
                score: 1,
                label: 'Weak',
                widthClass: 'w-1/4',
                barColor: 'bg-rose-500',
                textColor: 'text-rose-400',
            };
        case 2:
            return {
                score: 2,
                label: 'Fair',
                widthClass: 'w-2/4',
                barColor: 'bg-amber-500',
                textColor: 'text-amber-400',
            };
        case 3:
            return {
                score: 3,
                label: 'Good',
                widthClass: 'w-3/4',
                barColor: 'bg-cyan-500',
                textColor: 'text-cyan-400',
            };
        case 4:
            return {
                score: 4,
                label: 'Strong',
                widthClass: 'w-full',
                barColor: 'bg-emerald-500',
                textColor: 'text-emerald-400',
            };
        default:
            return {
                score: 1,
                label: 'Weak',
                widthClass: 'w-1/4',
                barColor: 'bg-rose-500',
                textColor: 'text-rose-400',
            };
    }
}

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const strength = useMemo(() => calculateStrength(data.password), [data.password]);

    const reqs = useMemo(() => {
        return {
            length: data.password.length >= 8,
            mixed: /[a-z]/.test(data.password) && /[A-Z]/.test(data.password),
            numberOrSymbol: /[\d\W]/.test(data.password),
            matches:
                data.password.length > 0 &&
                data.password === data.password_confirmation,
        };
    }, [data.password, data.password_confirmation]);

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const hasErrors = Boolean(errors.current_password || errors.password || errors.password_confirmation);

    return (
        <section className={`rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7 ${className}`}>
            <header className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                        <KeyRound className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">Security & Credentials</h2>
                        <p className="text-xs text-zinc-400">
                            Ensure your account credentials are secured with a high-entropy passphrase.
                        </p>
                    </div>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#121318] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
                    <Shield className="h-3 w-3 text-cyan-400" />
                    <span>Argon2id Hash</span>
                </div>
            </header>

            {hasErrors && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <div className="space-y-0.5">
                        {errors.current_password && <p>{errors.current_password}</p>}
                        {errors.password && <p>{errors.password}</p>}
                        {errors.password_confirmation && <p>{errors.password_confirmation}</p>}
                    </div>
                </div>
            )}

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                {/* Current Password */}
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" />
                    <div className="relative mt-1.5">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="block w-full pl-9 pr-10 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]"
                            autoComplete="current-password"
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                {/* 2-Column Responsive Grid for New Password & Confirm Password */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* New Password */}
                    <div>
                        <InputLabel htmlFor="password" value="New Passphrase" />
                        <div className="relative mt-1.5">
                            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                            <TextInput
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type={showNewPassword ? 'text' : 'password'}
                                className="block w-full pl-9 pr-10 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]"
                                autoComplete="new-password"
                                placeholder="Minimum 8 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirm New Passphrase" />
                        <div className="relative mt-1.5">
                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                            <TextInput
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="block w-full pl-9 pr-10 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]"
                                autoComplete="new-password"
                                placeholder="Re-enter new passphrase"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                {/* Real-time Password Strength Meter Bar */}
                {data.password && (
                    <div className="rounded-lg border border-zinc-800/80 bg-[#090a0f] p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-zinc-400">Password Entropy Strength:</span>
                            <span className={`font-bold uppercase tracking-wider ${strength.textColor}`}>
                                {strength.label}
                            </span>
                        </div>
                        {/* 4 Segmented Strength Indicators */}
                        <div className="grid grid-cols-4 gap-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    strength.score >= 1 ? strength.barColor : 'bg-zinc-800'
                                }`}
                            />
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    strength.score >= 2 ? strength.barColor : 'bg-zinc-800'
                                }`}
                            />
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    strength.score >= 3 ? strength.barColor : 'bg-zinc-800'
                                }`}
                            />
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    strength.score >= 4 ? strength.barColor : 'bg-zinc-800'
                                }`}
                            />
                        </div>
                    </div>
                )}

                {/* Password Requirements Checklist */}
                <div className="rounded-xl border border-zinc-800/80 bg-[#090a0f] p-4 space-y-2.5 text-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Requirements Checklist
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                            {reqs.length ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                                <Circle className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                            <span className={reqs.length ? 'font-medium text-zinc-200' : 'text-zinc-500'}>
                                At least 8 characters
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {reqs.mixed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                                <Circle className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                            <span className={reqs.mixed ? 'font-medium text-zinc-200' : 'text-zinc-500'}>
                                Upper & lowercase letters
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {reqs.numberOrSymbol ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                                <Circle className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                            <span className={reqs.numberOrSymbol ? 'font-medium text-zinc-200' : 'text-zinc-500'}>
                                Number or symbol
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {reqs.matches ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                                <Circle className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                            <span className={reqs.matches ? 'font-medium text-zinc-200' : 'text-zinc-500'}>
                                Passphrases match
                            </span>
                        </div>
                    </div>
                </div>

                {/* Submit & Status */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
                    <PrimaryButton
                        disabled={processing}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-sm"
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Updating credentials…</span>
                            </span>
                        ) : (
                            'Update Password'
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
                            <span>Password updated successfully</span>
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
