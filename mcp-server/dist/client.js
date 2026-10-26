export class RelayClient {
    baseUrl;
    token;
    constructor(baseUrl, token) {
        const rawUrl = baseUrl || process.env.RELAY_URL || 'http://localhost:8080';
        this.baseUrl = rawUrl.replace(/\/+$/, '');
        this.token = (token || process.env.RELAY_API_TOKEN || '').trim();
        if (!this.token) {
            throw new Error('Relay MCP Server requires a Personal Access Token. Set RELAY_API_TOKEN in your environment or MCP server configuration. You can create one in Relay Studio under /profile/tokens.');
        }
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Relay-MCP-Server/1.0',
            'X-Relay-Agent': 'mcp-server',
            ...options.headers,
        };
        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers,
            });
        }
        catch (err) {
            throw new Error(`Failed to connect to Relay Studio at ${this.baseUrl}: ${err.message || String(err)}`);
        }
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status} ${response.statusText}`;
            try {
                const errorData = (await response.json());
                if (errorData?.message) {
                    errorMessage = errorData.message;
                }
                else if (errorData?.errors) {
                    errorMessage = Object.values(errorData.errors).flat().join(', ');
                }
            }
            catch {
                // Fallback to text status
            }
            throw new Error(`Relay API error (${response.status}): ${errorMessage}`);
        }
        return (await response.json());
    }
    /**
     * Fetches the daily morning briefing.
     */
    async getBriefing(sinceHours = 24) {
        return this.request(`/api/v1/briefing?since_hours=${encodeURIComponent(sinceHours)}`, {
            headers: { 'X-Relay-Tool': 'relay_get_daily_briefing' },
        });
    }
    /**
     * Lists tasks with optional filters.
     */
    async listTasks(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status)
            params.set('status', filters.status);
        if (filters.priority)
            params.set('priority', filters.priority);
        if (filters.area_id)
            params.set('area_id', String(filters.area_id));
        if (filters.per_page)
            params.set('per_page', String(filters.per_page));
        if (filters.page)
            params.set('page', String(filters.page));
        const qs = params.toString();
        return this.request(`/api/v1/work-requests${qs ? `?${qs}` : ''}`, {
            headers: { 'X-Relay-Tool': 'relay_list_tasks' },
        });
    }
    /**
     * Fetches full details for a single task.
     */
    async getTask(id) {
        return this.request(`/api/v1/work-requests/${id}`, {
            headers: { 'X-Relay-Tool': 'relay_get_task' },
        });
    }
    /**
     * Creates a new task in the workspace.
     */
    async createTask(data) {
        return this.request('/api/v1/work-requests', {
            method: 'POST',
            headers: { 'X-Relay-Tool': 'relay_create_task' },
            body: JSON.stringify(data),
        });
    }
    /**
     * Updates an existing task (status, priority, description, etc.).
     */
    async updateTask(id, data) {
        return this.request(`/api/v1/work-requests/${id}`, {
            method: 'PATCH',
            headers: { 'X-Relay-Tool': 'relay_update_task' },
            body: JSON.stringify(data),
        });
    }
    /**
     * Lists comments on a task.
     */
    async listComments(taskId) {
        return this.request(`/api/v1/work-requests/${taskId}/comments`, {
            headers: { 'X-Relay-Tool': 'relay_list_comments' },
        });
    }
    /**
     * Adds a new comment to a task.
     */
    async addComment(taskId, body) {
        return this.request(`/api/v1/work-requests/${taskId}/comments`, {
            method: 'POST',
            headers: { 'X-Relay-Tool': 'relay_add_comment' },
            body: JSON.stringify({ body }),
        });
    }
    /**
     * Lists projects/areas in the workspace.
     */
    async listProjects() {
        return this.request('/api/v1/projects', {
            headers: { 'X-Relay-Tool': 'relay_list_projects' },
        });
    }
    /**
     * Gets the current active cycle.
     */
    async getActiveCycle() {
        return this.request('/api/v1/cycles/current', {
            headers: { 'X-Relay-Tool': 'relay_get_active_cycle' },
        });
    }
    /**
     * Lists recent cycles.
     */
    async listCycles() {
        return this.request('/api/v1/cycles', {
            headers: { 'X-Relay-Tool': 'relay_list_cycles' },
        });
    }
}
//# sourceMappingURL=client.js.map