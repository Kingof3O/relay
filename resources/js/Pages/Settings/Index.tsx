import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { PageProps } from '@/types';
import { WorkspaceProject, WorkspaceUser } from '@/types/workspace';
import { Head } from '@inertiajs/react';
import { FolderKanban, Users, Sparkles, Activity, ShieldCheck, Radio } from 'lucide-react';
import {
    ProjectsManagementCard,
    TeamManagementCard,
    MemberFormModal,
    WorkspaceSnapshotCard,
    OAuthProvidersCard,
} from '@/Features/Settings';
import {
    DiscordWebhookCard,
    EmailTemplateCard,
    type DiscordConfig,
    type EmailConfig,
} from '@/Features/Integrations';
import type { RoleOption } from '@/Features/Settings/components/MemberFormModal';

export default function Settings({
    projects: initialProjects,
    users: initialUsers,
    roles,
    canManageAreas,
    canManageTeam,
    oauthProviders,
    discord: initialDiscord,
    email: initialEmail,
    audits = [],
    auditMeta,
    auditEvents = [],
}: PageProps<{
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    roles: RoleOption[];
    canManageAreas: boolean;
    canManageTeam: boolean;
    oauthProviders?: Record<string, any>;
    discord?: DiscordConfig;
    email?: EmailConfig;
    audits?: any[];
    auditMeta?: any;
    auditEvents?: string[];
}>) {
    const [projects, setProjects] = useState<WorkspaceProject[]>(initialProjects);
    const [users, setUsers] = useState<WorkspaceUser[]>(initialUsers);
    const [discord, setDiscord] = useState<DiscordConfig | undefined>(initialDiscord);
    const [email, setEmail] = useState<EmailConfig | undefined>(initialEmail);
    const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'auth' | 'integrations' | 'snapshot'>('projects');
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [editingMember, setEditingMember] = useState<WorkspaceUser | null>(null);

    const handleSavedMember = (savedUser: WorkspaceUser, isEdit: boolean) => {
        setUsers((cur: WorkspaceUser[]) =>
            isEdit
                ? cur.map((u: WorkspaceUser) => (u.id === savedUser.id ? savedUser : u))
                : [...cur, savedUser]
        );
    };

    const activeProjectsCount = projects.filter((p: WorkspaceProject) => !p.archived_at).length;
    const teamCount = users.length;

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    crumbs={[
                        { label: 'Controls', href: route('settings.index') },
                        { label: 'Workspace Management' },
                    ]}
                    title="Studio Settings"
                    actions={
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#111216] px-3 py-1 text-xs font-medium text-emerald-400 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Relay Studio Engine v2.4
                        </span>
                    }
                />
            }
        >
            <Head title="Settings · Workspace Studio" />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Modern Obsidian Tab Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                    <nav className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111216] p-1.5 shadow-sm">
                        {/* 1. Projects Tab */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('projects')}
                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                activeTab === 'projects'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <FolderKanban
                                className={`h-3.5 w-3.5 ${
                                    activeTab === 'projects' ? 'text-zinc-200' : 'text-zinc-500'
                                }`}
                            />
                            <span>Projects</span>
                            <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                    activeTab === 'projects'
                                        ? 'bg-zinc-750 text-zinc-300'
                                        : 'bg-zinc-850 text-zinc-500'
                                }`}
                            >
                                {activeProjectsCount}
                            </span>
                        </button>

                        {/* 2. Team & Roles Tab */}
                        {canManageTeam && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('team')}
                                className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                    activeTab === 'team'
                                        ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                        : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                                }`}
                            >
                                <Users
                                    className={`h-3.5 w-3.5 ${
                                        activeTab === 'team' ? 'text-zinc-200' : 'text-zinc-500'
                                    }`}
                                />
                                <span>Team & Roles</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                        activeTab === 'team'
                                            ? 'bg-zinc-750 text-zinc-300'
                                            : 'bg-zinc-850 text-zinc-500'
                                    }`}
                                >
                                    {teamCount}
                                </span>
                            </button>
                        )}

                        {/* 3. Authentication Tab */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('auth')}
                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                activeTab === 'auth'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <ShieldCheck
                                className={`h-3.5 w-3.5 ${
                                    activeTab === 'auth' ? 'text-zinc-200' : 'text-zinc-500'
                                }`}
                            />
                            <span>Authentication</span>
                            <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                    activeTab === 'auth'
                                        ? 'bg-zinc-750 text-zinc-300'
                                        : 'bg-zinc-850 text-zinc-500'
                                }`}
                            >
                                Security
                            </span>
                        </button>

                        {/* 4. Integrations & Alerts Tab */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('integrations')}
                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                activeTab === 'integrations'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <Radio
                                className={`h-3.5 w-3.5 ${
                                    activeTab === 'integrations' ? 'text-zinc-200' : 'text-zinc-500'
                                }`}
                            />
                            <span>Integrations & Alerts</span>
                            <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                    activeTab === 'integrations'
                                        ? 'bg-zinc-750 text-zinc-300'
                                        : 'bg-zinc-850 text-zinc-500'
                                }`}
                            >
                                Discord + Mail
                            </span>
                        </button>

                        {/* 5. Workspace Snapshot Tab */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('snapshot')}
                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                activeTab === 'snapshot'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <Sparkles
                                className={`h-3.5 w-3.5 ${
                                    activeTab === 'snapshot' ? 'text-zinc-200' : 'text-zinc-500'
                                }`}
                            />
                            <span>Workspace Snapshot</span>
                            <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                    activeTab === 'snapshot'
                                        ? 'bg-zinc-750 text-zinc-300'
                                        : 'bg-zinc-850 text-zinc-500'
                                }`}
                            >
                                Live
                            </span>
                        </button>
                    </nav>

                    <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                        <span>Workspace Scope: Global</span>
                        <span>•</span>
                        <span className="text-zinc-400">1600px High-Density View</span>
                    </div>
                </div>

                {/* Tab Panels */}
                {activeTab === 'projects' && (
                    <ProjectsManagementCard
                        projects={projects}
                        setProjects={setProjects}
                        canManageAreas={canManageAreas}
                    />
                )}

                {activeTab === 'team' && canManageTeam && (
                    <TeamManagementCard
                        users={users}
                        setUsers={setUsers}
                        onAddMember={() => {
                            setEditingMember(null);
                            setShowMemberModal(true);
                        }}
                        onEditMember={(user: WorkspaceUser) => {
                            setEditingMember(user);
                            setShowMemberModal(true);
                        }}
                    />
                )}

                {activeTab === 'auth' && (
                    <OAuthProvidersCard initialProviders={oauthProviders} />
                )}

                {activeTab === 'integrations' && (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-zinc-800 bg-[#090a0f] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <Radio className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-200">
                                        Advanced Integrations & Real-Time Delivery Dashboard
                                    </h3>
                                    <p className="text-[11px] text-zinc-400">
                                        Monitor delivery logs, test email rendering live, and inspect dual-channel webhook statuses.
                                    </p>
                                </div>
                            </div>
                            <a
                                href={route('integrations.index')}
                                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors shadow-sm"
                            >
                                <span>Open Full Integrations Studio &rarr;</span>
                            </a>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {discord && (
                                <DiscordWebhookCard
                                    config={discord}
                                    onUpdated={(newCfg) => setDiscord(newCfg)}
                                    canManage={canManageTeam}
                                />
                            )}
                            {email && (
                                <EmailTemplateCard
                                    config={email}
                                    onUpdated={(newCfg) => setEmail(newCfg)}
                                    canManage={canManageTeam}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'snapshot' && (
                    <WorkspaceSnapshotCard
                        activeProjectsCount={activeProjectsCount}
                        teamAccountsCount={teamCount}
                        projects={projects}
                        users={users}
                        audits={audits}
                        auditMeta={auditMeta}
                        auditEvents={auditEvents}
                        onSelectTab={(tab) => setActiveTab(tab)}
                    />
                )}
            </div>

            {canManageTeam && (
                <MemberFormModal
                    show={showMemberModal}
                    onClose={() => setShowMemberModal(false)}
                    roles={roles}
                    editingMember={editingMember}
                    onSaved={handleSavedMember}
                />
            )}
        </AuthenticatedLayout>
    );
}
