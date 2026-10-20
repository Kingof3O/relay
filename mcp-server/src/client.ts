import type {
  RelayBriefing,
  RelayComment,
  RelayCycle,
  RelayProject,
  RelayTask,
} from './types.js';

export class RelayClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl?: string, token?: string) {
    const rawUrl = baseUrl || process.env.RELAY_URL || 'https://relay.schmobinquiz.de';
    this.baseUrl = rawUrl.replace(/\/+$/, '');
    this.token = (token || process.env.RELAY_API_TOKEN || '').trim();

    if (!this.token) {
      throw new Error(
        'Relay MCP Server requires a Personal Access Token. Set RELAY_API_TOKEN in your environment or MCP server configuration. You can create one in Relay Studio under /profile/tokens.'
      );
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: any) {
      throw new Error(`Failed to connect to Relay Studio at ${this.baseUrl}: ${err.message || String(err)}`);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = (await response.json()) as any;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.errors) {
          errorMessage = Object.values(errorData.errors).flat().join(', ');
        }
      } catch {
        // Fallback to text status
      }
      throw new Error(`Relay API error (${response.status}): ${errorMessage}`);
    }

    return (await response.json()) as T;
  }

  /**
   * Fetches the daily morning briefing.
   */
  async getBriefing(sinceHours: number = 24): Promise<RelayBriefing> {
    return this.request<RelayBriefing>(`/api/v1/briefing?since_hours=${encodeURIComponent(sinceHours)}`);
  }

  /**
   * Lists tasks with optional filters.
   */
  async listTasks(filters: {
    status?: string;
    priority?: string;
    area_id?: number;
    per_page?: number;
    page?: number;
  } = {}): Promise<{ data: RelayTask[]; meta?: any }> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.area_id) params.set('area_id', String(filters.area_id));
    if (filters.per_page) params.set('per_page', String(filters.per_page));
    if (filters.page) params.set('page', String(filters.page));

    const qs = params.toString();
    return this.request<{ data: RelayTask[]; meta?: any }>(`/api/v1/work-requests${qs ? `?${qs}` : ''}`);
  }

  /**
   * Fetches full details for a single task.
   */
  async getTask(id: number): Promise<{ data: RelayTask }> {
    return this.request<{ data: RelayTask }>(`/api/v1/work-requests/${id}`);
  }

  /**
   * Creates a new task in the workspace.
   */
  async createTask(data: {
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
  }): Promise<{ data: RelayTask }> {
    return this.request<{ data: RelayTask }>('/api/v1/work-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Updates an existing task (status, priority, description, etc.).
   */
  async updateTask(
    id: number,
    data: {
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
    }
  ): Promise<{ data: RelayTask }> {
    return this.request<{ data: RelayTask }>(`/api/v1/work-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Lists comments on a task.
   */
  async listComments(taskId: number): Promise<{ request_id: number; comments: RelayComment[] }> {
    return this.request<{ request_id: number; comments: RelayComment[] }>(`/api/v1/work-requests/${taskId}/comments`);
  }

  /**
   * Adds a new comment to a task.
   */
  async addComment(taskId: number, body: string): Promise<{ message: string; comment: RelayComment }> {
    return this.request<{ message: string; comment: RelayComment }>(`/api/v1/work-requests/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  /**
   * Lists projects/areas in the workspace.
   */
  async listProjects(): Promise<{ data: RelayProject[] }> {
    return this.request<{ data: RelayProject[] }>('/api/v1/projects');
  }

  /**
   * Gets the current active cycle.
   */
  async getActiveCycle(): Promise<{ active_cycle: RelayCycle | null; message?: string }> {
    return this.request<{ active_cycle: RelayCycle | null; message?: string }>('/api/v1/cycles/current');
  }

  /**
   * Lists recent cycles.
   */
  async listCycles(): Promise<{ data: RelayCycle[] }> {
    return this.request<{ data: RelayCycle[] }>('/api/v1/cycles');
  }
}
