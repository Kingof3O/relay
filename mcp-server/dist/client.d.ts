import type { RelayBriefing, RelayComment, RelayCycle, RelayProject, RelayTask } from './types.js';
export declare class RelayClient {
    private baseUrl;
    private token;
    constructor(baseUrl?: string, token?: string);
    private request;
    /**
     * Fetches the daily morning briefing.
     */
    getBriefing(sinceHours?: number): Promise<RelayBriefing>;
    /**
     * Lists tasks with optional filters.
     */
    listTasks(filters?: {
        status?: string;
        priority?: string;
        area_id?: number;
        per_page?: number;
        page?: number;
    }): Promise<{
        data: RelayTask[];
        meta?: any;
    }>;
    /**
     * Fetches full details for a single task.
     */
    getTask(id: number): Promise<{
        data: RelayTask;
    }>;
    /**
     * Creates a new task in the workspace.
     */
    createTask(data: {
        title: string;
        area_id: number;
        priority?: 'urgent' | 'normal' | 'low';
        description?: string;
        status?: 'new' | 'ready' | 'doing' | 'review' | 'done';
        story_points?: number;
        assignee_id?: number;
        due_date?: string;
        tags?: string[];
        is_blocked?: boolean;
        blocked_reason?: string;
    }): Promise<{
        data: RelayTask;
    }>;
    /**
     * Updates an existing task (status, priority, description, etc.).
     */
    updateTask(id: number, data: {
        status?: string;
        priority?: string;
        title?: string;
        description?: string;
        assignee_id?: number | null;
        story_points?: number | null;
        is_blocked?: boolean;
        blocked_reason?: string | null;
        due_date?: string | null;
        tags?: string[];
        lock_version?: number;
    }): Promise<{
        data: RelayTask;
    }>;
    /**
     * Lists comments on a task.
     */
    listComments(taskId: number): Promise<{
        request_id: number;
        comments: RelayComment[];
    }>;
    /**
     * Adds a new comment to a task.
     */
    addComment(taskId: number, body: string): Promise<{
        message: string;
        comment: RelayComment;
    }>;
    /**
     * Lists projects/areas in the workspace.
     */
    listProjects(): Promise<{
        data: RelayProject[];
    }>;
    /**
     * Gets the current active cycle.
     */
    getActiveCycle(): Promise<{
        active_cycle: RelayCycle | null;
        message?: string;
    }>;
    /**
     * Lists recent cycles.
     */
    listCycles(): Promise<{
        data: RelayCycle[];
    }>;
}
