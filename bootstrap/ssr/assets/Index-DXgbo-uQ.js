import { t as Authenticated } from "./AuthenticatedLayout-Cj2veziU.js";
import { Head, Link, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { AlertTriangle, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
//#region resources/js/Components/Roadmap/GanttTimeline.tsx
function GanttTimeline({ projects, requests, quarter, year, quarterStart, quarterEnd }) {
	const [selectedProject, setSelectedProject] = useState("all");
	const qStart = useMemo(() => new Date(quarterStart), [quarterStart]);
	const qEnd = useMemo(() => new Date(quarterEnd), [quarterEnd]);
	const totalMs = qEnd.getTime() - qStart.getTime();
	const months = useMemo(() => {
		const startMonth = (quarter - 1) * 3;
		return [
			0,
			1,
			2
		].map((offset) => {
			const date = new Date(year, startMonth + offset, 1);
			return {
				name: date.toLocaleString("default", { month: "long" }),
				short: date.toLocaleString("default", { month: "short" }),
				days: new Date(year, startMonth + offset + 1, 0).getDate()
			};
		});
	}, [quarter, year]);
	const getPosition = (dateStr) => {
		if (!dateStr || totalMs <= 0) return 0;
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return 0;
		const clamped = Math.max(qStart.getTime(), Math.min(qEnd.getTime(), d.getTime()));
		return Math.max(0, Math.min(100, (clamped - qStart.getTime()) / totalMs * 100));
	};
	const todayPos = useMemo(() => {
		if (totalMs <= 0) return null;
		const now = /* @__PURE__ */ new Date();
		if (now < qStart || now > qEnd) return null;
		return (now.getTime() - qStart.getTime()) / totalMs * 100;
	}, [
		qStart,
		qEnd,
		totalMs
	]);
	const filteredRequests = useMemo(() => {
		if (selectedProject === "all") return requests;
		return requests.filter((r) => r.project?.id === selectedProject);
	}, [requests, selectedProject]);
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border border-white/[0.08] bg-[#0c0d12] shadow-2xl overflow-hidden select-none",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-4 bg-[#0e0f16]/60",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-xs font-semibold text-zinc-400",
					children: "Project:"
				}), /* @__PURE__ */ jsxs("select", {
					value: selectedProject,
					onChange: (e) => setSelectedProject(e.target.value === "all" ? "all" : Number(e.target.value)),
					className: "rounded-lg border border-zinc-800 bg-[#07090e] px-2.5 py-1 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none",
					children: [/* @__PURE__ */ jsxs("option", {
						value: "all",
						children: [
							"All Projects (",
							projects.length,
							")"
						]
					}), projects.map((p) => /* @__PURE__ */ jsx("option", {
						value: p.id,
						children: p.name
					}, p.id))]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-4 text-xs text-zinc-400",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-violet-500" }), /* @__PURE__ */ jsx("span", { children: "Task" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500" }), /* @__PURE__ */ jsx("span", { children: "Done" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-rose-500" }), /* @__PURE__ */ jsx("span", { children: "Blocked" })]
					})
				]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ jsxs("div", {
				className: "min-w-[950px]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex border-b border-white/[0.06] bg-[#090a0f] text-xs font-semibold text-zinc-400 sticky top-0 z-10",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-80 shrink-0 border-r border-white/[0.06] p-3 text-zinc-300",
						children: "Project / Task"
					}), /* @__PURE__ */ jsx("div", {
						className: "flex-1 grid grid-cols-3 divide-x divide-white/[0.06]",
						children: months.map((m) => /* @__PURE__ */ jsxs("div", {
							className: "p-3 text-center",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-zinc-200",
								children: m.name
							}), /* @__PURE__ */ jsxs("span", {
								className: "ml-1 text-[11px] text-zinc-500",
								children: [
									"(",
									m.days,
									"d)"
								]
							})]
						}, m.name))
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative divide-y divide-white/[0.04]",
					children: [
						todayPos !== null && /* @__PURE__ */ jsxs("div", {
							className: "absolute top-0 bottom-0 z-20 pointer-events-none",
							style: { left: `calc(320px + (100% - 320px) * ${todayPos / 100})` },
							children: [/* @__PURE__ */ jsx("div", { className: "h-full w-px bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" }), /* @__PURE__ */ jsx("span", {
								className: "absolute -top-2.5 -translate-x-1/2 rounded bg-pink-500 px-1 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider",
								children: "Today"
							})]
						}),
						projects.map((proj) => {
							const left = getPosition(proj.start_date);
							const right = getPosition(proj.due_date);
							const width = Math.max(right - left, 6);
							return /* @__PURE__ */ jsxs("div", {
								className: "flex items-center hover:bg-white/[0.015] transition-colors",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "w-80 shrink-0 border-r border-white/[0.06] p-3 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 min-w-0",
										children: [/* @__PURE__ */ jsx("span", {
											className: "h-2.5 w-2.5 rounded-full shrink-0",
											style: { backgroundColor: proj.color }
										}), /* @__PURE__ */ jsx("span", {
											className: "truncate text-xs font-bold text-white",
											children: proj.name
										})]
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-mono text-[11px] text-zinc-400 shrink-0",
										children: [
											proj.completed_requests,
											"/",
											proj.total_requests,
											" completed"
										]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "flex-1 relative h-10 flex items-center px-2",
									children: /* @__PURE__ */ jsxs("div", {
										className: "absolute h-5 rounded-lg border flex items-center px-2 text-[10px] font-bold text-white shadow-md transition-all overflow-hidden",
										style: {
											left: `${left}%`,
											width: `${width}%`,
											backgroundColor: `${proj.color}25`,
											borderColor: proj.color
										},
										title: `${proj.name}: ${proj.completion_percentage}% complete`,
										children: [/* @__PURE__ */ jsx("div", {
											className: "absolute left-0 top-0 bottom-0 opacity-40",
											style: {
												width: `${proj.completion_percentage}%`,
												backgroundColor: proj.color
											}
										}), /* @__PURE__ */ jsxs("span", {
											className: "relative z-10 truncate font-mono",
											children: [
												proj.name,
												" · ",
												proj.completion_percentage,
												"%"
											]
										})]
									})
								})]
							}, `proj-${proj.id}`);
						}),
						filteredRequests.map((req) => {
							const left = getPosition(req.start_date);
							const right = getPosition(req.due_date);
							const width = Math.max(right - left, 5);
							const isDone = req.status === "done";
							return /* @__PURE__ */ jsxs("div", {
								className: "flex items-center hover:bg-white/[0.02] transition-colors group",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "w-80 shrink-0 border-r border-white/[0.06] p-2.5 pl-6 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 min-w-0",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "font-mono text-[11px] text-zinc-500 group-hover:text-violet-300 shrink-0",
											children: ["#", req.id]
										}), /* @__PURE__ */ jsx(Link, {
											href: route("requests.show", req.id),
											className: `truncate text-xs font-medium hover:underline ${isDone ? "line-through text-zinc-500" : "text-zinc-200 hover:text-white"}`,
											children: req.title
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1 shrink-0",
										children: [req.story_points !== null && /* @__PURE__ */ jsxs("span", {
											className: "rounded border border-violet-500/30 bg-violet-500/10 px-1 py-0.2 font-mono text-[9px] text-violet-300",
											children: [req.story_points, "p"]
										}), req.is_blocked && /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3 text-rose-400" })]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex-1 relative h-9 flex items-center px-2",
									children: [/* @__PURE__ */ jsx(Link, {
										href: route("requests.show", req.id),
										className: `absolute h-4 rounded-md border flex items-center px-1.5 text-[9px] font-medium shadow-sm transition-all group-hover:ring-1 group-hover:ring-white/20 truncate ${isDone ? "border-emerald-600/60 bg-emerald-950/40 text-emerald-200" : req.is_blocked ? "border-rose-500/80 bg-rose-950/40 text-rose-200" : "border-violet-500/60 bg-violet-950/40 text-violet-200"}`,
										style: {
											left: `${left}%`,
											width: `${width}%`
										},
										title: `#${req.id} ${req.title} (${req.status_label})`,
										children: /* @__PURE__ */ jsx("span", {
											className: "truncate",
											children: req.title
										})
									}), req.blocking_ids.length > 0 && /* @__PURE__ */ jsxs("span", {
										className: "absolute text-[8px] font-mono text-amber-400 font-bold",
										style: { left: `${left + width + 1}%` },
										title: `Blocks: ${req.blocking_ids.map((id) => `#${id}`).join(", ")}`,
										children: ["↳ Blocks ", req.blocking_ids.length]
									})]
								})]
							}, `req-${req.id}`);
						})
					]
				})]
			})
		})]
	});
}
//#endregion
//#region resources/js/Pages/Roadmap/Index.tsx
function RoadmapIndex({ projects, requests, year, quarter, quarter_start, quarter_end }) {
	const handlePrevQuarter = () => {
		let prevQ = quarter - 1;
		let prevY = year;
		if (prevQ < 1) {
			prevQ = 4;
			prevY -= 1;
		}
		router.visit(route("roadmap.index", {
			year: prevY,
			quarter: prevQ
		}));
	};
	const handleNextQuarter = () => {
		let nextQ = quarter + 1;
		let nextY = year;
		if (nextQ > 4) {
			nextQ = 1;
			nextY += 1;
		}
		router.visit(route("roadmap.index", {
			year: nextY,
			quarter: nextQ
		}));
	};
	const totalRequests = requests.length;
	const completedRequests = requests.filter((r) => r.status === "done").length;
	const blockedRequests = requests.filter((r) => r.is_blocked).length;
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400",
					children: /* @__PURE__ */ jsx(CalendarRange, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-base font-bold text-white tracking-tight",
						children: "Roadmap & Timeline"
					}), /* @__PURE__ */ jsxs("span", {
						className: "rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300",
						children: [
							"Q",
							quarter,
							" ",
							year
						]
					})]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-zinc-400",
					children: "Quarterly timeline of projects, tasks, and dependencies"
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: handlePrevQuarter,
						className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#0d0e12] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors",
						title: "Previous Quarter",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#0d0e12] p-1 text-xs",
						children: [
							1,
							2,
							3,
							4
						].map((q) => /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => router.visit(route("roadmap.index", {
								year,
								quarter: q
							})),
							className: `rounded-lg border px-2.5 py-1 font-semibold transition-all ${quarter === q ? "border-zinc-700 bg-zinc-800 text-white shadow-sm" : "border-transparent text-zinc-400 hover:text-zinc-200"}`,
							children: ["Q", q]
						}, q))
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: handleNextQuarter,
						className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#0d0e12] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors",
						title: "Next Quarter",
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
					})
				]
			})]
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: `Roadmap · Q${quarter} ${year}` }), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1600px] space-y-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
								children: "Projects"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-1 font-mono text-2xl font-bold text-white",
								children: projects.length
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[11px] text-zinc-500",
								children: "Active projects"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
								children: "Scheduled Tasks"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-1 font-mono text-2xl font-bold text-white",
								children: totalRequests
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[11px] text-zinc-500",
								children: "Tasks scheduled this quarter"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
								children: "Completed"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-1 font-mono text-2xl font-bold text-emerald-400",
								children: completedRequests
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-[11px] text-zinc-500",
								children: [totalRequests > 0 ? Math.round(completedRequests / totalRequests * 100) : 0, "% completed this quarter"]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
								children: "Blocked Tasks"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-1 font-mono text-2xl font-bold text-rose-400",
								children: blockedRequests
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[11px] text-zinc-500",
								children: "Tasks currently blocked"
							})
						]
					})
				]
			}), /* @__PURE__ */ jsx(GanttTimeline, {
				projects,
				requests,
				quarter,
				year,
				quarterStart: quarter_start,
				quarterEnd: quarter_end
			})]
		})]
	});
}
//#endregion
export { RoadmapIndex as default };
