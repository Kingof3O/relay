import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
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

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [activePersona, setActivePersona] = useState<string | null>(null);

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
        <GuestLayout>
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

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold tracking-tight text-white">Sign In</h2>
                <p className="mt-1 text-xs text-zinc-400">Access your workspace mission control</p>
            </div>

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
                        className="w-full justify-center py-2.5"
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
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-zinc-400" />
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                1-Click Demo Personas
                            </p>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">pwd: password</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {DEMO_PERSONAS.map((persona) => {
                            const isSelected = activePersona === persona.username;
                            return (
                                <button
                                    key={persona.username}
                                    type="button"
                                    onClick={() => selectPersona(persona)}
                                    className={`group flex items-center justify-between rounded-lg border p-2 text-left transition-all duration-150 active:scale-[0.98] ${
                                        isSelected
                                            ? 'border-white/20 bg-zinc-800 shadow-sm'
                                            : 'border-zinc-800 bg-[#14151b] hover:border-zinc-700 hover:bg-[#181a22]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                                                isSelected
                                                    ? 'bg-white text-zinc-950 font-bold'
                                                    : 'border border-zinc-700 bg-zinc-800 text-zinc-300'
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
        </GuestLayout>
    );
}
