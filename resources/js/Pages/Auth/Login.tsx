import ApplicationLogo from '@/Components/ApplicationLogo';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Sparkles,
    Check,
    Loader2,
    ShieldCheck,
    Clock,
    Command,
    CheckCircle2,
} from 'lucide-react';

interface DemoPersona {
    username: string;
    name: string;
    role: string;
    initials: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
    { username: 'robin', name: 'Robin', role: 'Owner', initials: 'R' },
    { username: 'hussien', name: 'Hussien', role: 'Lead Dev', initials: 'H' },
    { username: 'brother', name: 'Brother', role: 'Developer', initials: 'B' },
    { username: 'designer-1', name: 'Maya', role: 'UI/UX Lead', initials: 'M' },
];

interface LoginProps {
    socialProviders?: {
        github: boolean;
        google: boolean;
    };
    status?: string;
}

export default function Login({
    socialProviders = { github: true, google: true },
    status,
}: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [activePersona, setActivePersona] = useState<string | null>(null);

    const hasSocialProviders = Boolean(socialProviders?.github || socialProviders?.google);
    const bothEnabled = Boolean(socialProviders?.github && socialProviders?.google);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const selectPersona = (persona: DemoPersona) => {
        setActivePersona(persona.username);
        setData({
            ...data,
            username: persona.username,
            password: 'password',
        });
    };

    return (
        <div className="relative flex min-h-screen w-full bg-[#07090e] text-zinc-100 selection:bg-indigo-500/30 selection:text-white">
            <Head title="Sign In · Relay Studio">
                <meta
                    name="description"
                    content="Sign in to Relay Studio to access your engineering workspace, active work requests, and real-time team delivery velocity."
                />
                <link rel="canonical" href={route('login')} />
                <meta property="og:title" content="Sign In · Relay Studio" />
                <meta
                    property="og:description"
                    content="Sign in to Relay Studio to access your engineering workspace, active work requests, and real-time team delivery velocity."
                />
                <meta property="og:url" content={route('login')} />
            </Head>

            {/* ========================================================= */}
            {/* LEFT PANEL: Workspace Vision & Daily Sprint Preview      */}
            {/* ========================================================= */}
            <div className="relative hidden w-full flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#07090e] p-10 lg:flex lg:w-1/2 xl:w-7/12 xl:p-16">
                {/* Ambient Specular Vignettes & Grid */}
                <div className="pointer-events-none absolute -left-36 -top-36 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-indigo-500/[0.07] via-purple-500/[0.03] to-transparent blur-[130px]" />
                <div className="pointer-events-none absolute -bottom-40 right-0 h-[480px] w-[480px] rounded-full bg-gradient-to-tl from-cyan-500/[0.05] via-blue-500/[0.02] to-transparent blur-[140px]" />
                <div className="relay-grid pointer-events-none absolute inset-0 opacity-25" />

                {/* Top: Brand Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="group inline-flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700/80 bg-[#13141a] p-2.5 shadow-lg shadow-black/50 transition-all duration-200 group-hover:scale-105 group-hover:border-zinc-500 group-hover:bg-[#181a22]">
                            <ApplicationLogo className="h-full w-full text-white" />
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-base font-bold tracking-[0.25em] text-white">
                                RELAY
                            </span>
                            <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium tracking-normal text-zinc-400">
                                Studio
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Workspace Active</span>
                    </div>
                </div>

                {/* Center: Friendly Workspace Overview */}
                <div className="relative z-10 my-auto max-w-xl py-8 space-y-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Your daily mission control</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white xl:text-4xl">
                            Where your team builds with clarity.
                        </h1>
                        <p className="text-sm leading-relaxed text-zinc-400">
                            Pick up where you left off. Plan your week, track active sprint cycles, and collaborate with your teammates in real time.
                        </p>
                    </div>

                    {/* Visual Product Preview Card: Interactive-looking Daily Cycle */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d13]/80 p-5 shadow-2xl shadow-black/70 backdrop-blur-md transition-all duration-200 hover:border-white/[0.12]">
                        {/* Snapshot Card Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-6 items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 text-[11px] font-semibold text-indigo-300">
                                    Cycle 14
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                                    <span>4 days remaining</span>
                                </div>
                            </div>
                            <span className="font-mono text-xs font-semibold text-emerald-400">
                                78% on track
                            </span>
                        </div>

                        {/* Velocity Progress Bar */}
                        <div className="my-3.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />
                        </div>

                        {/* Recent Tasks List */}
                        <div className="space-y-2 pt-1">
                            {/* Task 1 */}
                            <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs transition-colors hover:bg-white/[0.04]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                                    <span className="font-mono text-[11px] text-zinc-500 shrink-0">#REQ-104</span>
                                    <span className="truncate text-zinc-200">Refine notification preferences & digest</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">#settings</span>
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-300">
                                        M
                                    </div>
                                </div>
                            </div>

                            {/* Task 2 */}
                            <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs transition-colors hover:bg-white/[0.04]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                    <span className="font-mono text-[11px] text-zinc-500 shrink-0">#REQ-102</span>
                                    <span className="truncate text-zinc-200">Deliver 1-click social authentication</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">#auth</span>
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">
                                        H
                                    </div>
                                </div>
                            </div>

                            {/* Task 3 */}
                            <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs transition-colors hover:bg-white/[0.04]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                                    <span className="font-mono text-[11px] text-zinc-500 shrink-0">#REQ-98</span>
                                    <span className="truncate text-zinc-200">Automate sprint burndown velocity</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">#agile</span>
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-300">
                                        R
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Keyboard shortcut hint */}
                        <div className="mt-3.5 flex items-center justify-between rounded-lg bg-zinc-900/60 px-3 py-2 text-[11px] text-zinc-400 border border-zinc-800/60">
                            <div className="flex items-center gap-1.5">
                                <Command className="h-3 w-3 text-zinc-400" />
                                <span>Press <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[10px] text-zinc-200">⌘K</kbd> to jump anywhere</span>
                            </div>
                            <span className="font-mono text-zinc-500 text-[10px]">C: New task</span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Active Team Presence */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/[0.04] pt-6 text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#07090e] bg-indigo-600 text-[10px] font-bold text-white">
                                R
                            </div>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#07090e] bg-cyan-600 text-[10px] font-bold text-white">
                                H
                            </div>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#07090e] bg-purple-600 text-[10px] font-bold text-white">
                                M
                            </div>
                        </div>
                        <span className="text-zinc-400 text-xs font-medium">Your team is active and in sync</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-zinc-400 font-medium">Ready</span>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT PANEL: Focused Authentication Portal                */}
            {/* ========================================================= */}
            <div className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-y-auto bg-[#090a0f] p-6 sm:p-10 lg:w-1/2 lg:p-12 xl:w-5/12 xl:p-16">
                {/* Subtle Right Ambient Lighting */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-white/[0.03] to-transparent blur-[120px]" />

                {/* Form Card Container */}
                <div className="relative z-10 w-full max-w-[420px] space-y-6">
                    {/* Mobile Brand Header (< lg) */}
                    <div className="mb-6 flex flex-col items-center gap-3 text-center lg:hidden">
                        <Link
                            href="/"
                            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700/80 bg-[#13141a] p-2.5 shadow-xl shadow-black/60"
                        >
                            <ApplicationLogo className="h-full w-full text-white" />
                        </Link>
                        <div>
                            <h1 className="text-base font-bold tracking-[0.25em] text-white">
                                RELAY
                            </h1>
                            <p className="mt-0.5 text-xs text-zinc-400">
                                Workspace Studio Platform
                            </p>
                        </div>
                    </div>

                    {/* Portal Header */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            Sign In
                        </h2>
                        <p className="text-xs text-zinc-400">
                            Welcome back! Enter your details or select a demo persona
                        </p>
                    </div>

                    {/* Session Flash Status Message */}
                    {status && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300">
                            {status}
                        </div>
                    )}

                    {/* Social Sign-In Buttons (conditionally rendered) */}
                    {hasSocialProviders && (
                        <div className="space-y-3">
                            <div className={`grid gap-2.5 ${bothEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {socialProviders.github && (
                                    <a
                                        href={route('auth.social.redirect', { provider: 'github' })}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#14151b] px-4 py-2.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:bg-[#1a1c26] hover:text-white active:scale-[0.98]"
                                    >
                                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                        </svg>
                                        <span>Continue with GitHub</span>
                                    </a>
                                )}

                                {socialProviders.google && (
                                    <a
                                        href={route('auth.social.redirect', { provider: 'google' })}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#14151b] px-4 py-2.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:bg-[#1a1c26] hover:text-white active:scale-[0.98]"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </a>
                                )}
                            </div>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#090a0f] px-2 text-[10px] font-medium tracking-wider text-zinc-500">
                                        Or continue with credentials
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Credentials Form */}
                    <form onSubmit={submit} className="space-y-4">
                        {/* Username Input */}
                        <div>
                            <InputLabel htmlFor="username" value="Username or Email" />
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                    <User className="h-4 w-4" />
                                </div>
                                <TextInput
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    className="block w-full pl-9"
                                    autoComplete="username"
                                    placeholder="e.g. robin or robin@relay.studio"
                                    isFocused={true}
                                    onChange={(e) => {
                                        setData('username', e.target.value);
                                        setActivePersona(null);
                                    }}
                                    required
                                />
                            </div>
                            <InputError message={errors.username} className="mt-1.5" />
                        </div>

                        {/* Password Input with Show/Hide Toggle */}
                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel htmlFor="password" value="Password" />
                            </div>
                            <div className="relative mt-1.5">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-9 pr-10"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200 transition-colors"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-0.5">
                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData(
                                            'remember',
                                            (e.target.checked || false) as false,
                                        )
                                    }
                                />
                                <span className="ms-2.5 text-xs text-zinc-400 hover:text-zinc-300 transition duration-150">
                                    Keep session active
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <PrimaryButton
                                className="w-full justify-center py-2.5 text-sm"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                                        <span>Signing in…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Continue to Workspace</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </PrimaryButton>
                        </div>

                        {/* 1-Click Fast-Track Persona Switcher */}
                        <div className="mt-6 border-t border-zinc-800/80 pt-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3 text-indigo-400" />
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                        1-Click Demo Personas
                                    </p>
                                </div>
                                <span className="font-mono text-[10px] text-zinc-500">pwd: password</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {DEMO_PERSONAS.map((persona) => {
                                    const isSelected = activePersona === persona.username;
                                    return (
                                        <button
                                            key={persona.username}
                                            type="button"
                                            onClick={() => selectPersona(persona)}
                                            className={`group flex items-center justify-between rounded-xl border p-2.5 text-left transition-all duration-150 active:scale-[0.98] ${
                                                isSelected
                                                    ? 'border-indigo-500/40 bg-indigo-500/10 shadow-sm'
                                                    : 'border-zinc-800/80 bg-[#121318] hover:border-zinc-700 hover:bg-[#161820]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold transition-colors ${
                                                        isSelected
                                                            ? 'bg-indigo-500 text-white font-bold'
                                                            : 'border border-zinc-700/80 bg-zinc-800 text-zinc-300'
                                                    }`}
                                                >
                                                    {persona.initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-medium text-zinc-200 group-hover:text-white">
                                                        {persona.name}
                                                    </p>
                                                    <p className="truncate text-[10px] text-zinc-500">
                                                        {persona.role}
                                                    </p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </form>

                    {/* Security Guarantee Footer */}
                    <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-zinc-500">
                        <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Encrypted Studio Session · SOC2 Security Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
