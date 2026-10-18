import { t as Authenticated } from "./AuthenticatedLayout-KgOcAsfl.js";
import { Head, Link, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Calendar, Repeat, RotateCcw } from "lucide-react";
import { toast } from "sonner";
//#region resources/js/Components/Cycles/CycleBurndownChart.tsx
function CycleBurndownChart({ data }) {
	const { days, metrics } = data;
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const width = 800;
	const height = 260;
	const padding = {
		top: 25,
		right: 35,
		bottom: 35,
		left: 45
	};
	const maxPoints = Math.max(metrics.total_points, 10);
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;
	const xStep = days.length > 1 ? chartWidth / (days.length - 1) : chartWidth;
	const getY = (val) => {
		return padding.top + chartHeight - val / maxPoints * chartHeight;
	};
	const getX = (index) => {
		return padding.left + index * xStep;
	};
	const idealPath = useMemo(() => {
		if (!days.length) return "";
		return days.reduce((path, d, i) => {
			const x = getX(i);
			const y = getY(d.ideal);
			return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
		}, "");
	}, [days, maxPoints]);
	const { actualPath, actualAreaPath } = useMemo(() => {
		const recordedDays = days.filter((d) => d.actual !== null);
		if (!recordedDays.length) return {
			actualPath: "",
			actualAreaPath: ""
		};
		const points = recordedDays.map((d) => {
			const index = days.findIndex((day) => day.date === d.date);
			return {
				x: getX(index),
				y: getY(d.actual)
			};
		});
		const line = points.reduce((path, p, i) => {
			return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
		}, "");
		const first = points[0];
		const last = points[points.length - 1];
		const bottomY = padding.top + chartHeight;
		return {
			actualPath: line,
			actualAreaPath: `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`
		};
	}, [days, maxPoints]);
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-5 shadow-xl",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
				className: "text-sm font-bold text-white flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", { children: "Cycle Burndown Velocity" }), /* @__PURE__ */ jsxs("span", {
					className: "rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-mono text-violet-300",
					children: [
						metrics.completed_points,
						" / ",
						metrics.total_points,
						" pts (",
						metrics.completion_percentage,
						"%)"
					]
				})]
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-0.5 text-xs text-zinc-400",
				children: "Linear burn trajectory vs actual completed points per day"
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-3 text-xs",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-5 rounded-full border border-dashed border-zinc-500" }), /* @__PURE__ */ jsx("span", {
							className: "text-zinc-400",
							children: "Ideal"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx("span", { className: "h-2.5 w-5 rounded-full bg-violet-500" }), /* @__PURE__ */ jsx("span", {
							className: "text-zinc-300 font-medium",
							children: "Actual"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-zinc-800 bg-[#14151b] px-2.5 py-1 text-zinc-300 font-mono text-[11px]",
						children: ["Velocity: ", /* @__PURE__ */ jsxs("span", {
							className: "text-emerald-400 font-semibold",
							children: [metrics.velocity_points_per_day, " pts/day"]
						})]
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative mt-4 w-full overflow-x-auto select-none",
			children: [/* @__PURE__ */ jsxs("svg", {
				viewBox: `0 0 ${width} ${height}`,
				className: "w-full h-auto overflow-visible font-mono text-[10px]",
				children: [
					/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
						id: "actualGradient",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ jsx("stop", {
							offset: "0%",
							stopColor: "#8b5cf6",
							stopOpacity: "0.35"
						}), /* @__PURE__ */ jsx("stop", {
							offset: "100%",
							stopColor: "#8b5cf6",
							stopOpacity: "0.0"
						})]
					}) }),
					[
						0,
						.25,
						.5,
						.75,
						1
					].map((pct) => {
						const y = padding.top + chartHeight * (1 - pct);
						const val = Math.round(maxPoints * pct);
						return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
							x1: padding.left,
							y1: y,
							x2: width - padding.right,
							y2: y,
							stroke: "currentColor",
							className: "text-zinc-850",
							strokeDasharray: pct === 0 ? void 0 : "3 3"
						}), /* @__PURE__ */ jsx("text", {
							x: padding.left - 8,
							y: y + 3,
							textAnchor: "end",
							className: "fill-zinc-500 font-mono text-[9px]",
							children: val
						})] }, pct);
					}),
					days.map((d, i) => {
						if (!d.is_today) return null;
						const x = getX(i);
						return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
							x1: x,
							y1: padding.top,
							x2: x,
							y2: padding.top + chartHeight,
							stroke: "#ec4899",
							strokeWidth: "1.5",
							strokeDasharray: "4 3"
						}), /* @__PURE__ */ jsx("text", {
							x,
							y: padding.top - 8,
							textAnchor: "middle",
							className: "fill-pink-400 font-bold text-[9px]",
							children: "TODAY"
						})] }, "today-indicator");
					}),
					/* @__PURE__ */ jsx("path", {
						d: idealPath,
						fill: "none",
						stroke: "#71717a",
						strokeWidth: "1.5",
						strokeDasharray: "4 4"
					}),
					actualAreaPath && /* @__PURE__ */ jsx("path", {
						d: actualAreaPath,
						fill: "url(#actualGradient)"
					}),
					actualPath && /* @__PURE__ */ jsx("path", {
						d: actualPath,
						fill: "none",
						stroke: "#8b5cf6",
						strokeWidth: "2.5",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}),
					days.map((d, i) => {
						const x = getX(i);
						const isRecorded = d.actual !== null;
						const y = isRecorded ? getY(d.actual) : getY(d.ideal);
						return /* @__PURE__ */ jsxs("g", {
							onMouseEnter: () => setHoveredIndex(i),
							onMouseLeave: () => setHoveredIndex(null),
							className: "cursor-pointer",
							children: [
								/* @__PURE__ */ jsx("rect", {
									x: x - xStep / 2,
									y: padding.top,
									width: xStep,
									height: chartHeight,
									fill: "transparent"
								}),
								isRecorded && /* @__PURE__ */ jsx("circle", {
									cx: x,
									cy: y,
									r: hoveredIndex === i ? 5 : 3.5,
									fill: "#8b5cf6",
									stroke: "#0c0d12",
									strokeWidth: "2",
									className: "transition-all"
								}),
								(i === 0 || i === days.length - 1 || i % 2 === 0) && /* @__PURE__ */ jsx("text", {
									x,
									y: padding.top + chartHeight + 18,
									textAnchor: "middle",
									className: `text-[9px] font-mono ${d.is_today ? "fill-pink-400 font-bold" : "fill-zinc-500"}`,
									children: d.label
								})
							]
						}, d.date);
					})
				]
			}), hoveredIndex !== null && days[hoveredIndex] && /* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none absolute top-2 rounded-xl border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-xs shadow-2xl backdrop-blur",
				style: { left: `${Math.min(Math.max(hoveredIndex / (days.length - 1) * 100, 10), 85)}%` },
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "font-semibold text-white",
						children: [
							"Day ",
							days[hoveredIndex].day,
							" · ",
							days[hoveredIndex].label
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-1 flex items-center justify-between gap-3 text-[11px] font-mono",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-zinc-400",
							children: "Ideal remaining:"
						}), /* @__PURE__ */ jsxs("span", {
							className: "text-zinc-300 font-bold",
							children: [days[hoveredIndex].ideal, " pts"]
						})]
					}),
					days[hoveredIndex].actual !== null && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-3 text-[11px] font-mono",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-violet-400",
							children: "Actual remaining:"
						}), /* @__PURE__ */ jsxs("span", {
							className: "text-violet-300 font-bold",
							children: [days[hoveredIndex].actual, " pts"]
						})]
					})
				]
			})]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Cycles/Index.tsx
function CyclesIndex({ currentCycle, cycles, burndown, tickets }) {
	const [rollingOver, setRollingOver] = useState(false);
	const [filterStatus, setFilterStatus] = useState("all");
	const handleRollover = () => {
		if (!confirm(`Are you sure you want to rollover Cycle #${currentCycle.number}? Unfinished tickets will be rolled over to the next cycle.`)) return;
		setRollingOver(true);
		router.post(route("cycles.rollover", currentCycle.id), {}, {
			onSuccess: () => toast.success("Cycle rolled over successfully!"),
			onError: () => toast.error("Could not rollover cycle."),
			onFinish: () => setRollingOver(false)
		});
	};
	const filteredTickets = tickets.filter((t) => {
		if (filterStatus === "all") return true;
		if (filterStatus === "done") return t.status === "done";
		if (filterStatus === "uncompleted") return t.status !== "done";
		return t.status === filterStatus;
	});
	const metrics = burndown.metrics;
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400",
					children: /* @__PURE__ */ jsx(Repeat, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-base font-bold text-white tracking-tight",
						children: currentCycle.name
					}), currentCycle.is_active ? /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400",
						children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" }), "Active Cycle"]
					}) : /* @__PURE__ */ jsx("span", {
						className: "rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400",
						children: "Completed"
					})]
				}), /* @__PURE__ */ jsxs("p", {
					className: "flex items-center gap-1.5 text-xs text-zinc-400",
					children: [/* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3 text-zinc-500" }), /* @__PURE__ */ jsxs("span", { children: [
						currentCycle.start_date,
						" – ",
						currentCycle.end_date,
						" (14 days)"
					] })]
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("select", {
					value: currentCycle.id,
					onChange: (e) => router.visit(route("cycles.index", { cycle_id: e.target.value })),
					className: "rounded-xl border border-zinc-800 bg-[#0d0e12] px-3 py-1.5 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:outline-none",
					children: cycles.map((c) => /* @__PURE__ */ jsxs("option", {
						value: c.id,
						children: [
							"Cycle ",
							c.number,
							": ",
							c.name,
							" ",
							c.is_active ? "★ Active" : ""
						]
					}, c.id))
				}), currentCycle.is_active && /* @__PURE__ */ jsxs("button", {
					type: "button",
					disabled: rollingOver,
					onClick: handleRollover,
					className: "flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-600/20 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600/30 hover:text-white transition-all disabled:opacity-50",
					title: "Close this cycle and rollover unfinished tickets to the next cycle",
					children: [/* @__PURE__ */ jsx(RotateCcw, { className: `h-3.5 w-3.5 ${rollingOver ? "animate-spin" : ""}` }), /* @__PURE__ */ jsx("span", { children: rollingOver ? "Rolling Over…" : "Rollover Cycle" })]
				})]
			})]
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: `Cycles · ${currentCycle.name}` }), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1600px] space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
									children: "Scope & Points"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex items-baseline gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-mono text-2xl font-bold text-white",
										children: metrics.completed_points
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-mono text-xs text-zinc-500",
										children: [
											"/ ",
											metrics.total_points,
											" pts"
										]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("div", {
										className: "h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden",
										children: /* @__PURE__ */ jsx("div", {
											className: "h-full bg-violet-500 rounded-full transition-all duration-300",
											style: { width: `${metrics.completion_percentage}%` }
										})
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-mono text-[10px] text-zinc-400",
										children: [metrics.completion_percentage, "%"]
									})]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
									children: "Tasks Completed"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex items-baseline gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-mono text-2xl font-bold text-white",
										children: metrics.completed_tickets
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-mono text-xs text-zinc-500",
										children: ["/ ", metrics.total_tickets]
									})]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "mt-2 text-[11px] text-zinc-500",
									children: [metrics.total_tickets - metrics.completed_tickets, " remaining in cycle"]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
									children: "Points Per Day"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex items-baseline gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-mono text-2xl font-bold text-emerald-400",
										children: metrics.velocity_points_per_day
									}), /* @__PURE__ */ jsx("span", {
										className: "font-mono text-xs text-zinc-500",
										children: "pts / day"
									})]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-[11px] text-zinc-500",
									children: "Average points completed per day"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
									children: "Rolled Over"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex items-baseline gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-mono text-2xl font-bold text-amber-300",
										children: metrics.rolled_over_tickets
									}), /* @__PURE__ */ jsx("span", {
										className: "font-mono text-xs text-zinc-500",
										children: "tickets"
									})]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-[11px] text-zinc-500",
									children: "Carried over from prior cycles"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ jsx(CycleBurndownChart, { data: burndown }),
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-5 shadow-xl",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ jsxs("h2", {
								className: "text-sm font-bold text-white",
								children: [
									"Cycle Tasks (",
									filteredTickets.length,
									")"
								]
							})
						}), /* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#07090e] p-1 text-xs",
							children: [
								{
									key: "all",
									label: "All"
								},
								{
									key: "uncompleted",
									label: "Remaining"
								},
								{
									key: "done",
									label: "Done"
								}
							].map((tab) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setFilterStatus(tab.key),
								className: `rounded-lg px-2.5 py-1 font-medium transition-all ${filterStatus === tab.key ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`,
								children: tab.label
							}, tab.key))
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-3 divide-y divide-white/[0.04]",
						children: filteredTickets.length > 0 ? filteredTickets.map((ticket) => /* @__PURE__ */ jsxs("div", {
							className: "group flex items-center justify-between gap-3 py-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3 min-w-0 flex-1",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "font-mono text-xs font-bold text-zinc-500 group-hover:text-violet-300",
										children: ["#", ticket.id]
									}),
									/* @__PURE__ */ jsx(Link, {
										href: route("requests.show", ticket.id),
										className: "truncate text-xs font-medium text-zinc-200 hover:text-white",
										children: ticket.title
									}),
									ticket.rolled_over_from_cycle_id && /* @__PURE__ */ jsx("span", {
										className: "rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 shrink-0",
										children: "Rolled Over"
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3 shrink-0 text-xs",
								children: [
									ticket.subtasks_progress && ticket.subtasks_progress.total > 0 && /* @__PURE__ */ jsxs("span", {
										className: "font-mono text-[11px] text-zinc-400",
										children: [
											ticket.subtasks_progress.completed,
											"/",
											ticket.subtasks_progress.total,
											" subtasks"
										]
									}),
									ticket.story_points !== null && ticket.story_points !== void 0 && /* @__PURE__ */ jsxs("span", {
										className: "rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-violet-300",
										children: [ticket.story_points, " pts"]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300",
										children: ticket.status_label
									}),
									ticket.assignee ? /* @__PURE__ */ jsx("div", {
										className: "flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-200",
										title: ticket.assignee.name,
										children: ticket.assignee.name.charAt(0)
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-zinc-500",
										children: "Unassigned"
									})
								]
							})]
						}, ticket.id)) : /* @__PURE__ */ jsx("div", {
							className: "py-8 text-center text-xs text-zinc-500",
							children: "No tasks found for this cycle and filter."
						})
					})]
				})
			]
		})]
	});
}
//#endregion
export { CyclesIndex as default };
