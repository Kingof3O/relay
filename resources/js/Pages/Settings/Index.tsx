import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { WorkspaceProject, WorkspaceUser } from '@/types/workspace';
import { Head } from '@inertiajs/react';
import { FolderKanban, Users, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import {
    ProjectsManagementCard,
    TeamManagementCard,
    MemberFormModal,
    WorkspaceSnapshotCard,
} from '@/Features/Settings';
import type { RoleOption } from '@/Features/Settings/components/MemberFormModal';

export default function Settings({
    projects: initialProjects,
    users: initialUsers,
    roles,
    canManageAreas,
    canManageTeam,
    audits = [],
}: PageProps<{
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    roles: RoleOption[];
    canManageAreas: boolean;
    canManageTeam: boolean;
    audits?: any[];
}>) {
    const [projects, setProjects] = useState<WorkspaceProject[]>(initialProjects);
    const [users, setUsers] = useState<WorkspaceUser[]>(initialUsers);
    const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'snapshot'>('projects');
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
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                Controls
                            </span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[11px] text-zinc-500">Workspace Management</span>
                        </div>
                        <h1 className="mt-1 text-lg font-semibold text-zinc-100 sm:text-xl">
                            Studio Settings
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#111216] px-3 py-1 font-medium text-emerald-400 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Relay Studio Engine v2.4
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Settings · Workspace Studio" />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Modern Obsidian Tab Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                    <nav className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111216] p-1.5 shadow-sm">
                        {/* 1. Projects & Initiatives Tab */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('projects')}
                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                activeTab === 'projects'
                                    ? 'border border-violet-500/40 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-700/60 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <FolderKanban
                                className={`h-3.5 w-3.5 ${
                                    activeTab === 'projects' ? 'text-violet-400' : 'text-zinc-500'
                                }`}
                            />
                            <span>Projects & Initiatives</span>
                            <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                    activeTab === 'projects'
                                        ? 'bg-violet-500/25 text-violet-200'
                                        : 'bg-zinc-800 text-zinc-400'
                                }`}
                            >
                                {activeProjectsCount}
                            </span>
                        </button>

                        {/* 2. Team & Access Control Tab */}
                        {canManageTeam && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('team')}
                                className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                    activeTab === 'team'
                                        ? 'border border-cyan-500/40 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                        : 'border border-transparent text-zinc-400 hover:border-zinc-700/60 hover:bg-[#14161c] hover:text-zinc-200'
                                }`}
                            >
                                <Users
                                    className={`h-3.5 w-3.5 ${
                                        activeTab === 'team' ? 'text-cyan-400' : 'text-zinc-500'
                                    }`}
                                />
                                <span>Team & Access Control</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                        activeTab === 'team'
                                            ? 'bg-cyan-500/25 text-cyan-200'
                                            : 'bg-zinc-800 text-zinc-400'
                                    }`}
                                >
                                    {teamCount}
                                </span>
                            </button>
                        )}

                        {/* 3. Workspace Snapshot Tab */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('snapshot')}
                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${
                                activeTab === 'snapshot'
                                    ? 'border border-emerald-500/40 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-700/60 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <Sparkles
                                className={`h-3.5 w-3.5 ${
                                    activeTab === 'snapshot' ? 'text-emerald-400' : 'text-zinc-500'
                                }`}
                            />
                            <span>Workspace Snapshot</span>
                            <span
                                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                    activeTab === 'snapshot'
                                        ? 'bg-emerald-500/25 text-emerald-200'
                                        : 'bg-zinc-800 text-zinc-400'
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

                {activeTab === 'snapshot' && (
                    <WorkspaceSnapshotCard
                        activeProjectsCount={activeProjectsCount}
                        teamAccountsCount={teamCount}
                        projects={projects}
                        users={users}
                        audits={audits}
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
