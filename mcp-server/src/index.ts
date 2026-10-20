#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { RelayClient } from './client.js';

const server = new Server(
  {
    name: 'relay-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let client: RelayClient | null = null;
function getClient(): RelayClient {
  if (!client) {
    client = new RelayClient();
  }
  return client;
}

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'relay_get_daily_briefing',
        description:
          'Fetches the daily morning briefing for Relay Studio. Returns active sprint progress, urgent blockers, newly submitted tickets in the last 24h, tasks assigned to you, and recent notifications.',
        inputSchema: {
          type: 'object',
          properties: {
            since_hours: {
              type: 'number',
              description: 'Hours to look back for newly created requests (default: 24, max: 168).',
              default: 24,
            },
          },
        },
      },
      {
        name: 'relay_list_tasks',
        description:
          'Lists or searches work requests in Relay Studio. Filter by status (new, ready, doing, review, done), priority (urgent, normal, low), or project ID.',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Filter by stage: "new" | "ready" | "doing" | "review" | "done" | "cancelled".',
              enum: ['new', 'ready', 'doing', 'review', 'done', 'cancelled'],
            },
            priority: {
              type: 'string',
              description: 'Filter by priority: "urgent" | "normal" | "low".',
              enum: ['urgent', 'normal', 'low'],
            },
            area_id: {
              type: 'number',
              description: 'Filter by Project / Area ID.',
            },
            per_page: {
              type: 'number',
              description: 'Number of results to return (default: 25, max: 100).',
              default: 25,
            },
            page: {
              type: 'number',
              description: 'Page number for pagination.',
              default: 1,
            },
          },
        },
      },
      {
        name: 'relay_get_task',
        description:
          'Retrieves complete details of a specific task by ID from Relay Studio, including description, assignee, priority, status, subtasks, and relations.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The numeric ID of the work request.',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'relay_update_task',
        description:
          'Updates a task in Relay Studio (e.g. moving a card to "doing" when starting work, "review" when finished, or modifying priority/description/blocker state).',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The numeric ID of the task to update.',
            },
            status: {
              type: 'string',
              description: 'New status for the task: "new" | "ready" | "doing" | "review" | "done" | "cancelled".',
              enum: ['new', 'ready', 'doing', 'review', 'done', 'cancelled'],
            },
            priority: {
              type: 'string',
              description: 'Priority: "urgent" | "normal" | "low".',
              enum: ['urgent', 'normal', 'low'],
            },
            title: {
              type: 'string',
              description: 'Updated title of the task.',
            },
            description: {
              type: 'string',
              description: 'Updated markdown description of the task.',
            },
            assignee_id: {
              type: 'number',
              description: 'User ID of the assigned team member (or null to unassign).',
            },
            story_points: {
              type: 'number',
              description: 'Story point estimate (e.g. 1, 2, 3, 5, 8).',
            },
            is_blocked: {
              type: 'boolean',
              description: 'Mark whether this task is currently blocked.',
            },
            blocked_reason: {
              type: 'string',
              description: 'Reason why the task is blocked.',
            },
            due_date: {
              type: 'string',
              description: 'Due date in YYYY-MM-DD format.',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of string tags.',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'relay_create_task',
        description:
          'Creates a new work request / task in Relay Studio under a specific project.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the task.',
            },
            area_id: {
              type: 'number',
              description: 'Project / Area ID under which this task is created.',
            },
            priority: {
              type: 'string',
              description: 'Priority: "urgent" | "normal" | "low". Defaults to "normal".',
              enum: ['urgent', 'normal', 'low'],
              default: 'normal',
            },
            description: {
              type: 'string',
              description: 'Markdown description of the task.',
            },
            status: {
              type: 'string',
              description: 'Initial stage: "new" | "ready" | "doing" | "review" | "done". Defaults to "new".',
              enum: ['new', 'ready', 'doing', 'review', 'done'],
              default: 'new',
            },
            story_points: {
              type: 'number',
              description: 'Story point estimate.',
            },
            assignee_id: {
              type: 'number',
              description: 'User ID to assign this task to.',
            },
            due_date: {
              type: 'string',
              description: 'Due date in YYYY-MM-DD format.',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for the task.',
            },
          },
          required: ['title', 'area_id'],
        },
      },
      {
        name: 'relay_add_comment',
        description:
          'Adds a progress note, explanation, or review comment to a task in Relay Studio. Supports @mentions (e.g. @username) which notify team members.',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'number',
              description: 'The numeric ID of the work request.',
            },
            body: {
              type: 'string',
              description: 'The comment text (Markdown supported).',
            },
          },
          required: ['task_id', 'body'],
        },
      },
      {
        name: 'relay_list_comments',
        description:
          'Retrieves the discussion and comment history for a specific task in Relay Studio.',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'number',
              description: 'The numeric ID of the work request.',
            },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'relay_list_projects',
        description:
          'Lists all active projects and areas in the Relay Studio workspace with their IDs, names, and colors.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'relay_get_active_cycle',
        description:
          'Fetches the current active sprint/cycle in Relay Studio, including days remaining, story points completed, and status breakdown.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Tool invocation dispatcher
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const api = getClient();

    switch (name) {
      case 'relay_get_daily_briefing': {
        const schema = z.object({
          since_hours: z.number().optional().default(24),
        });
        const { since_hours } = schema.parse(args || {});
        const briefing = await api.getBriefing(since_hours);

        // Format a high-impact markdown summary for the agent
        let md = `# 🌅 Morning Briefing: ${briefing.workspace.name}\n\n`;
        md += `*Generated at: ${new Date(briefing.window.generated_at).toLocaleString()} for @${briefing.user.username}*\n\n`;

        // Key Metrics
        md += `### 📊 Pipeline Overview\n`;
        md += `- **Total Open Tasks**: ${briefing.metrics.total_open}\n`;
        md += `- **In Progress**: ${briefing.metrics.in_progress} | **In Review**: ${briefing.metrics.in_review}\n`;
        md += `- **🚨 Urgent Items**: ${briefing.metrics.urgent} | **⛔ Blocked Items**: ${briefing.metrics.blocked}\n`;
        md += `- **⚠️ Overdue Items**: ${briefing.metrics.overdue} | **📥 Created Last ${since_hours}h**: ${briefing.metrics.created_since_window}\n`;
        md += `- **👤 Assigned to You**: ${briefing.metrics.my_assigned} | **📬 Unread Notifications**: ${briefing.metrics.unread_notifications}\n\n`;

        // Active Sprint / Cycle
        if (briefing.active_cycle) {
          const c = briefing.active_cycle;
          md += `### 🏁 Active Cycle: ${c.name} (#${c.number})\n`;
          md += `- **Progress**: ${c.completed_points} / ${c.total_points} pts (${c.points_progress_percentage}% completed)\n`;
          md += `- **Tasks**: ${c.completed_tasks} / ${c.total_tasks} finished\n`;
          md += `- **Time Remaining**: ${c.days_remaining !== null ? `${c.days_remaining} day(s) left` : 'No end date set'}\n\n`;
        } else {
          md += `### 🏁 Active Cycle: *No active cycle running*\n\n`;
        }

        // Urgent and Blocked
        if (briefing.urgent_and_blocked.length > 0) {
          md += `### 🚨 Urgent & Blocked Tasks (${briefing.urgent_and_blocked.length})\n`;
          for (const item of briefing.urgent_and_blocked) {
            const tag = item.is_blocked ? `[BLOCKED: ${item.blocked_reason || 'No reason'}]` : `[URGENT]`;
            const proj = item.area?.name ? `(${item.area.name})` : '';
            const assignee = item.assignee ? `-> @${item.assignee.username}` : '-> Unassigned';
            md += `- **#REQ-${item.id}**: ${tag} **${item.title}** ${proj} [${item.status.toUpperCase()}] ${assignee}\n`;
          }
          md += `\n`;
        }

        // Tasks assigned to user
        if (briefing.my_tasks.length > 0) {
          md += `### 👤 Assigned to You (${briefing.my_tasks.length})\n`;
          for (const item of briefing.my_tasks) {
            const proj = item.area?.name ? `[${item.area.name}]` : '';
            const pts = item.story_points ? `(${item.story_points} pts)` : '';
            md += `- **#REQ-${item.id}**: ${item.title} ${proj} ${pts} - Status: *${item.status}*\n`;
          }
          md += `\n`;
        }

        // New tickets submitted overnight
        if (briefing.new_requests.length > 0) {
          md += `### 📥 New Requests (Last ${since_hours}h - ${briefing.new_requests.length})\n`;
          for (const item of briefing.new_requests) {
            const by = item.requester ? `by @${item.requester.username}` : '';
            md += `- **#REQ-${item.id}**: ${item.title} ${by} - Status: *${item.status}* | Priority: *${item.priority}*\n`;
          }
          md += `\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: md,
            },
            {
              type: 'text',
              text: JSON.stringify(briefing, null, 2),
            },
          ],
        };
      }

      case 'relay_list_tasks': {
        const schema = z.object({
          status: z.enum(['new', 'ready', 'doing', 'review', 'done', 'cancelled']).optional(),
          priority: z.enum(['urgent', 'normal', 'low']).optional(),
          area_id: z.number().optional(),
          per_page: z.number().optional().default(25),
          page: z.number().optional().default(1),
        });
        const parsed = schema.parse(args || {});
        const result = await api.listTasks(parsed);

        let summary = `Found ${result.data.length} task(s):\n\n`;
        for (const item of result.data) {
          const proj = item.area ? `[${item.area.name}]` : '';
          const pts = item.story_points ? `(${item.story_points} pts)` : '';
          const assignee = item.assignee ? `@${item.assignee.username}` : 'Unassigned';
          summary += `- **#REQ-${item.id}**: ${item.title} ${proj} ${pts}\n`;
          summary += `  Status: ${item.status} | Priority: ${item.priority} | Assignee: ${assignee}\n`;
        }

        return {
          content: [
            { type: 'text', text: summary },
            { type: 'text', text: JSON.stringify(result.data, null, 2) },
          ],
        };
      }

      case 'relay_get_task': {
        const schema = z.object({
          id: z.number(),
        });
        const { id } = schema.parse(args);
        const { data: task } = await api.getTask(id);

        let details = `# #REQ-${task.id}: ${task.title}\n\n`;
        details += `- **Project**: ${task.area?.name || 'None'}\n`;
        details += `- **Status**: ${task.status.toUpperCase()}\n`;
        details += `- **Priority**: ${task.priority.toUpperCase()}\n`;
        details += `- **Assignee**: ${task.assignee ? `@${task.assignee.username} (${task.assignee.name})` : 'Unassigned'}\n`;
        details += `- **Story Points**: ${task.story_points ?? 'Not estimated'}\n`;
        details += `- **Due Date**: ${task.due_date ?? 'None'}\n`;
        if (task.is_blocked) {
          details += `- **BLOCKED**: ⚠️ ${task.blocked_reason || 'No reason specified'}\n`;
        }
        if (task.tags && task.tags.length > 0) {
          details += `- **Tags**: ${task.tags.map((t) => `#${t}`).join(', ')}\n`;
        }
        details += `\n### Description\n${task.description || '*No description provided.*'}\n`;

        if (task.subtasks && task.subtasks.length > 0) {
          details += `\n### Subtasks (${task.subtasks.length})\n`;
          for (const sub of task.subtasks) {
            const check = sub.status === 'done' ? '[x]' : '[ ]';
            details += `- ${check} #REQ-${sub.id}: ${sub.title} (${sub.status})\n`;
          }
        }

        return {
          content: [
            { type: 'text', text: details },
            { type: 'text', text: JSON.stringify(task, null, 2) },
          ],
        };
      }

      case 'relay_update_task': {
        const schema = z.object({
          id: z.number(),
          status: z.enum(['new', 'ready', 'doing', 'review', 'done', 'cancelled']).optional(),
          priority: z.enum(['urgent', 'normal', 'low']).optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          assignee_id: z.number().nullable().optional(),
          story_points: z.number().nullable().optional(),
          is_blocked: z.boolean().optional(),
          blocked_reason: z.string().nullable().optional(),
          due_date: z.string().nullable().optional(),
          tags: z.array(z.string()).optional(),
        });
        const { id, ...data } = schema.parse(args);
        const { data: updated } = await api.updateTask(id, data);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully updated task #REQ-${updated.id} (${updated.title}).\nStatus: ${updated.status} | Priority: ${updated.priority}`,
            },
            { type: 'text', text: JSON.stringify(updated, null, 2) },
          ],
        };
      }

      case 'relay_create_task': {
        const schema = z.object({
          title: z.string().min(1),
          area_id: z.number(),
          priority: z.enum(['urgent', 'normal', 'low']).optional().default('normal'),
          description: z.string().optional(),
          status: z.enum(['new', 'ready', 'doing', 'review', 'done']).optional().default('new'),
          story_points: z.number().optional(),
          assignee_id: z.number().optional(),
          due_date: z.string().optional(),
          tags: z.array(z.string()).optional(),
        });
        const payload = schema.parse(args);
        const { data: created } = await api.createTask(payload);

        return {
          content: [
            {
              type: 'text',
              text: `Created task #REQ-${created.id}: "${created.title}" in project ${created.area?.name || created.area_id}. Status: ${created.status}`,
            },
            { type: 'text', text: JSON.stringify(created, null, 2) },
          ],
        };
      }

      case 'relay_add_comment': {
        const schema = z.object({
          task_id: z.number(),
          body: z.string().min(1),
        });
        const { task_id, body } = schema.parse(args);
        const res = await api.addComment(task_id, body);

        return {
          content: [
            {
              type: 'text',
              text: `Comment added to #REQ-${task_id} by @${res.comment.user?.username || 'user'}:\n"${res.comment.body}"`,
            },
            { type: 'text', text: JSON.stringify(res, null, 2) },
          ],
        };
      }

      case 'relay_list_comments': {
        const schema = z.object({
          task_id: z.number(),
        });
        const { task_id } = schema.parse(args);
        const res = await api.listComments(task_id);

        let list = `### Comments on #REQ-${task_id} (${res.comments.length})\n\n`;
        if (res.comments.length === 0) {
          list += `*No comments yet.*`;
        } else {
          for (const c of res.comments) {
            const author = c.user ? `@${c.user.username} (${c.user.name})` : 'Unknown';
            const time = new Date(c.created_at).toLocaleString();
            list += `**${author}** at *${time}*:\n${c.body}\n\n---\n\n`;
          }
        }

        return {
          content: [
            { type: 'text', text: list },
            { type: 'text', text: JSON.stringify(res.comments, null, 2) },
          ],
        };
      }

      case 'relay_list_projects': {
        const res = await api.listProjects();
        let md = `### Active Projects (${res.data.length})\n\n`;
        for (const p of res.data) {
          md += `- **ID: ${p.id}**: ${p.name} (slug: \`${p.slug}\`)\n`;
        }
        return {
          content: [
            { type: 'text', text: md },
            { type: 'text', text: JSON.stringify(res.data, null, 2) },
          ],
        };
      }

      case 'relay_get_active_cycle': {
        const res = await api.getActiveCycle();
        if (!res.active_cycle) {
          return {
            content: [{ type: 'text', text: 'No active sprint/cycle is currently running in this workspace.' }],
          };
        }
        const c = res.active_cycle;
        let md = `### 🏁 Active Cycle: ${c.name} (#${c.number})\n`;
        md += `- **Dates**: ${c.start_date || 'N/A'} -> ${c.end_date || 'N/A'}\n`;
        md += `- **Days Remaining**: ${c.days_remaining !== null ? `${c.days_remaining} day(s)` : 'N/A'}\n`;
        md += `- **Story Points**: ${c.completed_points} / ${c.total_points} (${c.points_progress_percentage}% completed)\n`;
        md += `- **Total Tasks**: ${c.completed_tasks} / ${c.total_tasks} finished\n`;
        if (c.status_breakdown) {
          md += `- **Status Breakdown**: New: ${c.status_breakdown.new || 0}, Ready: ${c.status_breakdown.ready || 0}, Doing: ${c.status_breakdown.doing || 0}, Review: ${c.status_breakdown.review || 0}, Done: ${c.status_breakdown.done || 0}\n`;
        }

        return {
          content: [
            { type: 'text', text: md },
            { type: 'text', text: JSON.stringify(c, null, 2) },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Relay MCP Error: ${err.message || String(err)}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('Relay Studio MCP Server running on stdio.\n');
}

main().catch((err) => {
  process.stderr.write(`Fatal error starting Relay MCP server: ${err.message || String(err)}\n`);
  process.exit(1);
});
