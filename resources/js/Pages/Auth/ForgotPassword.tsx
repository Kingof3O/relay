import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, ArrowRight, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <div className="relative flex min-h-screen w-full bg-[#08090d] text-zinc-100 selection:bg-indigo-500/30 selection:text-white">
            <Head title="Forgot Password · Relay Studio" />

            <div className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-y-auto bg-[#090a0f] p-6 sm:p-10">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-600/[0.05] to-transparent blur-[120px]" />
                </div>

                <div className="relative z-10 w-full max-w-[400px] space-y-6">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111216] p-2.5 shadow-2xl">
                            <KeyRound className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-white">
                                Reset your password
                            </h2>
                            <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xs">
                                Enter your verified email address and we will send you a secure password reset link.
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111217]/80 p-6 shadow-2xl backdrop-blur-xl">
                        {status && (
                            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" className="text-xs text-zinc-400 font-medium" />
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                                        placeholder="user@relay.studio"
                                        isFocused={true}
                                        autoComplete="email"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2 text-xs" />
                            </div>

                            <PrimaryButton
                                className="w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 transition-all duration-200"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending link...
                                    </>
                                ) : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </PrimaryButton>

                            <div className="pt-2 text-center text-xs">
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
