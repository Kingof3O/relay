/**
 * Shared avatar initials and color styling utility.
 */

export interface AvatarColor {
    bg: string;
    text: string;
    border: string;
}

const AVATAR_PALETTES: AvatarColor[] = [
    { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30' },
    { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
    { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
    { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
    { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
    { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
    { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
];

/**
 * Extract clean 1-2 character uppercase initials from name or username.
 */
export function getInitials(name?: string | null, username?: string | null): string {
    const raw = (name || username || '').trim();
    if (!raw) return '?';

    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    if (parts.length === 1) {
        return parts[0].slice(0, Math.min(2, parts[0].length)).toUpperCase();
    }

    return '?';
}

/**
 * Deterministic dark obsidian palette based on a user string or numeric identifier.
 */
export function getAvatarColor(key?: string | number | null): AvatarColor {
    if (!key) {
        return { bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700/60' };
    }
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
}
