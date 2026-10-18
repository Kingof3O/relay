import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Key,
    Plus,
    Trash2,
    Copy,
    Check,
    AlertCircle,
    Clock,
    Shield,
    CheckCircle2,
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export interface TokenItem {
    id: number;
    name: string;
    abilities?: string[] | null;
    last_used_at?: string | null;
    expires_at?: string | null;
    created_at?: string | null;
}

interface PersonalAccessTokensCardProps {
    initialTokens?: TokenItem[];
    className?: string;
}

export default function PersonalAccessTokensCard({
    initialTokens = [],
    className = '',
}: PersonalAccessTokensCardProps) {
    const [tokens, setTokens] = useState<TokenItem[]>(initialTokens);
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [expirationDays, setExpirationDays] = useState('30');
    const [abilities, setAbilities] = useState<string[]>(['*']);
    const [loading, setLoading] = useState(false);
    const [revokingId, setRevokingId] = useState<number | null>(null);
    const [newToken, setNewToken] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);

    const availableAbilities = [
        { id: '*', label: 'Full Access (*)' },
        { id: 'read:requests', label: 'Read Work Requests' },
        { id: 'write:requests', label: 'Create & Update Requests' },
        { id: 'delete:requests', label: 'Delete Requests' },
        { id: 'read:projects', label: 'Read Projects' },
    ];

    const toggleAbility = (ability: string) => {
        if (ability === '*') {
            setAbilities(['*']);
            return;
        }

        const filtered = abilities.filter((a) => a !== '*');
        if (filtered.includes(ability)) {
            const next = filtered.filter((a) => a !== ability);
            setAbilities(next.length === 0 ? ['*'] : next);
        } else {
            setAbilities([...filtered, ability]);
        }
    };

    const handleCreateToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            let expiresAt: string | null = null;
            if (expirationDays !== 'never') {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(expirationDays, 10));
                expiresAt = date.toISOString();
            }

            const response = await axios.post('/tokens', {
                name: name.trim(),
                abilities,
                expires_at: expiresAt,
            });

            const tokenString = response.data.token || response.data.plainTextToken;
            const createdToken = response.data.accessToken;

            setNewToken(tokenString);
            if (createdToken) {
                setTokens((prev) => [createdToken, ...prev]);
            } else {
                // Refresh tokens list
                const listRes = await axios.get('/tokens');
                setTokens(listRes.data.tokens || []);
            }

            setName('');
            setIsCreating(false);
            toast.success('Personal access token generated.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to generate token.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeToken = async (tokenId: number) => {
        setRevokingId(tokenId);
        try {
            await axios.delete(`/tokens/${tokenId}`);
            setTokens((prev) => prev.filter((t) => t.id !== tokenId));
            toast.success('Token revoked.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to revoke token.');
        } finally {
            setRevokingId(null);
        }
    };

    const handleCopyToken = () => {
        if (!newToken) return;
        navigator.clipboard.writeText(newToken);
        setCopiedToken(true);
        toast.info('Copied secret token to clipboard.');
        setTimeout(() => setCopiedToken(false), 2000);
    };

    return (
        <div
            className={`rounded-2xl border border-zinc-800 bg-[#111216] p-6 shadow-xl shadow-black/40 transition-all ${className}`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400">
                            <Key className="h-4 w-4" />
                        </div>
                        <h2 className="text-base font-semibold text-zinc-100">
                            Personal Access Tokens
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                        Manage API tokens to authenticate with the Relay Studio REST API v1.
                    </p>
                </div>

                {!isCreating && (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-600/20 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-600/30 hover:border-violet-500/50"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Generate New Token</span>
                    </button>
                )}
            </div>

            {/* Newly Created Token Display Modal / Banner */}
            {newToken && (
                <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Secret Token Generated
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setNewToken(null)}
                            className="text-xs text-zinc-500 hover:text-zinc-300"
                        >
                            Dismiss
                        </button>
                    </div>

                    <p className="mt-1.5 text-xs text-zinc-300">
                        Make sure to copy your personal access token now. You won't be able to see it again!
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={newToken}
                            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-emerald-300 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleCopyToken}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/30"
                        >
                            {copiedToken ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Creation Form */}
            {isCreating && (
                <form
                    onSubmit={handleCreateToken}
                    className="mt-6 space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                            New Token Details
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="text-xs text-zinc-500 hover:text-zinc-300"
                        >
                            Cancel
                        </button>
                    </div>

                    <div>
                        <InputLabel htmlFor="token_name" value="Token Name" />
                        <TextInput
                            id="token_name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. CI/CD Deployment, CLI Tool"
                            className="mt-1 w-full"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Expiration" />
                            <select
                                value={expirationDays}
                                onChange={(e) => setExpirationDays(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="60">60 Days</option>
                                <option value="90">90 Days</option>
                                <option value="never">No Expiration</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Abilities & Scopes" />
                            <div className="mt-2 space-y-1.5">
                                {availableAbilities.map((ab) => (
                                    <label
                                        key={ab.id}
                                        className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={abilities.includes(ab.id)}
                                            onChange={() => toggleAbility(ab.id)}
                                            className="rounded border-zinc-700 bg-zinc-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-zinc-900"
                                        />
                                        <span>{ab.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <SecondaryButton type="button" onClick={() => setIsCreating(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={loading || !name.trim()}>
                            {loading ? 'Generating...' : 'Create Token'}
                        </PrimaryButton>
                    </div>
                </form>
            )}

            {/* Tokens List */}
            <div className="mt-6">
                {tokens.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 py-8 text-center">
                        <Key className="mx-auto h-6 w-6 text-zinc-600" />
                        <p className="mt-2 text-xs text-zinc-400">
                            No personal access tokens generated yet.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
                        {tokens.map((token) => {
                            const lastUsed = token.last_used_at
                                ? new Date(token.last_used_at).toLocaleDateString()
                                : 'Never used';
                            const expiresText = token.expires_at
                                ? `Expires ${new Date(token.expires_at).toLocaleDateString()}`
                                : 'No expiration';

                            return (
                                <div
                                    key={token.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 text-xs first:rounded-t-xl last:rounded-b-xl hover:bg-zinc-850/40"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-zinc-200">
                                                {token.name}
                                            </span>
                                            {token.abilities && token.abilities.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {token.abilities.map((ability) => (
                                                        <span
                                                            key={ability}
                                                            className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                                                        >
                                                            {ability}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                                            <span>Last used: {lastUsed}</span>
                                            <span>·</span>
                                            <span>{expiresText}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRevokeToken(token.id)}
                                        disabled={revokingId === token.id}
                                        className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        <span>{revokingId === token.id ? 'Revoking...' : 'Revoke'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
