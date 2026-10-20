export interface RelayWorkspace {
    id: number;
    name: string;
    slug: string;
}
export interface RelayUser {
    id: number;
    name: string;
    username: string;
    email?: string;
}
export interface RelayProject {
    id: number;
    name: string;
    slug: string;
    color?: string;
}
export interface RelayTask {
    id: number;
    workspace_id: number;
    area_id: number;
    title: string;
    description: string | null;
    status: 'new' | 'ready' | 'doing' | 'in_progress' | 'review' | 'done' | 'cancelled';
    priority: 'urgent' | 'normal' | 'low';
    story_points: number | null;
    is_blocked: boolean;
    blocked_reason: string | null;
    due_date: string | null;
    tags: string[];
    lock_version?: number;
    area?: RelayProject;
    assignee?: RelayUser | null;
    requester?: RelayUser | null;
    subtasks?: RelayTask[];
    created_at: string;
    updated_at: string;
}
export interface RelayCycle {
    id: number;
    name: string;
    number: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    days_remaining: number | null;
    total_points: number;
    completed_points: number;
    points_progress_percentage: number;
    total_tasks: number;
    completed_tasks: number;
    status_breakdown?: Record<string, number>;
}
export interface RelayBriefing {
    workspace: RelayWorkspace;
    user: RelayUser;
    window: {
        since_hours: number;
        cutoff: string;
        generated_at: string;
    };
    metrics: {
        total_open: number;
        in_progress: number;
        in_review: number;
        urgent: number;
        blocked: number;
        overdue: number;
        my_assigned: number;
        created_since_window: number;
        unread_notifications: number;
    };
    urgent_and_blocked: RelayTask[];
    new_requests: RelayTask[];
    my_tasks: RelayTask[];
    active_cycle: RelayCycle | null;
    recent_notifications: Array<{
        id: string;
        type: string;
        data: any;
        created_at: string;
    }>;
}
export interface RelayComment {
    id: number;
    body: string;
    created_at: string;
    user: RelayUser | null;
}
