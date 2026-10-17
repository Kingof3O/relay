import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Check,
    Copy,
    Download,
    KeyRound,
    Lock,
    QrCode,
    RefreshCw,
    Shield,
    ShieldAlert,
    ShieldCheck,
    X,
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

interface TwoFactorSecurityCardProps {
    initialEnabled?: boolean;
    className?: string;
}

export default function TwoFactorSecurityCard({
    initialEnabled = false,
    className = '',
}: TwoFactorSecurityCardProps) {
    const [enabled, setEnabled] = useState<boolean>(initialEnabled);
    const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [qrSvg, setQrSvg] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [code, setCode] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
    const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
    const [copiedCodes, setCopiedCodes] = useState<boolean>(false);

    const handleStartEnable = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(route('two-factor.enable'));
            setQrSvg(response.data.qr_svg || '');
            setSecret(response.data.secret || '');
            setRecoveryCodes(response.data.recovery_codes || []);
            setIsSettingUp(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to initialize two-factor authentication setup.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim().length !== 6) {
            setError('Please enter a 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(route('two-factor.confirm'), { code });
            setEnabled(true);
            setIsSettingUp(false);
            setCode('');
            if (response.data.recovery_codes) {
                setRecoveryCodes(response.data.recovery_codes);
            }
            setShowRecoveryModal(true);
            toast.success('Two-factor authentication successfully enabled.');
        } catch (err: any) {
            setError(err.response?.data?.errors?.code?.[0] || err.response?.data?.message || 'Invalid code.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Are you sure you want to disable two-factor authentication? This reduces your account security.')) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(route('two-factor.disable'));
            setEnabled(false);
            setIsSettingUp(false);
            setRecoveryCodes([]);
            toast.success('Two-factor authentication disabled.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to disable two-factor authentication.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateCodes = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('two-factor.recovery-codes'));
            setRecoveryCodes(response.data.recovery_codes || []);
            setShowRecoveryModal(true);
            toast.success('New recovery codes generated.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to regenerate recovery codes.');
        } finally {
            setLoading(false);
        }
    };

    const copySecretToClipboard = () => {
        navigator.clipboard?.writeText(secret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
    };

    const copyCodesToClipboard = () => {
        navigator.clipboard?.writeText(recoveryCodes.join('\n'));
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
    };

    const downloadRecoveryCodes = () => {
        const text = `Relay Studio - Two-Factor Authentication Recovery Codes\nGenerated: ${new Date().toISOString()}\n\nKeep these codes in a safe place. Each code can only be used once.\n\n${recoveryCodes.join('\n')}\n`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relay-recovery-codes-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <section
            className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl ${className}`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                            <Shield className="h-4 w-4" />
                        </div>
                        <h2 className="text-base font-semibold text-zinc-100">
                            Two-Factor Authentication (TOTP)
                        </h2>
                    </div>
                    <p className="text-xs text-zinc-400">
                        Add an extra layer of defense using your authenticator app (1Password, Google Authenticator, Authy).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {enabled ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Enabled & Enforced</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>Not Configured</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Status & Actions Section */}
            <div className="mt-6 border-t border-zinc-800/70 pt-6">
                {!enabled && !isSettingUp && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-200">
                                Ready to secure your workspace account
                            </p>
                            <p className="text-xs text-zinc-400">
                                When enabled, you will be prompted for a 6-digit TOTP token during critical authentication checkpoints.
                            </p>
                        </div>
                        <PrimaryButton
                            onClick={handleStartEnable}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 focus:bg-purple-700 text-xs"
                        >
                            <QrCode className="mr-1.5 h-3.5 w-3.5" />
                            <span>{loading ? 'Initializing...' : 'Enable 2FA'}</span>
                        </PrimaryButton>
                    </div>
                )}

                {/* Inline Setup View */}
                {isSettingUp && !enabled && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-5 space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-purple-400" />
                                    <span>Scan QR Code with Authenticator</span>
                                </h3>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Open your authenticator app, scan the QR code below or enter the key manually.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsSettingUp(false)}
                                className="text-zinc-500 hover:text-zinc-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* QR Code Container */}
                            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-white p-4 shadow-inner">
                                {qrSvg ? (
                                    <div
                                        className="h-48 w-48 [&>svg]:h-full [&>svg]:w-full"
                                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                                    />
                                ) : (
                                    <div className="h-48 w-48 flex items-center justify-center text-zinc-400 text-xs">
                                        Loading QR...
                                    </div>
                                )}
                            </div>

                            {/* Manual Key & Verification Code Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 block mb-1">
                                        Manual Setup Key
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs font-mono text-purple-300 select-all truncate">
                                            {secret}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={copySecretToClipboard}
                                            className="rounded-lg border border-zinc-800 bg-zinc-800/60 p-2 text-zinc-300 hover:bg-zinc-700"
                                            title="Copy key"
                                        >
                                            {copiedSecret ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleConfirm} className="space-y-3">
                                    <div>
                                        <InputLabel htmlFor="confirm_code" value="6-Digit Verification Code" className="text-zinc-300 text-xs" />
                                        <TextInput
                                            id="confirm_code"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="123456"
                                            className="mt-1 block w-full text-center tracking-widest text-lg font-mono bg-zinc-950 border-zinc-800 text-zinc-100"
                                            autoFocus
                                        />
                                        {error && <InputError message={error} className="mt-1 text-xs" />}
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <PrimaryButton
                                            type="submit"
                                            disabled={loading || code.trim().length !== 6}
                                            className="w-full justify-center bg-purple-600 hover:bg-purple-500 text-xs"
                                        >
                                            <Lock className="mr-1.5 h-3.5 w-3.5" />
                                            <span>{loading ? 'Verifying...' : 'Confirm & Enable 2FA'}</span>
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enabled State Management */}
                {enabled && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-zinc-200">
                                    Recovery Codes & Emergency Access
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Store your one-time backup codes safely in case you ever lose access to your primary authenticator device.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <SecondaryButton
                                    onClick={handleRegenerateCodes}
                                    disabled={loading}
                                    className="border-zinc-700 bg-zinc-800/60 text-xs text-zinc-300 hover:bg-zinc-700"
                                >
                                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                    <span>Regenerate Codes</span>
                                </SecondaryButton>
                                <SecondaryButton
                                    onClick={handleDisable}
                                    disabled={loading}
                                    className="border-rose-900/40 bg-rose-950/20 text-xs text-rose-300 hover:bg-rose-900/40"
                                >
                                    <span>Disable 2FA</span>
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recovery Codes Modal */}
            {showRecoveryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-emerald-400" />
                                    <span>Store Your Recovery Codes</span>
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    These codes can be used to log in if your authenticator device is lost. Each code is valid only once.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRecoveryModal(false)}
                                className="text-zinc-500 hover:text-zinc-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 font-mono text-xs text-zinc-300">
                            {recoveryCodes.map((rc, idx) => (
                                <div key={idx} className="p-1 rounded bg-zinc-900/60 text-center tracking-wider text-emerald-400">
                                    {rc}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={copyCodesToClipboard}
                                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                            >
                                {copiedCodes ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Codes copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy all codes</span>
                                    </>
                                )}
                            </button>

                            <div className="flex items-center gap-2">
                                <SecondaryButton
                                    onClick={downloadRecoveryCodes}
                                    className="border-zinc-700 bg-zinc-800 text-xs text-zinc-200 hover:bg-zinc-700"
                                >
                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                    <span>Download .txt</span>
                                </SecondaryButton>
                                <PrimaryButton
                                    onClick={() => setShowRecoveryModal(false)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-xs"
                                >
                                    <span>I Have Saved Them</span>
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
