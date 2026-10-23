# Model Context Protocol (MCP) Integration Guide

Relay Studio includes a first-party **Model Context Protocol (MCP)** server (`@relay/mcp-server`) that enables AI assistants and autonomous coding agents (such as **Antigravity**, **Cursor**, **Claude Desktop**, and **Windsurf**) to interact directly with your workspace.

With Relay MCP, your agent acts as a proactive technical peer:
- Delivering an instant **morning briefing** of urgent blockers, overnight tickets, and sprint status.
- Transitioning cards on your Kanban board (`ready` $\rightarrow$ `doing` $\rightarrow$ `review` $\rightarrow$ `done`) as it picks up and completes tasks.
- Leaving technical progress notes, commit summaries, and code review comments.
- Creating follow-up bug reports or subtasks directly under active projects.

---

## Architecture Overview

```mermaid
flowchart LR
    subgraph Client Environments
        A1[Antigravity IDE]
        A2[Cursor IDE]
        A3[Claude Desktop]
    end

    subgraph Local Machine
        MCP[Relay MCP Server<br/><code>mcp-server/dist/index.js</code>]
    end

    subgraph Relay Studio Server
        API[REST API v1<br/><code>/api/v1/*</code>]
        Auth[Sanctum Token Auth]
        Tenant[Workspace Tenant Scoping]
        DB[(Database)]
    end

    Client Environments <-->|stdio JSON-RPC 2.0| MCP
    MCP <-->|HTTPS Bearer Token| API
    API --> Auth --> Tenant --> DB
```

---

## 🛠️ Available MCP Tools

| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| **`relay_get_daily_briefing`** | `since_hours` (optional number, default 24) | Returns a structured morning briefing containing: open task metrics, urgent items, blocked tickets, tickets created in the time window, active cycle velocity, and unread notifications. |
| **`relay_list_tasks`** | `status`, `priority`, `area_id`, `per_page`, `page` | Queries and filters workspace issues. Supports filtering by stage (`new`, `ready`, `doing`, `review`, `done`) and priority (`urgent`, `normal`, `low`). |
| **`relay_get_task`** | `id` (required number) | Retrieves complete ticket details: description, assignee, priority, status, story points, due date, subtasks, blockers, and relationships. |
| **`relay_update_task`** | `id`, `status`, `priority`, `title`, `description`, `assignee_id`, `story_points`, `is_blocked`, `blocked_reason`, `due_date`, `tags` | Updates ticket properties on the board with optimistic locking protection. |
| **`relay_create_task`** | `title`, `area_id`, `priority`, `description`, `status`, `story_points`, `assignee_id`, `due_date`, `tags` | Creates a new task under a specific project/area. |
| **`relay_add_comment`** | `task_id` (required number), `body` (required string) | Posts a technical update or comment on a ticket. Parses `@username` mentions and dispatches notifications automatically. |
| **`relay_list_comments`** | `task_id` (required number) | Retrieves the chronological discussion thread for any ticket. |
| **`relay_list_projects`** | *none* | Discovers all active projects and areas in the workspace with their IDs and slugs. |
| **`relay_get_active_cycle`** | *none* | Fetches the active sprint, start/end dates, days remaining, story points completed, and task status breakdown. |

---

## 🔑 Generating a Personal Access Token

To connect your agent, generate a Personal Access Token (PAT) with read/write abilities:

### Method A: Via Web UI
1. Navigate to **Profile > Personal Access Tokens** (`/profile/tokens`).
2. Click **Create Token**, enter a name (e.g. `antigravity-mcp`), and select token abilities (`requests:read`, `requests:write`, or full access `*`).
3. Copy the token string (e.g. `1|Q93LJDnnVp...`).

### Method B: Via Artisan CLI
Run the built-in CLI command on your Relay server:
```bash
# Generate token for a specific user
php artisan relay:token <username> "agent-token"

# Example:
php artisan relay:token hussien "antigravity-mcp"
```

---

## ⚙️ Client Configurations

### 1. Antigravity
Add the server definition to `~/.gemini/config/mcp_config.json`:
```json
{
  "mcpServers": {
    "relay": {
      "command": "node",
      "args": [
        "/Volumes/Main/Herd/stm/mcp-server/dist/index.js"
      ],
      "env": {
        "RELAY_URL": "https://relay.schmobinquiz.de",
        "RELAY_API_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

### 2. Cursor IDE
Add to `~/.cursor/mcp.json` or project-level `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "relay": {
      "command": "node",
      "args": [
        "/absolute/path/to/relay/mcp-server/dist/index.js"
      ],
      "env": {
        "RELAY_URL": "https://your-relay-domain.com",
        "RELAY_API_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

### 3. Claude Desktop
Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):
```json
{
  "mcpServers": {
    "relay": {
      "command": "node",
      "args": [
        "/absolute/path/to/relay/mcp-server/dist/index.js"
      ],
      "env": {
        "RELAY_URL": "https://your-relay-domain.com",
        "RELAY_API_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

---

## 💡 Example Workflows & Prompts

### The Morning Catch-Up
```
User: "Good morning! What's new in Relay today?"
```
*Agent executes `relay_get_daily_briefing` and reports:*
- 🚨 **Urgent & Blocked Items:** 1 ticket blocked on 3D assets.
- 📥 **New Requests:** 2 tickets submitted overnight.
- 🏁 **Sprint Velocity:** Cycle 2 ends in 3 days; 14 / 18 pts delivered.
- 📬 **Mentions:** You were tagged in `#REQ-12`.

### Picking Up and Working on a Ticket
```
User: "Pick up ticket #REQ-12, move it to in progress, and investigate the bug."
```
1. Agent calls `relay_update_task(id: 12, status: "doing")`.
2. Agent calls `relay_add_comment(task_id: 12, body: "Agent started working on fix.")`.
3. Agent analyzes repository code and resolves the bug.
4. Agent runs test suite (`php artisan test`).
5. Agent calls `relay_update_task(id: 12, status: "review")`.
6. Agent calls `relay_add_comment(task_id: 12, body: "Fix implemented in commit 375817b. All 243 tests pass.")`.

---

## 🔒 Security & Tenant Guarantees

1. **Authentication**: All communication uses Laravel Sanctum token verification with strict ability scoping (`requests:read`, `requests:write`, `*`).
2. **Tenant Boundary Enforcement**: Queries automatically filter by the user's active workspace. Cross-workspace data leakage is prevented at the database level.
3. **Optimistic Locking**: Modifications verify `lock_version` to prevent overwriting updates made concurrently by human teammates.
4. **Data Sanitization**: Sensitive authentication artifacts (password hashes, two-factor secrets, remember tokens) are permanently excluded from API resources.
