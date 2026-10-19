import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { ShieldCheck, KeyRound, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const codeInput = useRef<HTMLInputElement>(null);
    const recoveryCodeInput = useRef<HTMLInputElement>(null);

    const toggleRecovery = () => {
        setRecovery(!recovery);
        reset('code', 'recovery_code');
        setTimeout(() => {
            if (!recovery) {
                recoveryCodeInput.current?.focus();
            } else {
                codeInput.current?.focus();
            }
        }, 100);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('two-factor.login.store'), {
            onFinish: () => reset('code', 'recovery_code'),
        });
    };

    return (
        <div className="relative flex min-h-screen w-full bg-[#08090d] text-zinc-100 selection:bg-indigo-500/30 selection:text-white">
            <Head title="Two-Factor Verification · Relay Studio" />

            <div className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-y-auto bg-[#090a0f] p-6 sm:p-10">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-600/[0.05] to-transparent blur-[120px]" />
                </div>

                <div className="relative z-10 w-full max-w-[400px] space-y-6">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111216] p-2.5 shadow-2xl">
                            <ShieldCheck className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-white">
                                Two-Factor Verification
                            </h2>
                            <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xs">
                                {!recovery
                                    ? 'Enter the 6-digit verification code from your authenticator application.'
                                    : 'Enter one of your emergency backup recovery codes to access your account.'}
                            </p>
                        </div>
                    </div>

                    {/* Challenge Card */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111217]/80 p-6 shadow-2xl backdrop-blur-xl">
                        <form onSubmit={submit} className="space-y-5">
                            {!recovery ? (
                                <div>
                                    <InputLabel htmlFor="code" value="Authentication Code" className="text-xs text-zinc-400 font-medium" />
                                    <div className="relative mt-1.5">
                                        <TextInput
                                            id="code"
                                            ref={codeInput}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            name="code"
                                            value={data.code}
                                            className="block w-full rounded-xl border border-white/[0.08] bg-[#16171f] px-4 py-2.5 text-center text-xl font-mono tracking-[0.4em] text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                                            placeholder="000000"
                                            autoFocus
                                            autoComplete="one-time-code"
                                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <InputError message={errors.code} className="mt-2 text-xs" />
                                </div>
                            ) : (
                                <div>
                                    <InputLabel htmlFor="recovery_code" value="Recovery Code" className="text-xs text-zinc-400 font-medium" />
                                    <div className="relative mt-1.5">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                            <KeyRound className="h-4 w-4" />
                                        </div>
                                        <TextInput
                                            id="recovery_code"
                                            ref={recoveryCodeInput}
                                            type="text"
                                            name="recovery_code"
                                            value={data.recovery_code}
                                            className="block w-full rounded-xl border border-white/[0.08] bg-[#16171f] pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                                            placeholder="xxxxx-xxxxx"
                                            autoFocus
                                            autoComplete="off"
                                            onChange={(e) => setData('recovery_code', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.recovery_code} className="mt-2 text-xs" />
                                </div>
                            )}

                            <PrimaryButton
                                className="w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 transition-all duration-200"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </PrimaryButton>

                            <div className="flex flex-col items-center gap-3 pt-2 text-center text-xs">
                                <button
                                    type="button"
                                    onClick={toggleRecovery}
                                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                >
                                    {!recovery ? 'Use an emergency recovery code' : 'Use an authenticator code'}
                                </button>

                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-400 transition-colors"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Back to sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
