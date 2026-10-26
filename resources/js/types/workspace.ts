export type RequestStatus = 'new' | 'ready' | 'doing' | 'review' | 'done';
export type RequestPriority = 'urgent' | 'normal' | 'low';

export interface WorkspaceProject {
    id: number;
    name: string;
    slug?: string;
    color?: string | null;
    sort_order?: number;
    active_count?: number;
    archived_at?: string | null;
}

export type WorkspaceArea = WorkspaceProject;

export interface Workspace {
    id: number;
    name: string;
    slug: string;
    owner_id?: number;
    logo_url?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface WorkspaceUser {
    id: number;
    name: string;
    username: string;
    email?: string | null;
    role_id?: number | null;
    role?: { id: number; name: string } | null;
    active?: boolean;
    force_password_reset?: boolean;
    preferences?: Record<string, any> | null;
    created_at?: string | null;
}

export interface RequestFileItem {
    id: number;
    original_name: string;
    type: 'image' | 'video' | 'document' | 'audio';
    mime_type: string | null;
    original_mime_type?: string | null;
    size: number;
    processing_status: 'processing' | 'ready' | 'failed';
    processing_error?: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    uploader?: WorkspaceUser | null;
    created_at?: string | null;
    url?: string | null;
    preview_url?: string | null;
}

export interface RequestActivityItem {
    id: number;
    type: string;
    body?: string | null;
    metadata?: Record<string, unknown> | null;
    is_agent?: boolean;
    user?: WorkspaceUser | null;
    created_at?: string | null;
}

export interface RequestRelationItem {
    id: number;
    request_id: number;
    related_id: number;
    type: 'blocks' | 'relates_to' | 'duplicate';
    created_at?: string | null;
    related?: {
        id: number;
        title: string;
        status: RequestStatus;
        status_label: string;
        priority: RequestPriority;
        priority_label?: string;
        is_blocked?: boolean;
    } | null;
}

export interface WorkRequestCard {
    id: number;
    workspace_id?: number;
    title: string;
    description?: string | null;
    status: RequestStatus;
    status_label: string;
    priority: RequestPriority;
    priority_label: string;
    is_blocked: boolean;
    blocked_reason?: string | null;
    due_date: string | null;
    due_human: string | null;
    is_overdue: boolean;
    story_points?: number | null;
    parent_id?: number | null;
    cycle_id?: number | null;
    rolled_over_from_cycle_id?: number | null;
    cycle?: {
        id: number;
        number: number;
        name: string;
        start_date?: string;
        end_date?: string;
        is_active?: boolean;
    } | null;
    subtasks_progress?: {
        total: number;
        completed: number;
        percentage: number;
    } | null;
    tags: string[];
    deleted_at: string | null;
    relations?: RequestRelationItem[];
    area_id?: number | null;
    project_id?: number | null;
    project?: WorkspaceProject | null;
    area?: WorkspaceProject | null;
    requester_id?: number | null;
    requester?: WorkspaceUser | null;
    assignee_id?: number | null;
    assignee?: WorkspaceUser | null;
    files_count?: number;
    file_states?: string[];
    lock_version?: number;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface LinkedPullRequest {
    id: number;
    provider: string;
    pr_number: number;
    title: string;
    url: string;
    status: 'open' | 'closed' | 'merged';
    is_draft: boolean;
    review_status: 'pending' | 'approved' | 'changes_requested';
    created_at?: string | null;
    updated_at?: string | null;
}

export interface WorkRequestDetail extends WorkRequestCard {
    files: RequestFileItem[];
    activities: RequestActivityItem[];
    comments?: RequestActivityItem[];
    subtasks?: WorkRequestCard[];
    pull_requests?: LinkedPullRequest[];
}

export interface CycleItem {
    id: number;
    number: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    completed_at?: string | null;
}

export interface SavedViewItem {
    id: number;
    name: string;
    icon: string;
    filters: Record<string, unknown>;
    group_by?: string | null;
    is_pinned: boolean;
}

export type WorkRequest = WorkRequestCard;

