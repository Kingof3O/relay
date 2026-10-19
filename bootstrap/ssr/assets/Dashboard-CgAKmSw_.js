import { p as Card, t as Authenticated, w as Badge } from "./AuthenticatedLayout--RwczYuP.js";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Activity, AlertOctagon, ArrowRight, BarChart3, Check, CheckCircle2, Clock, Flame, FolderKanban, KanbanSquare, Play, Plus, ShieldAlert, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
//#region resources/js/Features/Dashboard/components/DashboardHero.tsx
function DashboardHero({ firstName, stats, statusBreakdown = {} }) {
	const totalPipeline = Math.max(0, stats.total || 0);
	const pipelineSegments = [
		{
			statusKey: "new",
			label: "New",
			count: statusBreakdown.new ?? 0,
			barColor: "bg-zinc-400",
			dotColor: "bg-zinc-400"
		},
		{
			statusKey: "ready",
			label: "Ready",
			count: statusBreakdown.ready ?? 0,
			barColor: "bg-sky-400",
			dotColor: "bg-sky-400"
		},
		{
			statusKey: "doing",
			label: "In Progress",
			count: statusBreakdown.doing ?? 0,
			barColor: "bg-indigo-400",
			dotColor: "bg-indigo-400"
		},
		{
			statusKey: "review",
			label: "Review",
			count: statusBreakdown.review ?? 0,
			barColor: "bg-amber-400",
			dotColor: "bg-amber-400"
		},
		{
			statusKey: "done",
			label: "Done",
			count: statusBreakdown.done ?? 0,
			barColor: "bg-emerald-400",
			dotColor: "bg-emerald-400"
		}
	];
	const activeSegments = pipelineSegments.filter((s) => s.count > 0);
	return /* @__PURE__ */ jsxs("section", {
		className: "relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111216] p-6 shadow-sm sm:p-7",
		children: [/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" }), /* @__PURE__ */ jsxs("div", {
			className: "relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "max-w-2xl",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300",
						children: [
							/* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-zinc-400" }),
							/* @__PURE__ */ jsxs("span", { children: ["Overview · ", firstName] }),
							/* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-zinc-500" }),
							/* @__PURE__ */ jsxs("span", {
								className: "text-zinc-400",
								children: [stats.total, " total requests"]
							})
						]
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl",
						children: "Command Center"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400",
						children: "Overview of your tasks, active projects, and team progress."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-5 max-w-xl",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "mb-2 flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "font-medium text-zinc-300",
											children: "Delivery Pipeline"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "text-zinc-600",
											children: "·"
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "font-mono text-[11px] text-zinc-400",
											children: [
												stats.total,
												" total ",
												stats.total === 1 ? "task" : "tasks"
											]
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5 font-mono text-[11px] text-zinc-400",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "font-semibold text-emerald-400",
										children: [stats.done, " completed"]
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-zinc-600",
										children: [
											"(",
											stats.completion_rate,
											"%)"
										]
									})]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "flex h-2 w-full gap-1 overflow-hidden rounded-full bg-zinc-800/50",
								children: activeSegments.length === 0 ? /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-zinc-800/40" }) : activeSegments.map((segment) => {
									const pct = totalPipeline > 0 ? Math.round(segment.count / totalPipeline * 100) : 0;
									return /* @__PURE__ */ jsx("div", {
										style: { flex: segment.count },
										className: `h-full ${segment.barColor} transition-all duration-300 hover:brightness-125`,
										title: `${segment.label}: ${segment.count} (${pct}%)`
									}, segment.statusKey);
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: pipelineSegments.map((segment) => /* @__PURE__ */ jsxs(Link, {
									href: route("requests.index", { status: segment.statusKey }),
									className: "group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs transition-all duration-150 hover:border-white/[0.14] hover:bg-white/[0.06] active:scale-[0.98]",
									title: `Filter ${segment.label} in Kanban`,
									children: [
										/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${segment.dotColor} transition-transform group-hover:scale-125` }),
										/* @__PURE__ */ jsx("span", {
											className: "font-medium text-zinc-400 transition-colors group-hover:text-zinc-200",
											children: segment.label
										}),
										/* @__PURE__ */ jsx("span", {
											className: "font-mono text-[11px] font-semibold text-zinc-300 group-hover:text-white",
											children: segment.count
										})
									]
								}, segment.statusKey))
							})
						]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => window.dispatchEvent(new CustomEvent("open-quick-create")),
					className: "group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:bg-zinc-200 active:scale-[0.98]",
					children: [
						/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
						/* @__PURE__ */ jsx("span", { children: "New Work Request" }),
						/* @__PURE__ */ jsx("kbd", {
							className: "rounded bg-zinc-200 px-1 py-0.5 text-[10px] font-mono text-zinc-800",
							children: "C"
						})
					]
				}), /* @__PURE__ */ jsxs(Link, {
					href: route("requests.index"),
					className: "group flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-850 px-4 py-2.5 text-xs font-medium text-zinc-200 shadow-sm transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white active:scale-[0.98]",
					children: [
						/* @__PURE__ */ jsx(KanbanSquare, { className: "h-4 w-4 text-zinc-400" }),
						/* @__PURE__ */ jsx("span", { children: "Open Kanban Board" }),
						/* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" })
					]
				})]
			})]
		})]
	});
}
//#endregion
//#region resources/js/Features/Dashboard/components/DashboardKpiTiles.tsx
function DashboardKpiTiles({ stats }) {
	const metrics = [
		{
			label: "New requests",
			value: stats.new,
			icon: Sparkles,
			detail: "Needs review",
			href: route("requests.index", { status: "new" })
		},
		{
			label: "My tasks",
			value: stats.my_work,
			icon: CheckCircle2,
			detail: "Assigned to you",
			href: route("requests.index", { my_work: "1" })
		},
		{
			label: "In review",
			value: stats.review,
			icon: Clock,
			detail: "Ready for review",
			href: route("requests.index", { status: "review" })
		},
		{
			label: "Blocked tasks",
			value: stats.blocked,
			icon: AlertOctagon,
			detail: stats.blocked > 0 ? "Needs attention" : "No blockers",
			href: route("requests.index", { blocked: "1" }),
			hasAlert: stats.blocked > 0
		},
		{
			label: "Completion rate",
			value: `${stats.completion_rate ?? 0}%`,
			icon: TrendingUp,
			detail: `${stats.done ?? 0} of ${stats.total ?? 0} completed`,
			href: route("requests.index", { status: "done" })
		}
	];
	return /* @__PURE__ */ jsx("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-5",
		children: metrics.map((metric) => {
			const Icon = metric.icon;
			return /* @__PURE__ */ jsxs(Link, {
				href: metric.href,
				className: "group relative flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
						children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
					}), metric.hasAlert ? /* @__PURE__ */ jsx("span", {
						className: "rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400",
						children: "Action needed"
					}) : /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300",
						children: ["View ", /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
					})]
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
	});
}
//#endregion
//#region resources/js/Features/Dashboard/components/DeliveryVelocityCard.tsx
function VelocityTooltip({ active, payload, label }) {
	if (!active || !payload || !payload.length) return null;
	const created = payload.find((p) => p.dataKey === "created")?.value ?? 0;
	const completed = payload.find((p) => p.dataKey === "completed")?.value ?? 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg border border-zinc-800 bg-[#0c0d11]/95 p-3 shadow-xl backdrop-blur-md",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-[11px] font-medium uppercase tracking-wider text-zinc-400",
			children: label
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-2 space-y-1.5",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-5 text-xs",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1.5 text-zinc-400",
					children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-indigo-400" }), "Created"]
				}), /* @__PURE__ */ jsx("span", {
					className: "font-semibold tabular-nums text-zinc-100",
					children: created
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-5 text-xs",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1.5 text-zinc-400",
					children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" }), "Completed"]
				}), /* @__PURE__ */ jsx("span", {
					className: "font-semibold tabular-nums text-zinc-100",
					children: completed
				})]
			})]
		})]
	});
}
function DeliveryVelocityCard({ velocity = [], className = "p-5 lg:col-span-7" }) {
	return /* @__PURE__ */ jsxs(Card, {
		className,
		hoverable: true,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
					children: /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-sm font-semibold text-zinc-100",
					children: "Weekly Activity"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-zinc-500",
					children: "Tasks created vs completed this week"
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-4 text-xs",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-indigo-400" }), /* @__PURE__ */ jsx("span", {
						className: "text-zinc-400",
						children: "Created"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" }), /* @__PURE__ */ jsx("span", {
						className: "text-zinc-400",
						children: "Completed"
					})]
				})]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-4 h-64 w-full",
			children: velocity.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ jsxs(AreaChart, {
					data: velocity,
					margin: {
						top: 10,
						right: 10,
						left: -20,
						bottom: 0
					},
					children: [
						/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsxs("linearGradient", {
							id: "createdGrad",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ jsx("stop", {
								offset: "5%",
								stopColor: "#818cf8",
								stopOpacity: .08
							}), /* @__PURE__ */ jsx("stop", {
								offset: "95%",
								stopColor: "#818cf8",
								stopOpacity: 0
							})]
						}), /* @__PURE__ */ jsxs("linearGradient", {
							id: "completedGrad",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ jsx("stop", {
								offset: "5%",
								stopColor: "#34d399",
								stopOpacity: .08
							}), /* @__PURE__ */ jsx("stop", {
								offset: "95%",
								stopColor: "#34d399",
								stopOpacity: 0
							})]
						})] }),
						/* @__PURE__ */ jsx(CartesianGrid, {
							strokeDasharray: "3 3",
							stroke: "#ffffff08",
							vertical: false
						}),
						/* @__PURE__ */ jsx(XAxis, {
							dataKey: "day",
							stroke: "#71717a",
							fontSize: 11,
							tickLine: false,
							axisLine: false
						}),
						/* @__PURE__ */ jsx(YAxis, {
							stroke: "#71717a",
							fontSize: 11,
							tickLine: false,
							axisLine: false,
							allowDecimals: false
						}),
						/* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(VelocityTooltip, {}) }),
						/* @__PURE__ */ jsx(Area, {
							type: "monotone",
							dataKey: "created",
							stroke: "#818cf8",
							strokeWidth: 1.5,
							fillOpacity: 1,
							fill: "url(#createdGrad)"
						}),
						/* @__PURE__ */ jsx(Area, {
							type: "monotone",
							dataKey: "completed",
							stroke: "#34d399",
							strokeWidth: 1.5,
							fillOpacity: 1,
							fill: "url(#completedGrad)"
						})
					]
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "flex h-full items-center justify-center text-xs text-zinc-500",
				children: "Insufficient data points for velocity curve."
			})
		})]
	});
}
//#endregion
//#region resources/js/Features/Dashboard/components/InitiativesProgressCard.tsx
function InitiativesProgressCard({ projectStats = [], className = "p-5 lg:col-span-5" }) {
	return /* @__PURE__ */ jsxs(Card, {
		className,
		hoverable: true,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
					children: /* @__PURE__ */ jsx(FolderKanban, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-sm font-semibold text-zinc-100",
					children: "Project Progress"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-zinc-500",
					children: "Task completion across projects"
				})] })]
			}), /* @__PURE__ */ jsxs(Link, {
				href: route("settings.index"),
				className: "flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					"Manage (",
					projectStats.length,
					")"
				] }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-4 space-y-2.5",
			children: projectStats.length > 0 ? projectStats.slice(0, 5).map((project) => /* @__PURE__ */ jsxs(Link, {
				href: route("requests.index", { project: project.slug }),
				className: "group block rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "h-2 w-2 rounded-full",
								style: { backgroundColor: project.color }
							}),
							/* @__PURE__ */ jsx("span", {
								className: "font-medium text-zinc-200 transition-colors group-hover:text-white",
								children: project.name
							}),
							project.blocked > 0 && /* @__PURE__ */ jsxs("span", {
								className: "rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20",
								children: [project.blocked, " blocked"]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 font-mono text-[11px] text-zinc-400",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							project.done,
							"/",
							project.total
						] }), /* @__PURE__ */ jsxs("span", {
							className: "font-semibold text-zinc-200",
							children: [Math.round(project.percentage || 0), "%"]
						})]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800",
					children: /* @__PURE__ */ jsx("div", {
						className: "h-full rounded-full transition-all duration-300",
						style: {
							width: `${Math.max(0, Math.min(100, project.percentage || 0))}%`,
							backgroundColor: project.color
						}
					})
				})]
			}, project.id)) : /* @__PURE__ */ jsx("div", {
				className: "flex h-32 items-center justify-center text-xs text-zinc-500",
				children: "No active projects found."
			})
		})]
	});
}
//#endregion
//#region resources/js/Features/Dashboard/components/RoadblockAlertBanner.tsx
function RoadblockAlertBanner({ blockedRequests, onUnblockLatest }) {
	if (!blockedRequests || blockedRequests.length === 0) return null;
	const latest = blockedRequests[0];
	return /* @__PURE__ */ jsx("div", {
		className: "relative rounded-xl border border-rose-900/50 bg-[#161214] p-4 sm:p-5",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-400",
					children: /* @__PURE__ */ jsx(ShieldAlert, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs("h4", {
						className: "text-xs sm:text-sm font-semibold text-rose-200",
						children: [
							blockedRequests.length,
							" Active ",
							blockedRequests.length === 1 ? "Blocked Task" : "Blocked Tasks"
						]
					}), /* @__PURE__ */ jsx("span", {
						className: "rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-medium text-rose-400",
						children: "Action Required"
					})]
				}), /* @__PURE__ */ jsxs("p", {
					className: "mt-0.5 text-xs text-zinc-400",
					children: [
						"Latest: ",
						/* @__PURE__ */ jsx("strong", {
							className: "text-zinc-200",
							children: latest.title
						}),
						" — ",
						latest.blocked_reason || "Needs attention"
					]
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [onUnblockLatest && /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => onUnblockLatest(latest),
					className: "flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white",
					children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Unblock Latest" })]
				}), /* @__PURE__ */ jsxs(Link, {
					href: route("requests.index", { blocked: "1" }),
					className: "flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-850 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200",
					children: [/* @__PURE__ */ jsx("span", { children: "View All Blocked" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })]
				})]
			})]
		})
	});
}
//#endregion
//#region resources/js/Features/Dashboard/components/DashboardActivityFeed.tsx
var formatActivityDate = (date) => date ? new Intl.DateTimeFormat(void 0, {
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit"
}).format(new Date(date)) : "";
function DashboardActivityFeed({ recentActivity = [], className = "p-4" }) {
	return /* @__PURE__ */ jsxs(Card, {
		className,
		hoverable: true,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 px-1",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
					children: /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
					children: "Live Stream"
				}), /* @__PURE__ */ jsx("h2", {
					className: "text-xs font-semibold text-zinc-100",
					children: "Audit & Activity Log"
				})] })]
			}), /* @__PURE__ */ jsxs(Link, {
				className: "flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-850 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200",
				href: route("requests.index"),
				children: [/* @__PURE__ */ jsx("span", { children: "All Work" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })]
			})]
		}), recentActivity.length > 0 ? /* @__PURE__ */ jsx("div", {
			className: "mt-2 divide-y divide-zinc-800/60",
			children: recentActivity.slice(0, 6).map((activity) => /* @__PURE__ */ jsx(Link, {
				href: route("requests.show", activity.request_id),
				className: "block rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-zinc-850/40",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-300",
						children: (activity.user?.name ?? "S").charAt(0)
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "line-clamp-1 text-xs font-medium text-zinc-200",
							children: activity.body || activity.type.replaceAll("_", " ")
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-medium text-zinc-400",
									children: activity.user?.name ?? "System"
								}),
								/* @__PURE__ */ jsx("span", { children: "·" }),
								/* @__PURE__ */ jsx("span", {
									className: "truncate text-zinc-400",
									children: activity.request_title
								}),
								activity.created_at && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { children: "·" }), /* @__PURE__ */ jsx("span", {
									className: "text-zinc-500",
									children: formatActivityDate(activity.created_at)
								})] })
							]
						})]
					})]
				})
			}, activity.id))
		}) : /* @__PURE__ */ jsx("div", {
			className: "flex flex-col items-center justify-center py-8 text-center",
			children: /* @__PURE__ */ jsx("p", {
				className: "text-xs font-normal text-zinc-500",
				children: "Activity feed will stream here."
			})
		})]
	});
}
//#endregion
//#region resources/js/Features/Dashboard/components/TeamWorkloadCard.tsx
function TeamWorkloadCard({ teamWorkload = [], className = "p-4" }) {
	return /* @__PURE__ */ jsxs(Card, {
		className,
		hoverable: true,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 px-1",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
					children: /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
					children: "Squad Capacity"
				}), /* @__PURE__ */ jsx("h2", {
					className: "text-xs font-semibold text-zinc-100",
					children: "Team Workload Distribution"
				})] })]
			}), /* @__PURE__ */ jsxs("span", {
				className: "rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-xs font-medium text-zinc-400",
				children: [teamWorkload.length, " Members"]
			})]
		}), teamWorkload.length > 0 ? /* @__PURE__ */ jsx("div", {
			className: "mt-3 divide-y divide-zinc-800/60",
			children: teamWorkload.slice(0, 5).map((member) => /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between py-2.5 px-2 transition-colors hover:bg-zinc-850/40 rounded-lg",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] font-semibold text-zinc-200",
						children: member.name.charAt(0)
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs font-medium text-zinc-200",
						children: member.name
					}), /* @__PURE__ */ jsx("p", {
						className: "text-[10px] text-zinc-500",
						children: member.role
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 text-xs",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-zinc-400",
							children: [
								/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-zinc-400" }),
								member.active,
								" active"
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-amber-400/90",
							children: [
								/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-amber-400" }),
								member.review,
								" review"
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-emerald-400/90",
							children: [
								/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400" }),
								member.done,
								" done"
							]
						})
					]
				})]
			}, member.id))
		}) : /* @__PURE__ */ jsx("div", {
			className: "flex flex-col items-center justify-center py-8 text-center",
			children: /* @__PURE__ */ jsx("p", {
				className: "text-xs font-normal text-zinc-500",
				children: "No active team members."
			})
		})]
	});
}
//#endregion
//#region resources/js/Features/Dashboard/components/DashboardQueuesGrid.tsx
function ActionableRequestRow({ request, onAdvance, actionLabel, actionIcon: ActionIcon }) {
	const priorityDot = request.priority === "urgent" ? "bg-rose-500" : request.status === "review" ? "bg-amber-400" : request.status === "done" ? "bg-emerald-400" : "bg-zinc-400";
	return /* @__PURE__ */ jsxs("div", {
		className: "group relative flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-zinc-800 hover:bg-zinc-850/40",
		children: [/* @__PURE__ */ jsxs(Link, {
			href: route("requests.show", request.id),
			className: "flex min-w-0 flex-1 items-center gap-3",
			children: [/* @__PURE__ */ jsx("span", { className: `h-2 w-2 shrink-0 rounded-full ${priorityDot}` }), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ jsx("p", {
					className: "truncate text-xs font-medium text-zinc-200 transition-colors group-hover:text-white",
					children: request.title
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500",
					children: [
						request.project && /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1.5 truncate text-zinc-400",
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-1.5 w-1.5 rounded-full",
								style: { backgroundColor: request.project.color ?? "#71717a" }
							}), request.project.name]
						}),
						/* @__PURE__ */ jsx("span", { children: "·" }),
						/* @__PURE__ */ jsx("span", {
							className: "truncate text-zinc-400",
							children: request.assignee?.name ?? "Unassigned"
						}),
						request.is_blocked && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { children: "·" }), /* @__PURE__ */ jsx("span", {
							className: "font-medium text-rose-400",
							children: "Blocked"
						})] })
					]
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex shrink-0 items-center gap-2",
			children: [/* @__PURE__ */ jsx(Badge, {
				variant: request.priority === "urgent" ? "rose" : request.status === "review" ? "amber" : request.status === "done" ? "emerald" : "zinc",
				children: request.priority === "urgent" ? "Urgent" : request.status_label
			}), onAdvance && actionLabel && /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: (e) => {
					e.preventDefault();
					e.stopPropagation();
					onAdvance(request);
				},
				className: "hidden items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white group-hover:flex",
				title: actionLabel,
				children: [ActionIcon && /* @__PURE__ */ jsx(ActionIcon, { className: "h-3 w-3 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: actionLabel })]
			})]
		})]
	});
}
function SectionQueue({ eyebrow, title, count, requests, empty, href, icon: Icon, actionLabel, actionIcon, onAdvance }) {
	return /* @__PURE__ */ jsxs(Card, {
		className: "p-4",
		hoverable: true,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 px-1",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
					children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
					children: eyebrow
				}), /* @__PURE__ */ jsx("h2", {
					className: "text-xs font-semibold text-zinc-100",
					children: title
				})] })]
			}), /* @__PURE__ */ jsx(Link, {
				href,
				className: "flex h-6 min-w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200",
				children: count
			})]
		}), requests.length > 0 ? /* @__PURE__ */ jsx("div", {
			className: "mt-2 space-y-1",
			children: requests.slice(0, 5).map((request) => /* @__PURE__ */ jsx(ActionableRequestRow, {
				request,
				actionLabel,
				actionIcon,
				onAdvance
			}, request.id))
		}) : /* @__PURE__ */ jsx("div", {
			className: "flex flex-col items-center justify-center py-8 text-center",
			children: /* @__PURE__ */ jsx("p", {
				className: "text-xs font-normal text-zinc-500",
				children: empty
			})
		})]
	});
}
function DashboardQueuesGrid({ stats, newRequests, myAssignedWork, reviewRequests, blockedRequests, urgentRequests, teamWorkload = [], recentActivity = [], teamWorkloadSlot, activityFeedSlot, onAdvanceRequest, onUnblockRequest }) {
	const [queueFilter, setQueueFilter] = useState("all");
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1 rounded-lg border border-zinc-800 bg-[#0d0e12] p-1",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setQueueFilter("all"),
						className: `rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${queueFilter === "all" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200"}`,
						children: "All Tasks"
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setQueueFilter("triage"),
						className: `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${queueFilter === "triage" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200"}`,
						children: [/* @__PURE__ */ jsx("span", { children: "New" }), /* @__PURE__ */ jsx("span", {
							className: "rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300",
							children: stats.new
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setQueueFilter("my_work"),
						className: `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${queueFilter === "my_work" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200"}`,
						children: [/* @__PURE__ */ jsx("span", { children: "My Tasks" }), /* @__PURE__ */ jsx("span", {
							className: "rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300",
							children: stats.my_work
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setQueueFilter("review"),
						className: `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${queueFilter === "review" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200"}`,
						children: [/* @__PURE__ */ jsx("span", { children: "In Review" }), /* @__PURE__ */ jsx("span", {
							className: "rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300",
							children: stats.review
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setQueueFilter("blocked"),
						className: `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${queueFilter === "blocked" ? "bg-zinc-800 text-rose-300 shadow-sm border border-rose-900/40" : "text-zinc-400 hover:text-zinc-200"}`,
						children: [/* @__PURE__ */ jsx("span", { children: "Blocked" }), /* @__PURE__ */ jsx("span", {
							className: "rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300",
							children: stats.blocked
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5 text-xs text-zinc-500",
				children: [/* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Hover a task for quick actions" })]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid gap-4 xl:grid-cols-2",
			children: [
				(queueFilter === "all" || queueFilter === "triage") && /* @__PURE__ */ jsx(SectionQueue, {
					eyebrow: "New",
					title: "New Tasks",
					count: stats.new,
					requests: newRequests,
					empty: "No new tasks waiting for review.",
					href: route("requests.index", { status: "new" }),
					icon: Sparkles,
					actionLabel: "Pick Up",
					actionIcon: Play,
					onAdvance: (req) => onAdvanceRequest(req, "ready")
				}),
				(queueFilter === "all" || queueFilter === "my_work") && /* @__PURE__ */ jsx(SectionQueue, {
					eyebrow: "Assigned",
					title: "My Tasks",
					count: stats.my_work,
					requests: myAssignedWork,
					empty: "Your active queue is clear.",
					href: route("requests.index", { my_work: "1" }),
					icon: CheckCircle2,
					actionLabel: "Send to Review",
					actionIcon: Clock,
					onAdvance: (req) => onAdvanceRequest(req, "review")
				}),
				(queueFilter === "all" || queueFilter === "review") && /* @__PURE__ */ jsx(SectionQueue, {
					eyebrow: "Review",
					title: "Tasks in Review",
					count: stats.review,
					requests: reviewRequests,
					empty: "No tasks awaiting approval.",
					href: route("requests.index", { status: "review" }),
					icon: Clock,
					actionLabel: "Approve",
					actionIcon: Check,
					onAdvance: (req) => onAdvanceRequest(req, "done")
				}),
				(queueFilter === "all" || queueFilter === "blocked") && /* @__PURE__ */ jsx(SectionQueue, {
					eyebrow: "Blocked",
					title: "Blocked Tasks",
					count: stats.blocked,
					requests: blockedRequests,
					empty: "No blocked tasks.",
					href: route("requests.index", { blocked: "1" }),
					icon: AlertOctagon,
					actionLabel: "Unblock",
					actionIcon: Check,
					onAdvance: onUnblockRequest
				}),
				queueFilter === "all" && /* @__PURE__ */ jsx(SectionQueue, {
					eyebrow: "Expedite",
					title: "Urgent Requests",
					count: stats.urgent,
					requests: urgentRequests,
					empty: "No high-urgency requests right now.",
					href: route("requests.index", { priority: "urgent" }),
					icon: Flame
				}),
				queueFilter === "all" && (teamWorkloadSlot !== void 0 ? teamWorkloadSlot : teamWorkload.length > 0 ? /* @__PURE__ */ jsx(TeamWorkloadCard, { teamWorkload }) : null),
				activityFeedSlot !== void 0 ? activityFeedSlot : /* @__PURE__ */ jsx(DashboardActivityFeed, { recentActivity })
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Dashboard.tsx
function Dashboard({ stats, velocity = [], projectStats = [], statusBreakdown = {}, teamWorkload = [], newRequests = [], myAssignedWork = [], reviewRequests = [], blockedRequests = [], urgentRequests = [], recentActivity = [] }) {
	const { auth } = usePage().props;
	const firstName = auth.user.name.split(" ")[0];
	const advanceRequest = (request, nextStatus) => {
		router.patch(route("requests.update", request.id), { status: nextStatus }, { preserveScroll: true });
	};
	const unblockRequest = (request) => {
		router.patch(route("requests.update", request.id), {
			is_blocked: false,
			blocked_reason: null
		}, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx("div", {
			className: "flex items-center justify-between",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
						children: "Operations"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-zinc-600",
						children: "/"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500",
						children: "Overview"
					})
				]
			}), /* @__PURE__ */ jsx("h1", {
				className: "mt-1 text-lg font-semibold text-zinc-100",
				children: "Studio Dashboard"
			})] })
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Dashboard · Overview" }), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1600px] space-y-6",
			children: [
				/* @__PURE__ */ jsx(DashboardHero, {
					firstName,
					stats,
					statusBreakdown
				}),
				/* @__PURE__ */ jsx(DashboardKpiTiles, { stats }),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-6 lg:grid-cols-12",
					children: [/* @__PURE__ */ jsx(DeliveryVelocityCard, { velocity }), /* @__PURE__ */ jsx(InitiativesProgressCard, { projectStats })]
				}),
				/* @__PURE__ */ jsx(RoadblockAlertBanner, {
					blockedRequests,
					onUnblockLatest: unblockRequest
				}),
				/* @__PURE__ */ jsx(DashboardQueuesGrid, {
					stats,
					newRequests,
					myAssignedWork,
					reviewRequests,
					blockedRequests,
					urgentRequests,
					onAdvanceRequest: advanceRequest,
					onUnblockRequest: unblockRequest,
					teamWorkloadSlot: teamWorkload.length > 0 ? /* @__PURE__ */ jsx(TeamWorkloadCard, { teamWorkload }) : void 0,
					activityFeedSlot: /* @__PURE__ */ jsx(DashboardActivityFeed, { recentActivity })
				})
			]
		})]
	});
}
//#endregion
export { Dashboard as default };
