import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import ConfirmDialog from '@/Components/ConfirmDialog';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import { PageProps } from '@/types';
import { RequestStatus, RequestPriority } from '@/types/workspace';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import {
    Bot,
    Terminal,
    Key,
    Activity,
    Cpu,
    Copy,
    Check,
    Search,
    Shield,
    Sparkles,
    Code,
    ExternalLink,
    RefreshCw,
    Plus,
    Trash2,
    Clock,
    AlertCircle,
    CheckCircle2,
    Zap,
    Boxes,
    FileText,
    Settings,
} from 'lucide-react';

interface AgentActivity {
    id: number;
    request_id: number;
    request_title: string;
    request_status: string;
    request_priority: string;
    type: string;
    body?: string | null;
    metadata?: Record<string, unknown> | null;
    tool?: string | null;
    token_name?: string | null;
    user?: { id: number; name: string; username: string } | null;
    created_at?: string | null;
}

interface AgentToken {
    id: number;
    name: string;
    abilities: string[];
    last_used_at?: string | null;
    expires_at?: string | null;
    created_at?: string | null;
}

interface ToolParam {
    name: string;
    type: string;
    required: boolean;
    default?: string;
    description: string;
}

interface ToolSpec {
    name: string;
    title: string;
    description: string;
    parameters: ToolParam[];
    example: string;
}

interface AgentsIndexProps extends PageProps {
    workspace: { id: number; name: string; slug: string } | null;
    serverUrl: string;
    mcpBinaryPath: string;
    tools: ToolSpec[];
    agentActivities: AgentActivity[];
    tokens: AgentToken[];
}

type TabType = 'setup' | 'stream' | 'tokens';
type ClientType = 'claude' | 'cursor' | 'antigravity' | 'windsurf';

export default function AgentsIndex({
    workspace,
    serverUrl,
    mcpBinaryPath,
    tools = [],
    agentActivities: initialActivities = [],
    tokens: initialTokens = [],
}: AgentsIndexProps) {
    const [activeTab, setActiveTab] = useState<TabType>('setup');
    const [selectedClient, setSelectedClient] = useState<ClientType>('cursor');
    const [copiedSnippet, setCopiedSnippet] = useState(false);
    const [copiedToken, setCopiedToken] = useState(false);
    const [toolSearch, setToolSearch] = useState('');
    const [activitySearch, setActivitySearch] = useState('');
    const [selectedToolFilter, setSelectedToolFilter] = useState<string>('all');

    // Token creation modal & state
    const [showCreateTokenModal, setShowCreateTokenModal] = useState(false);
    const [tokenName, setTokenName] = useState('Claude / Cursor Agent');
    const [selectedAbilities, setSelectedAbilities] = useState<string[]>([
        'requests:read',
        'requests:write',
    ]);
    const [creatingToken, setCreatingToken] = useState(false);
    const [generatedPlainToken, setGeneratedPlainToken] = useState<string | null>(null);

    // Token revocation modal
    const [tokenToRevoke, setTokenToRevoke] = useState<AgentToken | null>(null);
    const [revokingToken, setRevokingToken] = useState(false);

    // Local tokens list state for immediate UI update
    const [tokensList, setTokensList] = useState<AgentToken[]>(initialTokens);

    const formatActivityDate = (date?: string | null) =>
        date
            ? new Intl.DateTimeFormat(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
              }).format(new Date(date))
            : '';

    // Config Snippets generator
    const configSnippets: Record<ClientType, { file: string; config: string }> = useMemo(() => {
        const tokenPlaceholder = generatedPlainToken || 'YOUR_PERSONAL_ACCESS_TOKEN';

        const claudeDesktop = {
            mcpServers: {
                relay: {
                    command: 'node',
                    args: [mcpBinaryPath],
                    env: {
                        RELAY_URL: serverUrl,
                        RELAY_API_TOKEN: tokenPlaceholder,
                    },
                },
            },
        };

        const cursor = {
            mcpServers: {
                relay: {
                    command: 'node',
                    args: [mcpBinaryPath],
                    env: {
                        RELAY_URL: serverUrl,
                        RELAY_API_TOKEN: tokenPlaceholder,
                    },
                },
            },
        };

        const antigravity = {
            relay: {
                command: 'node',
                args: [mcpBinaryPath],
                env: {
                    RELAY_URL: serverUrl,
                    RELAY_API_TOKEN: tokenPlaceholder,
                },
            },
        };

        const windsurf = {
            mcpServers: {
                relay: {
                    command: 'node',
                    args: [mcpBinaryPath],
                    env: {
                        RELAY_URL: serverUrl,
                        RELAY_API_TOKEN: tokenPlaceholder,
                    },
                },
            },
        };

        return {
            cursor: {
                file: '.cursor/mcp.json (or Cursor Settings > Features > MCP)',
                config: JSON.stringify(cursor, null, 2),
            },
            claude: {
                file: '~/Library/Application Support/Claude/claude_desktop_config.json',
                config: JSON.stringify(claudeDesktop, null, 2),
            },
            antigravity: {
                file: '~/.gemini/antigravity/mcp/relay.json (or mcp configuration)',
                config: JSON.stringify(antigravity, null, 2),
            },
            windsurf: {
                file: '~/.codeium/windsurf/mcp_config.json',
                config: JSON.stringify(windsurf, null, 2),
            },
        };
    }, [serverUrl, mcpBinaryPath, generatedPlainToken]);

    const handleCopyConfig = () => {
        const snippet = configSnippets[selectedClient]?.config;
        if (snippet) {
            navigator.clipboard.writeText(snippet);
            setCopiedSnippet(true);
            toast.success(`Copied configuration for ${selectedClient.toUpperCase()}`);
            setTimeout(() => setCopiedSnippet(false), 2000);
        }
    };

    const handleCopyPlainToken = () => {
        if (generatedPlainToken) {
            navigator.clipboard.writeText(generatedPlainToken);
            setCopiedToken(true);
            toast.success('Agent Token copied to clipboard');
            setTimeout(() => setCopiedToken(false), 2000);
        }
    };

    const handleCreateToken = async () => {
        if (!tokenName.trim()) {
            toast.error('Token name is required');
            return;
        }

        setCreatingToken(true);
        try {
            const response = await axios.post(route('tokens.store'), {
                name: tokenName.trim(),
                abilities: selectedAbilities.length > 0 ? selectedAbilities : ['*'],
            });

            const newToken = response.data.token || response.data.plainTextToken;
            setGeneratedPlainToken(newToken);
            toast.success('Agent Token created successfully!');

            if (response.data.accessToken) {
                setTokensList((prev) => [response.data.accessToken, ...prev]);
            } else {
                // Refresh tokens list from backend
                router.reload({ only: ['tokens'] });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create token');
        } finally {
            setCreatingToken(false);
        }
    };

    const handleRevokeToken = async () => {
        if (!tokenToRevoke) return;

        setRevokingToken(true);
        try {
            await axios.delete(route('tokens.destroy', tokenToRevoke.id));
            toast.success(`Revoked token "${tokenToRevoke.name}"`);
            setTokensList((prev) => prev.filter((t) => t.id !== tokenToRevoke.id));
            setTokenToRevoke(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to revoke token');
        } finally {
            setRevokingToken(false);
        }
    };

    // Filter tools
    const filteredTools = useMemo(() => {
        if (!toolSearch.trim()) return tools;
        const q = toolSearch.toLowerCase();
        return tools.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
        );
    }, [tools, toolSearch]);

    // Filter agent activities
    const filteredActivities = useMemo(() => {
        return initialActivities.filter((act) => {
            const matchesSearch =
                !activitySearch.trim() ||
                act.request_title.toLowerCase().includes(activitySearch.toLowerCase()) ||
                act.body?.toLowerCase().includes(activitySearch.toLowerCase()) ||
                act.tool?.toLowerCase().includes(activitySearch.toLowerCase()) ||
                act.token_name?.toLowerCase().includes(activitySearch.toLowerCase());

            const matchesTool =
                selectedToolFilter === 'all' || act.tool === selectedToolFilter;

            return matchesSearch && matchesTool;
        });
    }, [initialActivities, activitySearch, selectedToolFilter]);

    // Distinct list of tools used in activity stream
    const distinctTools = useMemo(() => {
        const set = new Set<string>();
        initialActivities.forEach((a) => {
            if (a.tool) set.add(a.tool);
        });
        return Array.from(set);
    }, [initialActivities]);

    return (
        <AuthenticatedLayout>
            <Head title="Agents & MCP Hub" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <PageHeader
                    title="AI Agents & MCP Hub"
                    subtitle="Empower Cursor, Claude Desktop, Antigravity, and Windsurf to interact directly with your Relay Studio workspace via Model Context Protocol."
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setTokenName('AI Agent Token');
                                    setShowCreateTokenModal(true);
                                }}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-specular transition-all hover:from-violet-500 hover:to-indigo-500"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Create Agent Token</span>
                            </button>
                        </div>
                    }
                />

                {/* Hero / Status Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#0c0e17]/80 to-[#07090e]/90 p-5 shadow-specular backdrop-blur-xl sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                                    <span>Model Context Protocol Enabled</span>
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Server v1.0 Ready</span>
                                </span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                Seamless Bi-Directional Collaboration Between Human & AI Engineers
                            </h2>
                            <p className="max-w-3xl text-xs text-zinc-400 leading-relaxed">
                                Relay Studio exposes high-performance MCP tools allowing your autonomous coding agents
                                to read daily briefings, search tasks, triage tickets, update sprint stages, and log progress comments
                                with strict workspace boundaries and immutable audit trails.
                            </p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="flex shrink-0 items-center gap-3">
                            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d14]/70 p-3 text-center min-w-[100px]">
                                <div className="text-lg font-bold text-white font-mono">{tools.length}</div>
                                <div className="text-[10px] uppercase font-semibold text-zinc-400">Tools</div>
                            </div>
                            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d14]/70 p-3 text-center min-w-[100px]">
                                <div className="text-lg font-bold text-violet-300 font-mono">
                                    {initialActivities.length}
                                </div>
                                <div className="text-[10px] uppercase font-semibold text-zinc-400">Actions</div>
                            </div>
                            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d14]/70 p-3 text-center min-w-[100px]">
                                <div className="text-lg font-bold text-emerald-300 font-mono">
                                    {tokensList.length}
                                </div>
                                <div className="text-[10px] uppercase font-semibold text-zinc-400">Tokens</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Navigation Tabs */}
                <div className="flex border-b border-white/[0.08] gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('setup')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                            activeTab === 'setup'
                                ? 'border-violet-500 text-white bg-white/[0.02]'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]'
                        }`}
                    >
                        <Cpu className="h-4 w-4 text-violet-400" />
                        <span>1. Setup &amp; Configuration</span>
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                            4 Clients
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('stream')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                            activeTab === 'stream'
                                ? 'border-violet-500 text-white bg-white/[0.02]'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]'
                        }`}
                    >
                        <Activity className="h-4 w-4 text-violet-400" />
                        <span>2. Agent Activity Stream</span>
                        {initialActivities.length > 0 && (
                            <span className="rounded-md border border-violet-500/30 bg-violet-500/15 px-1.5 py-0.2 text-[10px] font-mono text-violet-300">
                                {initialActivities.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('tokens')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                            activeTab === 'tokens'
                                ? 'border-violet-500 text-white bg-white/[0.02]'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]'
                        }`}
                    >
                        <Key className="h-4 w-4 text-violet-400" />
                        <span>3. Active Agents &amp; Tokens</span>
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                            {tokensList.length}
                        </span>
                    </button>
                </div>

                {/* TAB 1: SETUP & CONFIGURATION */}
                {activeTab === 'setup' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Generated Token Callout if present */}
                        {generatedPlainToken && (
                            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 shadow-specular">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <h3 className="text-sm font-bold text-white">
                                                New Agent Token Ready
                                            </h3>
                                        </div>
                                        <p className="text-xs text-zinc-400">
                                            Copy this personal access token now. For your security, this key will not be shown again.
                                            The configuration snippets below have been updated with this token.
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <code className="rounded-lg border border-emerald-500/30 bg-black/50 px-3 py-1.5 font-mono text-xs text-emerald-300 selection:bg-emerald-500 selection:text-black">
                                                {generatedPlainToken}
                                            </code>
                                            <button
                                                type="button"
                                                onClick={handleCopyPlainToken}
                                                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
                                            >
                                                {copiedToken ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                                <span>{copiedToken ? 'Copied!' : 'Copy Token'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setGeneratedPlainToken(null)}
                                        className="text-xs text-zinc-500 hover:text-zinc-300"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Client Selector & Snippet Card */}
                        <Card className="p-5 sm:p-6 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Terminal className="h-4 w-4 text-violet-400" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                            MCP Client Configuration
                                        </h2>
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        Select your AI IDE or client to get a ready-to-paste JSON snippet.
                                    </p>
                                </div>

                                {/* Quick Token Generator Shortcut */}
                                {!generatedPlainToken && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateTokenModal(true)}
                                        className="inline-flex items-center gap-1.5 self-start rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition-all"
                                    >
                                        <Key className="h-3.5 w-3.5" />
                                        <span>Generate Token for Config</span>
                                    </button>
                                )}
                            </div>

                            {/* Client Tabs */}
                            <div className="flex flex-wrap items-center gap-2">
                                {(
                                    [
                                        { id: 'cursor', label: 'Cursor', icon: Code },
                                        { id: 'claude', label: 'Claude Desktop', icon: Bot },
                                        { id: 'antigravity', label: 'Antigravity', icon: Boxes },
                                        { id: 'windsurf', label: 'Windsurf', icon: Zap },
                                    ] as const
                                ).map((client) => {
                                    const Icon = client.icon;
                                    const active = selectedClient === client.id;
                                    return (
                                        <button
                                            key={client.id}
                                            type="button"
                                            onClick={() => setSelectedClient(client.id)}
                                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                                active
                                                    ? 'border border-violet-500/40 bg-violet-600/20 text-white shadow-specular'
                                                    : 'border border-white/[0.06] bg-[#07090e]/80 text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                                            }`}
                                        >
                                            <Icon className={`h-3.5 w-3.5 ${active ? 'text-violet-400' : 'text-zinc-500'}`} />
                                            <span>{client.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Configuration Code Box */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-zinc-400">
                                    <span className="font-mono text-[11px] text-zinc-400">
                                        Paste into:{' '}
                                        <strong className="text-zinc-200">
                                            {configSnippets[selectedClient]?.file}
                                        </strong>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyConfig}
                                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white transition-all shadow-sm"
                                    >
                                        {copiedSnippet ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-zinc-400" />
                                        )}
                                        <span>{copiedSnippet ? 'Copied!' : 'Copy JSON'}</span>
                                    </button>
                                </div>

                                <div className="relative rounded-xl border border-white/[0.08] bg-[#05070c] p-4">
                                    <pre className="overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed selection:bg-violet-500 selection:text-white">
                                        {configSnippets[selectedClient]?.config}
                                    </pre>
                                </div>
                            </div>
                        </Card>

                        {/* MCP Tools Catalog Explorer */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                        Available MCP Tools ({tools.length})
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        The Model Context Protocol tools your connected agents can invoke autonomously.
                                    </p>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={toolSearch}
                                        onChange={(e) => setToolSearch(e.target.value)}
                                        placeholder="Search tools & descriptions…"
                                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {filteredTools.map((tool) => (
                                    <Card key={tool.name} className="p-4 sm:p-5 space-y-3" hoverable>
                                        <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-3">
                                            <div>
                                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                    <Terminal className="h-3.5 w-3.5 text-violet-400" />
                                                    <span>{tool.title}</span>
                                                </h4>
                                                <code className="text-[11px] font-mono text-violet-300">
                                                    {tool.name}
                                                </code>
                                            </div>
                                            <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                                                {tool.parameters.length} param{tool.parameters.length === 1 ? '' : 's'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-zinc-300 leading-relaxed">
                                            {tool.description}
                                        </p>

                                        {/* Parameter Table */}
                                        {tool.parameters.length > 0 && (
                                            <div className="space-y-1.5">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                    Arguments
                                                </div>
                                                <div className="divide-y divide-white/[0.04] rounded-lg border border-white/[0.06] bg-[#07090e]/60 p-2">
                                                    {tool.parameters.map((param) => (
                                                        <div
                                                            key={param.name}
                                                            className="flex flex-col py-1.5 first:pt-0 last:pb-0 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-[11px] font-semibold text-zinc-200">
                                                                    {param.name}
                                                                </span>
                                                                <span className="font-mono text-[9px] text-zinc-500">
                                                                    ({param.type})
                                                                </span>
                                                                {param.required ? (
                                                                    <span className="text-[9px] font-semibold text-rose-400">
                                                                        required
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] text-zinc-500">
                                                                        optional
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-zinc-400">
                                                                {param.description}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Example Call */}
                                        <div className="space-y-1 pt-1">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                Example Tool Call
                                            </div>
                                            <div className="rounded-lg border border-white/[0.06] bg-black/40 px-3 py-1.5 font-mono text-[11px] text-zinc-400 overflow-x-auto">
                                                {tool.example}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: AGENT ACTIVITY STREAM */}
                {activeTab === 'stream' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Stream Filter Bar */}
                        <Card className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedToolFilter('all')}
                                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                            selectedToolFilter === 'all'
                                                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                                                : 'text-zinc-400 hover:text-white bg-white/[0.02]'
                                        }`}
                                    >
                                        All Tools
                                    </button>
                                    {distinctTools.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setSelectedToolFilter(t)}
                                            className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-all ${
                                                selectedToolFilter === t
                                                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                                                    : 'text-zinc-400 hover:text-white bg-white/[0.02]'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={activitySearch}
                                        onChange={(e) => setActivitySearch(e.target.value)}
                                        placeholder="Filter stream by ticket or message…"
                                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Stream Activity List */}
                        {filteredActivities.length > 0 ? (
                            <div className="space-y-3">
                                {filteredActivities.map((activity) => (
                                    <Card
                                        key={activity.id}
                                        className="p-4 sm:p-5 transition-all hover:border-violet-500/30"
                                    >
                                        <div className="flex items-start gap-3.5">
                                            {/* Agent Avatar Icon */}
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/40 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-sm shadow-violet-500/20">
                                                <Bot className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/40 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300 shadow-sm shadow-violet-500/10">
                                                            <Bot className="h-3 w-3 text-violet-400" />
                                                            <span>Agent</span>
                                                        </span>

                                                        {activity.tool && (
                                                            <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                                                                {activity.tool}
                                                            </span>
                                                        )}

                                                        <span className="text-xs font-semibold text-zinc-200">
                                                            {activity.user?.name ?? 'AI Agent'}
                                                        </span>

                                                        {activity.token_name && (
                                                            <span className="text-[10px] text-zinc-500">
                                                                via <strong className="text-zinc-400">{activity.token_name}</strong>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className="text-[11px] text-zinc-500 font-mono">
                                                        {formatActivityDate(activity.created_at)}
                                                    </span>
                                                </div>

                                                {/* Affected Ticket Reference */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Link
                                                        href={route('requests.show', activity.request_id)}
                                                        className="group flex items-center gap-1.5 text-xs font-bold text-white hover:text-violet-300 transition-colors"
                                                    >
                                                        <span className="rounded bg-violet-500/20 px-1.5 py-0.2 font-mono text-[10px] text-violet-300">
                                                            #REQ-{activity.request_id}
                                                        </span>
                                                        <span className="truncate group-hover:underline">
                                                            {activity.request_title}
                                                        </span>
                                                        <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-violet-300" />
                                                    </Link>
                                                </div>

                                                {/* Action Body Description */}
                                                <p className="text-xs text-zinc-300 leading-relaxed">
                                                    {activity.body || activity.type}
                                                </p>

                                                {/* Metadata Parameters / Changes */}
                                                {Boolean(
                                                    activity.metadata &&
                                                    Array.isArray(activity.metadata.fields_updated) &&
                                                    activity.metadata.fields_updated.length > 0
                                                ) && (
                                                    <div className="flex flex-wrap items-center gap-1 pt-1">
                                                        <span className="text-[10px] text-zinc-500">
                                                            Modified:{' '}
                                                            <span className="font-mono text-zinc-400">
                                                                {(activity.metadata!.fields_updated as string[]).join(', ')}
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 text-center space-y-3">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-sm shadow-violet-500/10">
                                    <Bot className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-white">No Agent Activity Recorded Yet</h3>
                                <p className="mx-auto max-w-md text-xs text-zinc-400 leading-relaxed">
                                    Once your AI coding agent (Cursor, Claude Desktop, Antigravity, or Windsurf) invokes Relay MCP tools,
                                    all actions, status updates, and discussion comments will stream here live.
                                </p>
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('setup')}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all"
                                    >
                                        <Cpu className="h-3.5 w-3.5 text-violet-400" />
                                        <span>View Setup Instructions</span>
                                    </button>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* TAB 3: ACTIVE AGENTS & PERMISSIONS */}
                {activeTab === 'tokens' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        <Card className="p-5 sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Key className="h-4 w-4 text-violet-400" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                                            Active Agent Tokens ({tokensList.length})
                                        </h2>
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        Tokens granting MCP coding agents and automated scripts access to your workspace.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTokenName('Cursor Agent');
                                        setShowCreateTokenModal(true);
                                    }}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-specular transition-all hover:from-violet-500 hover:to-indigo-500 self-start"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>New Token</span>
                                </button>
                            </div>

                            {/* Tokens Table */}
                            {tokensList.length > 0 ? (
                                <div className="divide-y divide-white/[0.04] overflow-hidden rounded-xl border border-white/[0.06] bg-[#07090e]/60">
                                    {tokensList.map((token) => (
                                        <div
                                            key={token.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-white/[0.01] transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-zinc-200">
                                                        {token.name}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[9px] font-medium text-emerald-300">
                                                        Active
                                                    </span>
                                                </div>

                                                {/* Capabilities / Abilities Badges */}
                                                <div className="flex flex-wrap items-center gap-1 pt-1">
                                                    <span className="text-[10px] text-zinc-500 mr-1">Scopes:</span>
                                                    {(token.abilities || ['*']).map((ab) => (
                                                        <span
                                                            key={ab}
                                                            className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.2 font-mono text-[9px] text-violet-300"
                                                        >
                                                            {ab}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 pt-1">
                                                    <span>Created {formatActivityDate(token.created_at)}</span>
                                                    <span>·</span>
                                                    <span>
                                                        Last used:{' '}
                                                        {token.last_used_at
                                                            ? formatActivityDate(token.last_used_at)
                                                            : 'Never'}
                                                    </span>
                                                    {token.expires_at && (
                                                        <>
                                                            <span>·</span>
                                                            <span>Expires {formatActivityDate(token.expires_at)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setTokenToRevoke(token)}
                                                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:border-rose-400 hover:bg-rose-500/20 transition-all self-start sm:self-auto"
                                                title="Revoke access token"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                <span>Revoke</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-zinc-500">
                                    No agent access tokens found. Click "New Token" to create one.
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            {/* Create Token Modal */}
            <Modal
                show={showCreateTokenModal}
                onClose={() => setShowCreateTokenModal(false)}
                maxWidth="md"
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                        <Key className="h-4 w-4 text-violet-400" />
                        <h3 className="text-base font-bold text-white">Create Agent Access Token</h3>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Create a scoped personal access token for your AI coding assistant (Cursor, Claude Desktop, Antigravity, or Windsurf).
                    </p>

                    <div className="space-y-3">
                        <div>
                            <InputLabel value="Agent / Token Label" />
                            <TextInput
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                placeholder="e.g. Cursor IDE Assistant"
                                className="mt-1 w-full"
                            />
                        </div>

                        <div>
                            <InputLabel value="Permitted Capabilities" />
                            <div className="mt-2 space-y-2">
                                {[
                                    {
                                        scope: 'requests:read',
                                        label: 'Read Requests & Briefings',
                                        desc: 'Allows reading tasks, sprints, briefing metrics, and task discussions.',
                                    },
                                    {
                                        scope: 'requests:write',
                                        label: 'Write Requests & Comments',
                                        desc: 'Allows creating tasks, updating status/blockers, and posting progress comments.',
                                    },
                                    {
                                        scope: '*',
                                        label: 'Full Workspace Admin Access (*)',
                                        desc: 'Grants complete read and write access across all tools.',
                                    },
                                ].map((item) => {
                                    const checked = selectedAbilities.includes(item.scope);
                                    return (
                                        <label
                                            key={item.scope}
                                            className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-[#07090e]/60 p-2.5 cursor-pointer hover:bg-white/[0.02]"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAbilities([...selectedAbilities, item.scope]);
                                                    } else {
                                                        setSelectedAbilities(
                                                            selectedAbilities.filter((s) => s !== item.scope)
                                                        );
                                                    }
                                                }}
                                                className="mt-0.5 rounded border-white/20 bg-black text-violet-500 focus:ring-violet-500"
                                            />
                                            <div className="text-xs">
                                                <div className="font-semibold text-zinc-200">
                                                    {item.label}
                                                </div>
                                                <div className="text-[11px] text-zinc-400">{item.desc}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] pt-4">
                        <SecondaryButton
                            onClick={() => setShowCreateTokenModal(false)}
                            disabled={creatingToken}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleCreateToken}
                            disabled={creatingToken || !tokenName.trim()}
                        >
                            {creatingToken ? 'Generating…' : 'Generate Token'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Revoke Token Confirmation Dialog */}
            <ConfirmDialog
                open={tokenToRevoke !== null}
                onClose={() => setTokenToRevoke(null)}
                onConfirm={handleRevokeToken}
                title={`Revoke agent token "${tokenToRevoke?.name}"?`}
                description="Any AI agents or MCP servers using this personal access token will immediately lose access to Relay Studio."
                confirmLabel="Revoke Token"
                variant="danger"
                loading={revokingToken}
            />
        </AuthenticatedLayout>
    );
}
