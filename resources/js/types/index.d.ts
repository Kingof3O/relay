import type { Role, User, Workspace, WorkspaceNotification } from './models';

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        role?: Role | null;
        permissions: string[];
    };
    currentWorkspace?: Workspace | null;
    userWorkspaces?: Workspace[];
    workspaceNotifications?: WorkspaceNotification[];
    unreadNotificationsCount?: number;
    savedViews?: import('./workspace').SavedViewItem[];
    flash?: {
        alert?: string | null;
        message?: string | null;
        success?: string | null;
        error?: string | null;
    };
    locale?: string;
    translations?: Record<string, any>;
    i18n?: {
        locale: string;
        translations: Record<string, any>;
    };
};

