# Relay Studio MCP Server

Official **Model Context Protocol (MCP)** server for [Relay Studio](https://relay.schmobinquiz.de).

Connect your AI coding assistants (Antigravity, Cursor, Claude Desktop, Windsurf, etc.) directly to your Relay Studio workspace so they can provide morning briefings, review sprint progress, inspect tickets, transition card statuses, and post technical updates autonomously.

---

## ✨ Features & Tools

| Tool | Description |
| :--- | :--- |
| **`relay_get_daily_briefing`** | **The Morning Catch-Up**. Returns sprint progress, urgent blockers, newly created tickets (last 24h), tasks assigned to you, and unread notifications in one call. |
| **`relay_list_tasks`** | Search/filter tasks by status (`new`, `ready`, `doing`, `review`, `done`), priority (`urgent`, `normal`, `low`), or project. |
| **`relay_get_task`** | Get full details for any ticket: description, subtasks, checklist, blockers, relations, and assignee. |
| **`relay_update_task`** | Move cards on your Kanban board (`ready` $\rightarrow$ `doing` $\rightarrow$ `review` $\rightarrow$ `done`), change priority, assignees, or blockers. |
| **`relay_create_task`** | Create new tasks, subtasks, or bug reports directly under any project. |
| **`relay_add_comment`** | Post technical notes, implementation summaries, or reviews. Supports `@username` mentions to trigger notifications. |
| **`relay_list_comments`** | Retrieve the full discussion history for any task. |
| **`relay_list_projects`** | List all active projects in the workspace. |
| **`relay_get_active_cycle`** | Check current sprint burndown, story points completed, and days remaining. |

---

## 🚀 Setup & Configuration

### 1. Get your Personal Access Token (PAT)
1. Log in to Relay Studio: [https://relay.schmobinquiz.de](https://relay.schmobinquiz.de).
2. Go to **Settings** $\rightarrow$ **Security / Profile** $\rightarrow$ **Personal Access Tokens** (`/profile/tokens`).
3. Click **Create Token** (give it full abilities or read/write) and copy your token: `1|relay_pat_...`.

### 2. Configure Your AI Client

#### Antigravity
Add to `~/.gemini/config/mcp_config.json`:
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

#### Cursor (`~/.cursor/mcp.json` or Project Settings)
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

#### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)
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

---

## 💬 Example Prompts for Your Agent

- *"Good morning! What's new in Relay today?"*  
  $\rightarrow$ Agent executes `relay_get_daily_briefing` and presents a structured briefing of urgent items, overnight tickets, and active sprint burndown.

- *"What urgent tasks are waiting for me in QuizPoker?"*  
  $\rightarrow$ Agent calls `relay_list_tasks` with `priority: "urgent"`.

- *"Start working on #REQ-14: move it to Doing and add a comment that I began working on the fix."*  
  $\rightarrow$ Agent executes `relay_update_task(id: 14, status: "doing")` and `relay_add_comment(task_id: 14, body: "Started working...")`.

- *"I just finished the implementation for #REQ-14 and tests are green. Move it to Review and leave a note."*  
  $\rightarrow$ Agent moves the card to `review` on your board.

---

## 🔒 Security & Privacy Guarantees

- **Sanctum Authentication**: Every request is authenticated against Laravel Sanctum with token ability verification.
- **Strict Multi-Tenancy**: All database queries are scoped to the authenticated user's active workspace. Cross-workspace data leakage is physically impossible.
- **Zero Secret Leaks**: Passwords, 2FA keys, tokens, and sensitive headers are stripped before JSON serialization.
- **Race Condition Safety**: Task updates support optimistic locking (`lock_version`) and database transactions.
