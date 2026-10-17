import type { Role, User, WorkspaceNotification } from './models';

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        role?: Role | null;
        permissions: string[];
    };
    workspaceNotifications?: WorkspaceNotification[];
    unreadNotificationsCount?: number;
};
