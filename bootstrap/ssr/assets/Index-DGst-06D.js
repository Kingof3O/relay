import { n as formatRelativeTime, r as getNotificationBadge, t as Authenticated, v as notifySuccess } from "./AuthenticatedLayout--RwczYuP.js";
import { Head, Link, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Activity, ArrowRight, ArrowUpRight, Check, CheckCheck, CheckCircle2, Clock, Filter, Inbox, Mail, Radio, Search, Sparkles, UserCheck, X } from "lucide-react";
import axios from "axios";
//#region resources/js/Pages/Notifications/Index.tsx
function Index({ notifications: initialNotifications = [] }) {
	const [notifications, setNotifications] = useState(initialNotifications);
	const [currentTab, setCurrentTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const totalCount = notifications.length;
	const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications]);
	const readCount = useMemo(() => notifications.filter((n) => Boolean(n.read_at)).length, [notifications]);
	const assignmentsCount = useMemo(() => notifications.filter((n) => {
		const ev = (n.event ?? "").toLowerCase();
		const msg = (n.message ?? "").toLowerCase();
		return ev === "assignment" || msg.includes("assigned") || msg.includes("assignment") || msg.includes("owner");
	}).length, [notifications]);
	const reviewCount = useMemo(() => notifications.filter((n) => {
		const ev = (n.event ?? "").toLowerCase();
		const msg = (n.message ?? "").toLowerCase();
		return ev === "review" || msg.includes("review") || msg.includes("sign-off") || msg.includes("approval") || ev === "status_changed" && msg.includes("review");
	}).length, [notifications]);
	const clearanceRate = totalCount > 0 ? Math.round(readCount / totalCount * 100) : 100;
	const filteredNotifications = useMemo(() => {
		return notifications.filter((item) => {
			if (currentTab === "inbox" && item.read_at) return false;
			if (currentTab === "resolved" && !item.read_at) return false;
			if (currentTab === "assignments") {
				const ev = (item.event ?? "").toLowerCase();
				const msg = (item.message ?? "").toLowerCase();
				if (!(ev === "assignment" || msg.includes("assigned") || msg.includes("assignment") || msg.includes("owner"))) return false;
			}
			if (currentTab === "reviews") {
				const ev = (item.event ?? "").toLowerCase();
				const msg = (item.message ?? "").toLowerCase();
				if (!(ev === "review" || msg.includes("review") || msg.includes("sign-off") || msg.includes("approval") || ev === "status_changed" && msg.includes("review"))) return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchMsg = item.message?.toLowerCase().includes(q);
				const matchTitle = item.request_title?.toLowerCase().includes(q);
				const matchId = item.request_id?.toString().includes(q) || `#req-${item.request_id}`.toLowerCase().includes(q) || `req-${item.request_id}`.toLowerCase().includes(q);
				const matchEvent = item.event?.toLowerCase().includes(q);
				const matchActor = item.actor_name?.toLowerCase().includes(q) || item.actor?.name?.toLowerCase().includes(q);
				if (!matchMsg && !matchTitle && !matchId && !matchEvent && !matchActor) return false;
			}
			return true;
		});
	}, [
		notifications,
		currentTab,
		searchQuery
	]);
	const markAllAsRead = async () => {
		if (unreadCount === 0) return;
		setNotifications((prev) => prev.map((item) => ({
			...item,
			read_at: item.read_at ?? (/* @__PURE__ */ new Date()).toISOString()
		})));
		try {
			await axios.post(route("notifications.read-all"));
			notifySuccess("Inbox cleared", "All notifications have been marked as read.");
		} catch {}
	};
	const toggleReadStatus = async (id, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const item = notifications.find((n) => n.id === id);
		if (!item) return;
		const isCurrentlyRead = Boolean(item.read_at);
		const newReadAt = isCurrentlyRead ? null : (/* @__PURE__ */ new Date()).toISOString();
		setNotifications((prev) => prev.map((n) => n.id === id ? {
			...n,
			read_at: newReadAt
		} : n));
		try {
			if (isCurrentlyRead) await axios.post(route("notifications.unread", id));
			else await axios.post(route("notifications.read", id));
		} catch {}
	};
	const handleNavigate = (item) => {
		if (!item.read_at) toggleReadStatus(item.id);
		const targetUrl = item.url ?? (item.request_id ? route("requests.show", item.request_id) : route("requests.index"));
		router.visit(targetUrl);
	};
	const kpiMetrics = [
		{
			tab: "all",
			label: "Total Activity",
			value: totalCount,
			icon: Activity,
			detail: "All recorded alerts",
			badge: /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300",
				children: ["Stream ", /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
			})
		},
		{
			tab: "inbox",
			label: "Unread Items",
			value: unreadCount,
			icon: Inbox,
			detail: unreadCount > 0 ? "Requires attention" : "Inbox zero",
			badge: unreadCount > 0 ? /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
				children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" }), "Action needed"]
			}) : /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400",
				children: [/* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }), " Caught up"]
			})
		},
		{
			tab: "assignments",
			label: "Work Assignments",
			value: assignmentsCount,
			icon: UserCheck,
			detail: "Direct tasks & owners",
			badge: /* @__PURE__ */ jsx("span", {
				className: "rounded border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400",
				children: "Assignments"
			})
		},
		{
			tab: "reviews",
			label: "Review Requests",
			value: reviewCount,
			icon: Clock,
			detail: "Sign-offs & approvals",
			badge: /* @__PURE__ */ jsx("span", {
				className: "rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400",
				children: "Sign-offs"
			})
		},
		{
			tab: "resolved",
			label: "Resolved / Read",
			value: readCount,
			icon: CheckCircle2,
			detail: `${clearanceRate}% clearance rate`,
			badge: /* @__PURE__ */ jsx("span", {
				className: "rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400",
				children: "Archived"
			})
		}
	];
	const sidebarTabs = [
		{
			id: "all",
			label: "All Activity",
			icon: Activity,
			count: totalCount,
			badgeClass: "bg-white/10 text-zinc-300"
		},
		{
			id: "inbox",
			label: "Inbox (Unread)",
			icon: Inbox,
			count: unreadCount,
			badgeClass: unreadCount > 0 ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_10px_rgba(167,139,250,0.3)]" : "bg-white/10 text-zinc-400"
		},
		{
			id: "assignments",
			label: "Assignments",
			icon: UserCheck,
			count: assignmentsCount,
			badgeClass: "bg-purple-500/15 text-purple-300 border border-purple-500/25"
		},
		{
			id: "reviews",
			label: "Review Alerts",
			icon: Clock,
			count: reviewCount,
			badgeClass: "bg-blue-500/15 text-blue-300 border border-blue-500/25"
		},
		{
			id: "resolved",
			label: "Resolved / Read",
			icon: CheckCircle2,
			count: readCount,
			badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
		}
	];
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400",
						children: "Activity"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-zinc-600",
						children: "/"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500",
						children: "Inbox"
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-1 flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-bold tracking-tight text-white",
					children: "Notifications"
				}), unreadCount > 0 ? /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-xs font-bold font-mono text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.25)]",
					children: [unreadCount, " unread"]
				}) : /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300",
					children: [/* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "All caught up" })]
				})]
			})] }), unreadCount > 0 && /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: markAllAsRead,
				className: "flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-200 shadow-sm transition-all hover:bg-white/[0.08] hover:text-white hover:border-white/20 active:scale-95",
				children: [/* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Mark all as read" })]
			})]
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Notifications · Linear Inbox" }), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1600px] space-y-6",
			children: [/* @__PURE__ */ jsx("section", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-5",
				children: kpiMetrics.map((metric) => {
					const Icon = metric.icon;
					const isActive = currentTab === metric.tab;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setCurrentTab(metric.tab),
						className: `group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 ${isActive ? "border-violet-500/50 bg-[#161720] shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/30" : "border-white/[0.07] bg-[#111216] hover:border-zinc-700 hover:bg-[#14161c]"}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-3 w-full",
							children: [/* @__PURE__ */ jsx("div", {
								className: `flex h-8 w-8 items-center justify-center rounded-lg border ${isActive ? "border-violet-500/40 bg-violet-500/20 text-violet-300" : "border-zinc-800 bg-zinc-850 text-zinc-300"}`,
								children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
							}), /* @__PURE__ */ jsx("div", { children: metric.badge })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-4",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-xs font-medium text-zinc-400",
									children: metric.label
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums",
									children: metric.value
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-1 text-[11px] text-zinc-500",
									children: metric.detail
								})
							]
						})]
					}, metric.label);
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid gap-6 lg:grid-cols-12 items-start",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "lg:col-span-3 space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-3 shadow-lg shadow-black/40 ring-1 ring-white/[0.04]",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(Filter, { className: "h-3.5 w-3.5 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Filter Notifications" })]
								}), /* @__PURE__ */ jsxs("span", {
									className: "text-[10px] text-zinc-500 font-mono",
									children: [filteredNotifications.length, " items"]
								})]
							}), /* @__PURE__ */ jsx("nav", {
								className: "mt-1 space-y-1",
								children: sidebarTabs.map((tab) => {
									const Icon = tab.icon;
									const isActive = currentTab === tab.id;
									return /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => setCurrentTab(tab.id),
										className: `flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${isActive ? "bg-violet-500/15 text-white border border-violet-500/30 shadow-sm" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent"}`,
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx(Icon, { className: `h-4 w-4 ${isActive ? "text-violet-400" : "text-zinc-500"}` }), /* @__PURE__ */ jsx("span", { children: tab.label })]
										}), /* @__PURE__ */ jsx("span", {
											className: `rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${isActive ? "bg-violet-400 text-black font-bold" : tab.badgeClass}`,
											children: tab.count
										})]
									}, tab.id);
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-4 shadow-lg shadow-black/40 ring-1 ring-white/[0.04] space-y-3",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400",
									children: [/* @__PURE__ */ jsx("span", { children: "Quick Actions" }), /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-zinc-500" })]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: markAllAsRead,
									disabled: unreadCount === 0,
									className: `flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition-all ${unreadCount > 0 ? "border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-white hover:border-violet-500/50 active:scale-[0.98]" : "border border-white/[0.05] bg-white/[0.02] text-zinc-600 cursor-not-allowed"}`,
									children: [/* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", { children: "Mark all as read" })]
								}),
								/* @__PURE__ */ jsxs(Link, {
									href: route("requests.index"),
									className: "flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white",
									children: [/* @__PURE__ */ jsx("span", { children: "Kanban Board" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 text-zinc-500" })]
								}),
								/* @__PURE__ */ jsxs(Link, {
									href: route("requests.index", { my_work: "1" }),
									className: "flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white",
									children: [/* @__PURE__ */ jsx("span", { children: "My Tasks" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 text-zinc-500" })]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-4 shadow-lg shadow-black/40 ring-1 ring-white/[0.04] space-y-3.5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400",
									children: [/* @__PURE__ */ jsx("span", { children: "Activity Overview" }), /* @__PURE__ */ jsx(Radio, { className: "h-3.5 w-3.5 text-emerald-400" })]
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between text-xs mb-1.5",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-zinc-400 font-medium",
										children: "Read Rate"
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-mono font-bold text-zinc-200",
										children: [clearanceRate, "%"]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "h-2 w-full overflow-hidden rounded-full bg-zinc-800",
									children: /* @__PURE__ */ jsx("div", {
										className: "h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300",
										style: { width: `${clearanceRate}%` }
									})
								})] }),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-2 border-t border-white/[0.06] pt-3 text-xs",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between text-zinc-400",
											children: [/* @__PURE__ */ jsx("span", { children: "Sync Status" }), /* @__PURE__ */ jsxs("span", {
												className: "flex items-center gap-1.5 font-medium text-emerald-400 font-mono text-[11px]",
												children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" }), "Live"]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between text-zinc-400",
											children: [/* @__PURE__ */ jsx("span", { children: "Scope" }), /* @__PURE__ */ jsx("span", {
												className: "text-zinc-200 font-medium text-[11px]",
												children: "All Workspaces"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between text-zinc-400",
											children: [/* @__PURE__ */ jsx("span", { children: "Unread Items" }), /* @__PURE__ */ jsxs("span", {
												className: "font-mono text-zinc-200 font-semibold text-[11px]",
												children: [unreadCount, " items"]
											})]
										})
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "lg:col-span-9 space-y-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative rounded-2xl border border-white/[0.08] bg-[#090a0f]/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-white/[0.04] overflow-hidden",
						children: [
							/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" }),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] bg-[#0c0d12]/70 p-4",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-xs font-semibold text-zinc-200",
										children: sidebarTabs.find((t) => t.id === currentTab)?.label
									}), /* @__PURE__ */ jsx("span", {
										className: "rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-400",
										children: filteredNotifications.length
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "relative w-full sm:w-80",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500",
											children: /* @__PURE__ */ jsx(Search, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ jsx("input", {
											type: "text",
											value: searchQuery,
											onChange: (e) => setSearchQuery(e.target.value),
											placeholder: "Filter title, #REQ-ID, actor, message...",
											className: "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 shadow-inner transition-colors focus:border-violet-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-violet-500/50"
										}),
										searchQuery && /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => setSearchQuery(""),
											className: "absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-white",
											title: "Clear search",
											children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
										})
									]
								})]
							}),
							filteredNotifications.length > 0 ? /* @__PURE__ */ jsx("div", {
								className: "divide-y divide-white/[0.04]",
								children: filteredNotifications.map((notification) => {
									const isUnread = !notification.read_at;
									const badge = getNotificationBadge(notification);
									const Icon = badge.icon;
									return /* @__PURE__ */ jsxs("div", {
										onClick: () => handleNavigate(notification),
										className: `group relative flex flex-col md:flex-row md:items-center justify-between gap-3.5 px-5 py-4 cursor-pointer transition-all duration-150 ${isUnread ? "bg-violet-500/[0.04] hover:bg-violet-500/[0.08] border-l-2 border-l-violet-500" : "opacity-85 hover:opacity-100 hover:bg-white/[0.02] border-l-2 border-l-transparent"}`,
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-start sm:items-center gap-3.5 min-w-0 flex-1",
											children: [
												/* @__PURE__ */ jsx("div", {
													className: "mt-1 sm:mt-0 flex h-3.5 w-3.5 shrink-0 items-center justify-center",
													children: isUnread ? /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" }) : /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-zinc-700" })
												}),
												/* @__PURE__ */ jsxs("div", {
													className: `flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${badge.pillClass}`,
													children: [/* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: badge.label })]
												}),
												notification.request_id && /* @__PURE__ */ jsxs("span", {
													className: "shrink-0 font-mono text-[11px] font-bold text-zinc-300 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded shadow-sm",
													children: ["#REQ-", notification.request_id]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3",
													children: [/* @__PURE__ */ jsx("span", {
														className: "text-xs font-semibold text-zinc-100 group-hover:text-white truncate max-w-xs sm:max-w-sm shrink-0",
														children: notification.request_title ?? "Work Request"
													}), notification.message && /* @__PURE__ */ jsx("p", {
														className: "text-xs text-zinc-400 group-hover:text-zinc-300 truncate leading-relaxed",
														children: notification.message
													})]
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex items-center self-end md:self-center gap-3 shrink-0 pl-7 md:pl-0",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono",
													children: [/* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: formatRelativeTime(notification.created_at) })]
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: (e) => toggleReadStatus(notification.id, e),
													className: `flex h-7 px-2.5 items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${isUnread ? "border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-white" : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"}`,
													title: isUnread ? "Mark as read" : "Mark as unread",
													"aria-label": isUnread ? "Mark as read" : "Mark as unread",
													children: isUnread ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-emerald-400" }), /* @__PURE__ */ jsx("span", {
														className: "hidden sm:inline",
														children: "Mark read"
													})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", {
														className: "hidden sm:inline",
														children: "Mark unread"
													})] })
												}),
												/* @__PURE__ */ jsx("div", {
													className: "flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors group-hover:text-zinc-200 group-hover:bg-white/[0.04]",
													children: /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })
												})
											]
										})]
									}, notification.id);
								})
							}) : /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center justify-center py-20 px-4 text-center",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-[#0c0d12] text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20 mb-4",
										children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8" })
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "text-base font-bold text-white tracking-tight",
										children: searchQuery ? "No matching notifications" : "All caught up"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 max-w-sm text-xs text-zinc-400 leading-relaxed",
										children: searchQuery ? `No notifications found matching "${searchQuery}".` : currentTab === "assignments" ? "No assignment updates requiring your attention right now." : currentTab === "reviews" ? "No pending review alerts or sign-off requests." : currentTab === "inbox" ? "No unread notifications. You are all caught up!" : "No notifications found in this list."
									}),
									searchQuery ? /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => setSearchQuery(""),
										className: "mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white",
										children: [/* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Clear search filter" })]
									}) : /* @__PURE__ */ jsx("div", {
										className: "mt-6 flex flex-col sm:flex-row items-center gap-3",
										children: /* @__PURE__ */ jsxs(Link, {
											href: route("requests.index"),
											className: "flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/20 hover:text-white shadow-sm",
											children: [/* @__PURE__ */ jsx("span", { children: "Go to Kanban Board" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })]
										})
									})
								]
							})
						]
					})
				})]
			})]
		})]
	});
}
//#endregion
export { Index as default };
