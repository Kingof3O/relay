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
    Building2,
    Shield,
    Mail,
    ArrowRight,
    Loader2,
} from 'lucide-react';

interface InvitationProps {
    invitation: {
        token: string;
        email: string;
        workspace: {
            id: number;
            name: string;
            slug: string;
        } | null;
        role: {
            id: number;
            name: string;
        } | null;
        expires_at: string;
    };
}

export default function AcceptInvitation({ invitation }: InvitationProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('invitations.store', invitation.token), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const workspaceName = invitation.workspace?.name ?? 'Relay Workspace';
    const roleName = invitation.role?.name ?? 'Team Member';

    return (
        <GuestLayout>
            <Head title={`Join ${workspaceName} · Relay Studio`} />

            <div className="mb-6 rounded-2xl border border-zinc-800 bg-[#0c0d12] p-5 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{workspaceName}</span>
                            <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                                <Shield className="h-2.5 w-2.5" />
                                {roleName}
                            </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                            <Mail className="h-3 w-3 text-zinc-500" />
                            <span>{invitation.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Complete your account</h2>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Set up your display name and password to accept this invitation and enter the workspace.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-xs font-semibold text-zinc-300" />
                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                            <User className="h-4 w-4" />
                        </div>
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="block w-full rounded-xl border-zinc-800 bg-[#090a0f] pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500/20"
                            placeholder="Alex Smith"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                {/* Username */}
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-xs font-semibold text-zinc-300" />
                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 font-mono text-xs">
                            @
                        </div>
                        <TextInput
                            id="username"
                            name="username"
                            value={data.username}
                            className="block w-full rounded-xl border-zinc-800 bg-[#090a0f] pl-10 pr-4 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500/20"
                            placeholder="alexsmith"
                            autoComplete="username"
                            onChange={(e) => setData('username', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.username} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-xs font-semibold text-zinc-300" />
                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                            <Lock className="h-4 w-4" />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full rounded-xl border-zinc-800 bg-[#090a0f] pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500/20"
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-xs font-semibold text-zinc-300" />
                    <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                            <Lock className="h-4 w-4" />
                        </div>
                        <TextInput
                            id="password_confirmation"
                            type={showPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full rounded-xl border-zinc-800 bg-[#090a0f] pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-500/20"
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center rounded-xl bg-white py-3 text-xs font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Joining workspace...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Accept Invitation & Enter</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
