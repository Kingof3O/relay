import { WorkRequestCard } from '@/types/workspace';

export interface VelocityPoint {
    day: string;
    date: string;
    created: number;
    completed: number;
}

export interface ProjectStat {
    id: number;
    name: string;
    slug: string;
    color: string;
    total: number;
    done: number;
    active: number;
    blocked: number;
    percentage: number;
}

export interface TeamMemberWorkload {
    id: number;
    name: string;
    username: string;
    role: string;
    active: number;
    review: number;
    done: number;
}

export type DashboardStats = {
    new: number;
    my_work: number;
    review: number;
    blocked: number;
    urgent: number;
    done: number;
    total: number;
    completion_rate: number;
};

export interface DashboardActivityItem {
    id: number;
    request_id: number;
    request_title: string;
    type: string;
    body?: string | null;
    metadata?: Record<string, unknown> | null;
    is_agent?: boolean;
    user?: { id: number; name: string } | null;
    created_at?: string | null;
}
