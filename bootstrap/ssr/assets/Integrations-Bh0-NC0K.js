import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Activity, AlertCircle, AlertTriangle, Bot, Check, CheckCircle2, Clock, ExternalLink, Eye, Loader2, Mail, Palette, RefreshCw, Save, Search, Send, XCircle } from "lucide-react";
import axios from "axios";
//#region resources/js/Features/Integrations/components/IntegrationKpiTiles.tsx
function IntegrationKpiTiles({ discord, email, kpis }) {
	const isDiscordConnected = discord.enabled && discord.configured;
	return /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
							children: "Discord Channel"
						}), /* @__PURE__ */ jsx("div", {
							className: "h-8 w-8 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2]",
							children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex items-baseline gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xl font-bold tracking-tight text-white",
							children: isDiscordConnected ? "Connected" : discord.enabled ? "Needs URL" : "Disabled"
						}), /* @__PURE__ */ jsxs("span", {
							className: `inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${isDiscordConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700/60"}`,
							children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${isDiscordConnected ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}` }), isDiscordConnected ? "Live" : "Standby"]
						})]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-xs text-zinc-500 truncate",
						children: [
							discord.bot_name || "Relay Studio",
							" · ",
							discord.masked_webhook_url || "No webhook set"
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
							children: "Email Dispatch"
						}), /* @__PURE__ */ jsx("div", {
							className: "h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400",
							children: /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex items-baseline gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xl font-bold tracking-tight text-white",
							children: email.sender_name
						}), /* @__PURE__ */ jsx("span", {
							className: "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20",
							children: email.mailer.toUpperCase()
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-zinc-500 truncate font-mono",
						children: email.from_address
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
							children: "Total Dispatches"
						}), /* @__PURE__ */ jsx("div", {
							className: "h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400",
							children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex items-baseline gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xl font-bold tracking-tight text-white",
							children: kpis.total_dispatches.toLocaleString()
						}), /* @__PURE__ */ jsxs("span", {
							className: "text-xs text-zinc-400",
							children: [
								"(",
								kpis.discord_count,
								" Discord · ",
								kpis.email_count,
								" Mail)"
							]
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-zinc-500",
						children: "Dual pipeline automated alerts"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
							children: "Success Velocity"
						}), /* @__PURE__ */ jsx("div", {
							className: "h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400",
							children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex items-baseline gap-2",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-xl font-bold tracking-tight text-emerald-400",
							children: [kpis.success_rate, "%"]
						}), kpis.failed_count > 0 && /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium",
							children: [
								/* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3" }),
								kpis.failed_count,
								" failed"
							]
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-zinc-500",
						children: kpis.failed_count === 0 ? "Zero delivery failures" : "Check logs for failed payloads"
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Integrations/components/DiscordWebhookCard.tsx
function DiscordWebhookCard({ config, onUpdated, canManage }) {
	const [enabled, setEnabled] = useState(config.enabled);
	const [webhookUrl, setWebhookUrl] = useState(config.webhook_url || "");
	const [botName, setBotName] = useState(config.bot_name || "Relay Studio");
	const [avatarUrl, setAvatarUrl] = useState(config.avatar_url || "");
	const [events, setEvents] = useState(config.events);
	const [isSaving, setIsSaving] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [statusMessage, setStatusMessage] = useState(null);
	const toggleEvent = (key) => {
		setEvents((prev) => ({
			...prev,
			[key]: !prev[key]
		}));
	};
	const handleSave = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		setStatusMessage(null);
		try {
			const response = await axios.post(route("integrations.discord.update"), {
				enabled,
				webhook_url: webhookUrl.trim() || null,
				bot_name: botName.trim() || "Relay Studio",
				avatar_url: avatarUrl.trim() || null,
				events
			});
			onUpdated(response.data.discord);
			setStatusMessage({
				type: "success",
				text: response.data.message || "Settings saved successfully."
			});
		} catch (err) {
			const msg = err.response?.data?.message || "Failed to save Discord settings.";
			setStatusMessage({
				type: "error",
				text: msg
			});
		} finally {
			setIsSaving(false);
		}
	};
	const handleTestPing = async () => {
		setIsTesting(true);
		setStatusMessage(null);
		try {
			const response = await axios.post(route("integrations.discord.test"), { webhook_url: webhookUrl.trim() || null });
			setStatusMessage({
				type: "success",
				text: response.data.message || "Test message sent to Discord!"
			});
		} catch (err) {
			const msg = err.response?.data?.message || "Failed to deliver test message to Discord.";
			setStatusMessage({
				type: "error",
				text: msg
			});
		} finally {
			setIsTesting(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-5 shadow-sm space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "h-10 w-10 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2]",
						children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
						className: "text-sm font-semibold text-zinc-100 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", { children: "Discord Webhook & Bot Integration" }), /* @__PURE__ */ jsx("span", {
							className: `px-2 py-0.5 rounded text-[10px] font-semibold ${enabled && config.configured ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700/60"}`,
							children: enabled && config.configured ? "Active" : enabled ? "No URL" : "Disabled"
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-zinc-400 mt-0.5",
						children: "Automatically broadcast ticket dispatches, status changes, and roadblocks to your Discord channel."
					})] })]
				}), canManage && /* @__PURE__ */ jsxs("label", {
					className: "relative inline-flex items-center cursor-pointer select-none",
					children: [
						/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: enabled,
							onChange: (e) => setEnabled(e.target.checked),
							className: "sr-only peer"
						}),
						/* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]" }),
						/* @__PURE__ */ jsx("span", {
							className: "ml-3 text-xs font-medium text-zinc-300",
							children: enabled ? "Enabled" : "Disabled"
						})
					]
				})]
			}),
			statusMessage && /* @__PURE__ */ jsxs("div", {
				className: `p-3 rounded-lg text-xs flex items-center gap-2 border ${statusMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-rose-500/10 border-rose-500/20 text-rose-300"}`,
				children: [statusMessage.type === "success" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ jsx("span", { children: statusMessage.text })]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSave,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5",
							children: "Discord Incoming Webhook URL"
						}),
						/* @__PURE__ */ jsx("input", {
							type: "url",
							disabled: !canManage,
							value: webhookUrl,
							onChange: (e) => setWebhookUrl(e.target.value),
							placeholder: "https://discord.com/api/webhooks/1234567890/abcdef...",
							className: "w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] text-zinc-500",
							children: "In Discord: Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL."
						})
					] }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5",
							children: "Bot Nickname"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							disabled: !canManage,
							value: botName,
							onChange: (e) => setBotName(e.target.value),
							placeholder: "Relay Studio",
							className: "w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50"
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5",
							children: "Bot Avatar Image URL (Optional)"
						}), /* @__PURE__ */ jsx("input", {
							type: "url",
							disabled: !canManage,
							value: avatarUrl,
							onChange: (e) => setAvatarUrl(e.target.value),
							placeholder: "https://your-domain.com/logo.png",
							className: "w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50"
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2",
						children: "Broadcast Triggers & Event Subscriptions"
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs",
						children: [
							{
								key: "ticket_created",
								label: "🆕 Ticket Created"
							},
							{
								key: "ticket_assigned",
								label: "⚡ Work Assigned"
							},
							{
								key: "ticket_status",
								label: "🔄 Status & Review"
							},
							{
								key: "ticket_blocked",
								label: "🚧 Blockers & Roadblocks"
							},
							{
								key: "ticket_comment",
								label: "💬 Comments & Mentions"
							}
						].map((evt) => /* @__PURE__ */ jsxs("label", {
							className: `flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${events[evt.key] ? "border-[#5865F2]/40 bg-[#5865F2]/10 text-zinc-200" : "border-zinc-800/80 bg-[#090a0f] text-zinc-400 hover:border-zinc-700"}`,
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								disabled: !canManage,
								checked: !!events[evt.key],
								onChange: () => toggleEvent(evt.key),
								className: "rounded border-zinc-700 bg-zinc-900 text-[#5865F2] focus:ring-0"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium text-[11px]",
								children: evt.label
							})]
						}, evt.key))
					})] }),
					canManage && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between pt-3 border-t border-zinc-800/80",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: handleTestPing,
							disabled: isTesting || !webhookUrl,
							className: "inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#14161c] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-colors shadow-sm",
							children: [isTesting ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5 text-[#5865F2]" }), /* @__PURE__ */ jsx("span", { children: "Send Test Ping to Discord" })]
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: isSaving,
							className: "inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4752c4] disabled:opacity-50 transition-colors shadow-sm",
							children: [isSaving ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Save Discord Settings" })]
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Integrations/components/DiscordLivePreview.tsx
function DiscordLivePreview({ config, selectedEvent = "created" }) {
	const botName = config.bot_name || "Relay Studio";
	const avatar = config.avatar_url;
	const borderColor = selectedEvent === "urgent" || selectedEvent === "blocked" ? "#E11D48" : selectedEvent === "done" ? "#10B981" : selectedEvent === "review" ? "#8B5CF6" : selectedEvent === "assignment" ? "#0284C7" : "#F59E0B";
	const eventLabel = selectedEvent === "created" ? "🆕 Ticket Created" : selectedEvent === "assignment" ? "⚡ Work Assigned" : selectedEvent === "review" ? "👀 Ready for Review" : selectedEvent === "done" ? "✅ Ticket Completed" : selectedEvent === "blocked" ? "🚧 Roadblock Flagged" : "💬 New Comment";
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-zinc-800 bg-[#090a0f] p-5 shadow-sm space-y-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between border-b border-zinc-800/80 pb-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-[#5865F2]" }), /* @__PURE__ */ jsx("h3", {
					className: "text-xs font-semibold uppercase tracking-wider text-zinc-300",
					children: "Live Discord Client Preview"
				})]
			}), /* @__PURE__ */ jsx("span", {
				className: "text-[11px] text-zinc-500 font-mono",
				children: "Channel: #engineering-alerts"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "rounded-lg bg-[#2b2d31] p-4 text-[#dbdee1] font-sans text-sm border border-[#1e1f22] select-none",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "h-9 w-9 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden",
					children: avatar ? /* @__PURE__ */ jsx("img", {
						src: avatar,
						alt: botName,
						className: "h-full w-full object-cover"
					}) : botName.charAt(0).toUpperCase()
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-semibold text-white text-sm hover:underline cursor-pointer",
							children: botName
						}),
						/* @__PURE__ */ jsx("span", {
							className: "rounded bg-[#5865F2] px-1 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider",
							children: "BOT"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] text-[#949ba4]",
							children: "Today at 4:20 PM"
						})
					]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-2.5 rounded-md bg-[#232428] p-3 text-xs border-l-4 space-y-2 max-w-lg",
				style: { borderLeftColor: borderColor },
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5 font-semibold text-[#00a8fc] hover:underline cursor-pointer text-sm",
						children: [/* @__PURE__ */ jsx("span", { children: "#REQ-101: Optimize Redis caching pipeline for Kanban boards" }), /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 inline" })]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-[#dbdee1] text-xs leading-relaxed",
						children: "Alice Admin updated #REQ-101 in Core Platform. Automatic dispatch synced across Relay Studio."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-2 pt-1 border-t border-[#313338]",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide",
								children: "Event"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-white font-medium",
								children: eventLabel
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide",
								children: "Project"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-white font-medium",
								children: "Core Platform"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide",
								children: "Priority"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-amber-400 font-bold",
								children: "High"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide",
								children: "Status"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sky-400 font-medium",
								children: "In Progress"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide",
								children: "Assignee"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-white font-medium",
								children: "Sarah Developer"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide",
								children: "Requester"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-white font-medium",
								children: "Alice Admin"
							})] })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "pt-1.5 text-[10px] text-[#949ba4] flex items-center justify-between border-t border-[#313338]",
						children: [/* @__PURE__ */ jsx("span", { children: "Relay Studio Automation Subsystem" }), /* @__PURE__ */ jsx("span", { children: "Today at 4:20 PM" })]
					})
				]
			})]
		})]
	});
}
//#endregion
//#region resources/js/Features/Integrations/components/EmailTemplateCard.tsx
var PRESET_COLORS = [
	{
		label: "Violet (Default)",
		hex: "#8B5CF6"
	},
	{
		label: "Indigo",
		hex: "#6366F1"
	},
	{
		label: "Sky Blue",
		hex: "#0284C7"
	},
	{
		label: "Emerald",
		hex: "#10B981"
	},
	{
		label: "Amber",
		hex: "#F59E0B"
	},
	{
		label: "Rose",
		hex: "#F43F5E"
	}
];
function EmailTemplateCard({ config, onUpdated, canManage }) {
	const [senderName, setSenderName] = useState(config.sender_name);
	const [accentColor, setAccentColor] = useState(config.accent_color || "#8B5CF6");
	const [logoUrl, setLogoUrl] = useState(config.logo_url || "");
	const [footerNote, setFooterNote] = useState(config.footer_note || "");
	const [events, setEvents] = useState(config.events);
	const [isSaving, setIsSaving] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [statusMessage, setStatusMessage] = useState(null);
	const toggleEvent = (key) => {
		setEvents((prev) => ({
			...prev,
			[key]: !prev[key]
		}));
	};
	const handleSave = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		setStatusMessage(null);
		try {
			const response = await axios.post(route("integrations.email.update"), {
				sender_name: senderName.trim(),
				accent_color: accentColor,
				logo_url: logoUrl.trim() || null,
				footer_note: footerNote.trim(),
				events
			});
			onUpdated(response.data.email);
			setStatusMessage({
				type: "success",
				text: response.data.message || "Email settings saved successfully."
			});
		} catch (err) {
			const msg = err.response?.data?.message || "Failed to save email settings.";
			setStatusMessage({
				type: "error",
				text: msg
			});
		} finally {
			setIsSaving(false);
		}
	};
	const handleSendTest = async () => {
		setIsTesting(true);
		setStatusMessage(null);
		try {
			const response = await axios.post(route("integrations.email.test"), { event: "assignment" });
			setStatusMessage({
				type: "success",
				text: response.data.message || "Test email dispatched to your inbox!"
			});
		} catch (err) {
			const msg = err.response?.data?.message || "Failed to deliver test email.";
			setStatusMessage({
				type: "error",
				text: msg
			});
		} finally {
			setIsTesting(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-5 shadow-sm space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400",
						children: /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
						className: "text-sm font-semibold text-zinc-100 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", { children: "Transactional Email Dispatcher & Templates" }), /* @__PURE__ */ jsx("span", {
							className: "px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20",
							children: config.mailer.toUpperCase()
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-zinc-400 mt-0.5",
						children: "Branded dark-mode HTML email notifications dispatched on ticket updates, assignments, and reviews."
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "text-right",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500 font-mono block",
						children: "From Address"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-zinc-300 font-mono",
						children: config.from_address
					})]
				})]
			}),
			statusMessage && /* @__PURE__ */ jsxs("div", {
				className: `p-3 rounded-lg text-xs flex items-center gap-2 border ${statusMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-rose-500/10 border-rose-500/20 text-rose-300"}`,
				children: [statusMessage.type === "success" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ jsx("span", { children: statusMessage.text })]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSave,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5",
							children: "Brand / Sender Name"
						}),
						/* @__PURE__ */ jsx("input", {
							type: "text",
							disabled: !canManage,
							value: senderName,
							onChange: (e) => setSenderName(e.target.value),
							placeholder: "Relay Studio",
							className: "w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] text-zinc-500",
							children: "Appears as the display name in the email subject and top navigation bar."
						})
					] }),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5",
							children: "Brand Logo Image URL"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "h-10 w-10 rounded-lg bg-[#090a0f] border border-zinc-800 p-1.5 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ jsx("img", {
									src: logoUrl || "/img/logo.png",
									alt: "Logo Preview",
									className: "h-full w-full object-contain rounded",
									onError: (e) => {
										e.target.src = "/img/logo.png";
									}
								})
							}), /* @__PURE__ */ jsx("input", {
								type: "url",
								disabled: !canManage,
								value: logoUrl,
								onChange: (e) => setLogoUrl(e.target.value),
								placeholder: "/img/logo.png or https://your-domain.com/logo.png",
								className: "flex-1 rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
							})]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-[11px] text-zinc-500",
							children: [
								"Default uses the bundled high-resolution Relay Studio mark (",
								/* @__PURE__ */ jsx("code", {
									className: "text-zinc-400",
									children: "/img/logo.png"
								}),
								")."
							]
						})
					] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
						className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Palette, { className: "h-3.5 w-3.5 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Email Top Accent & Highlight Color" })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2.5",
						children: [PRESET_COLORS.map((col) => /* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: !canManage,
							onClick: () => setAccentColor(col.hex),
							className: `flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${accentColor.toLowerCase() === col.hex.toLowerCase() ? "border-white/40 bg-zinc-800 text-white shadow-sm ring-1 ring-white/20" : "border-zinc-800 bg-[#090a0f] text-zinc-400 hover:border-zinc-700"}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-3.5 w-3.5 rounded-full border border-black/40 shadow-sm",
								style: { backgroundColor: col.hex }
							}), /* @__PURE__ */ jsx("span", { children: col.label })]
						}, col.hex)), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5 ml-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-mono text-zinc-500",
								children: "Custom:"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								disabled: !canManage,
								value: accentColor,
								onChange: (e) => setAccentColor(e.target.value),
								className: "w-24 rounded border border-zinc-800 bg-[#090a0f] px-2 py-1 text-xs font-mono text-zinc-200 uppercase focus:border-violet-500 focus:outline-none"
							})]
						})]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5",
						children: "Footer Note / Organization Signature"
					}), /* @__PURE__ */ jsx("input", {
						type: "text",
						disabled: !canManage,
						value: footerNote,
						onChange: (e) => setFooterNote(e.target.value),
						placeholder: "Relay Studio · Enterprise Engineering & Dispatch Automation",
						className: "w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2",
						children: "Email Event Triggers"
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs",
						children: [
							{
								key: "ticket_created",
								label: "🆕 Ticket Created"
							},
							{
								key: "ticket_assigned",
								label: "⚡ Work Assigned"
							},
							{
								key: "ticket_status",
								label: "🔄 Status & Review"
							},
							{
								key: "ticket_blocked",
								label: "🚧 Blockers & Roadblocks"
							},
							{
								key: "ticket_comment",
								label: "💬 Comments & Mentions"
							}
						].map((evt) => /* @__PURE__ */ jsxs("label", {
							className: `flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${events[evt.key] ? "border-violet-500/40 bg-violet-500/10 text-zinc-200" : "border-zinc-800/80 bg-[#090a0f] text-zinc-400 hover:border-zinc-700"}`,
							children: [/* @__PURE__ */ jsx("input", {
								type: "checkbox",
								disabled: !canManage,
								checked: !!events[evt.key],
								onChange: () => toggleEvent(evt.key),
								className: "rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-0"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium text-[11px]",
								children: evt.label
							})]
						}, evt.key))
					})] }),
					canManage && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between pt-3 border-t border-zinc-800/80",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: handleSendTest,
							disabled: isTesting,
							className: "inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#14161c] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-colors shadow-sm",
							children: [isTesting ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Send Test Email to Me" })]
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: isSaving,
							className: "inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-sm",
							children: [isSaving ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Save Email Settings" })]
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Integrations/components/EmailLivePreview.tsx
var PREVIEW_EVENTS = [
	{
		key: "assignment",
		label: "⚡ Work Assigned"
	},
	{
		key: "review",
		label: "👀 Review Request"
	},
	{
		key: "done",
		label: "✅ Work Completed"
	},
	{
		key: "blocked",
		label: "🚧 Roadblock Flagged"
	},
	{
		key: "comment",
		label: "💬 New Comment"
	}
];
function EmailLivePreview({ config }) {
	const [selectedEvent, setSelectedEvent] = useState("assignment");
	const [refreshKey, setRefreshKey] = useState(0);
	const previewUrl = route("integrations.email.preview") + `?event=${selectedEvent}&_k=${refreshKey}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-zinc-800 bg-[#090a0f] p-5 shadow-sm space-y-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 text-violet-400" }), /* @__PURE__ */ jsx("h3", {
						className: "text-xs font-semibold uppercase tracking-wider text-zinc-300",
						children: "Live HTML Email Template Preview"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [PREVIEW_EVENTS.map((evt) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setSelectedEvent(evt.key),
						className: `px-2.5 py-1 rounded text-[11px] font-medium transition-all ${selectedEvent === evt.key ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm" : "bg-[#14161c] text-zinc-400 border border-zinc-800 hover:text-zinc-200"}`,
						children: evt.label
					}, evt.key)), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setRefreshKey((k) => k + 1),
						title: "Refresh Preview",
						className: "p-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
						children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" })
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "rounded-lg border border-zinc-800/80 bg-[#050608] overflow-hidden shadow-inner",
				children: /* @__PURE__ */ jsx("iframe", {
					src: previewUrl,
					title: "Email Template Live Preview",
					className: "w-full h-[540px] border-none bg-transparent"
				}, `${selectedEvent}-${refreshKey}`)
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-mono",
				children: [/* @__PURE__ */ jsx("span", { children: "View rendered with Plus Jakarta Sans & inline email CSS" }), /* @__PURE__ */ jsxs("a", {
					href: previewUrl,
					target: "_blank",
					rel: "noreferrer",
					className: "flex items-center gap-1 text-violet-400 hover:underline",
					children: [/* @__PURE__ */ jsx("span", { children: "Open in new tab" }), /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Integrations/components/DeliveryLogTable.tsx
function DeliveryLogTable({ logs }) {
	const [channelFilter, setChannelFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const filteredLogs = logs.filter((log) => {
		if (channelFilter !== "all" && log.channel !== channelFilter) return false;
		if (statusFilter !== "all" && log.status !== statusFilter) return false;
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			const matchSummary = (log.summary || "").toLowerCase().includes(term);
			const matchTarget = (log.target || "").toLowerCase().includes(term);
			const matchEvent = log.event.toLowerCase().includes(term);
			if (!matchSummary && !matchTarget && !matchEvent) return false;
		}
		return true;
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-5 shadow-sm space-y-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-cyan-400" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-sm font-semibold text-zinc-100",
					children: "Real-Time Notification Delivery Logs"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-zinc-400 mt-0.5",
					children: "Inspection history for both Discord webhooks and outgoing email dispatches."
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(Search, { className: "h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-500" }), /* @__PURE__ */ jsx("input", {
						type: "text",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value),
						placeholder: "Search logs...",
						className: "w-40 sm:w-48 rounded-lg border border-zinc-800 bg-[#090a0f] pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center rounded-lg border border-zinc-800 bg-[#090a0f] p-0.5 text-xs",
					children: [
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setChannelFilter("all"),
							className: `px-2.5 py-1 rounded font-medium transition-all ${channelFilter === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
							children: "All Channels"
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setChannelFilter("discord"),
							className: `px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${channelFilter === "discord" ? "bg-[#5865F2]/20 text-[#5865F2]" : "text-zinc-400 hover:text-zinc-200"}`,
							children: [/* @__PURE__ */ jsx(Bot, { className: "h-3 w-3" }), "Discord"]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setChannelFilter("email"),
							className: `px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${channelFilter === "email" ? "bg-violet-500/20 text-violet-300" : "text-zinc-400 hover:text-zinc-200"}`,
							children: [/* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }), "Email"]
						})
					]
				})]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ jsxs("table", {
				className: "w-full text-left text-xs border-collapse",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
					className: "border-b border-zinc-800/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-[#090a0f]",
					children: [
						/* @__PURE__ */ jsx("th", {
							className: "py-2.5 px-3",
							children: "Timestamp"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-2.5 px-3",
							children: "Channel"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-2.5 px-3",
							children: "Event"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-2.5 px-3",
							children: "Target Destination"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-2.5 px-3",
							children: "Summary"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-2.5 px-3 text-right",
							children: "Status"
						})
					]
				}) }), /* @__PURE__ */ jsx("tbody", {
					className: "divide-y divide-zinc-800/50",
					children: filteredLogs.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
						colSpan: 6,
						className: "py-8 text-center text-zinc-500",
						children: "No notification logs match your current filter criteria."
					}) }) : filteredLogs.map((log) => /* @__PURE__ */ jsxs("tr", {
						className: "hover:bg-zinc-800/30 transition-colors",
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "py-2.5 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap",
								children: log.created_human
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-2.5 px-3 whitespace-nowrap",
								children: log.channel === "discord" ? /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20",
									children: [/* @__PURE__ */ jsx(Bot, { className: "h-3 w-3" }), "Discord"]
								}) : /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20",
									children: [/* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }), "Email"]
								})
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-2.5 px-3 font-mono text-[11px] text-zinc-300 whitespace-nowrap",
								children: log.event
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-2.5 px-3 font-mono text-[11px] text-zinc-400 truncate max-w-[200px]",
								children: log.target || "—"
							}),
							/* @__PURE__ */ jsxs("td", {
								className: "py-2.5 px-3 text-zinc-300 truncate max-w-[320px]",
								children: [/* @__PURE__ */ jsx("span", { children: log.summary || "—" }), log.error_message && /* @__PURE__ */ jsx("p", {
									className: "text-[10px] text-rose-400 truncate mt-0.5",
									children: log.error_message
								})]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "py-2.5 px-3 text-right whitespace-nowrap",
								children: log.status === "success" ? /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }), "Delivered"]
								}) : log.status === "queued" ? /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20",
									children: [/* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }), "Queued"]
								}) : /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20",
									children: [/* @__PURE__ */ jsx(XCircle, { className: "h-3 w-3" }), "Failed"]
								})
							})
						]
					}, log.id))
				})]
			})
		})]
	});
}
//#endregion
export { DiscordWebhookCard as a, DiscordLivePreview as i, EmailLivePreview as n, IntegrationKpiTiles as o, EmailTemplateCard as r, DeliveryLogTable as t };
