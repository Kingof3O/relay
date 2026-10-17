import type {
    RequestStatus,
    RequestPriority,
    WorkspaceProject,
    WorkspaceArea,
    WorkspaceUser,
    RequestFileItem,
    RequestActivityItem,
    WorkRequestCard,
    WorkRequestDetail,
} from './workspace';

export * from './workspace';

export interface Role {
    id: number;
    name: string;
}

export interface Permission {
    id: number;
    name: string;
}

export type User = WorkspaceUser;

export interface WorkspaceNotification {
    id: string;
    read_at?: string | null;
    event?: string;
    request_id?: number;
    request_title?: string;
    message?: string;
    url?: string;
    created_at?: string | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
        role?: Role | null;
        permissions: string[];
    };
    workspaceNotifications?: WorkspaceNotification[];
    unreadNotificationsCount?: number;
};
