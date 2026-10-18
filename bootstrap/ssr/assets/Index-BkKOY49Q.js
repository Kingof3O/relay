import { E as Modal, _ as notifySuccess, g as notifyError, t as Authenticated } from "./AuthenticatedLayout-C9_Pb_Sd.js";
import { t as TeamManagementCard } from "./TeamManagementCard-DhJIhOln.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, Archive, ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Check, CheckCircle2, Clock, Cpu, Edit2, FolderKanban, KeyRound, Layers, LayoutGrid, List, Lock, Mail, Plus, RotateCcw, Search, Shield, ShieldCheck, Sparkles, User, Users, X } from "lucide-react";
import axios, { isAxiosError } from "axios";
//#region resources/js/Features/Settings/components/ProjectsManagementCard.tsx
var COLOR_SWATCHES = [
	{
		name: "Violet",
		hex: "#8B5CF6"
	},
	{
		name: "Cyan",
		hex: "#06B6D4"
	},
	{
		name: "Emerald",
		hex: "#10B981"
	},
	{
		name: "Amber",
		hex: "#F59E0B"
	},
	{
		name: "Pink",
		hex: "#EC4899"
	},
	{
		name: "Blue",
		hex: "#3B82F6"
	},
	{
		name: "Indigo",
		hex: "#6366F1"
	},
	{
		name: "Rose",
		hex: "#F43F5E"
	}
];
function ProjectsManagementCard({ projects, setProjects, canManageAreas }) {
	const [newProject, setNewProject] = useState("");
	const [newProjectColor, setNewProjectColor] = useState("#8B5CF6");
	const [projectError, setProjectError] = useState("");
	const [adding, setAdding] = useState(false);
	const [editingProjectId, setEditingProjectId] = useState(null);
	const [editingName, setEditingName] = useState("");
	const [colorPickerProjectId, setColorPickerProjectId] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterState, setFilterState] = useState("all");
	const [viewMode, setViewMode] = useState("grid");
	const addProject = async () => {
		if (!newProject.trim() || adding) return;
		setAdding(true);
		try {
			const created = (await axios.post(route("settings.projects.store"), {
				name: newProject.trim(),
				color: newProjectColor
			})).data.project;
			setProjects((current) => [...current, {
				...created,
				active_count: 0
			}]);
			setNewProject("");
			setProjectError("");
		} catch (exception) {
			setProjectError(isAxiosError(exception) ? exception.response?.data?.message ?? "Could not add the project." : "Could not add the project.");
		} finally {
			setAdding(false);
		}
	};
	const startInlineRename = (project) => {
		setEditingProjectId(project.id);
		setEditingName(project.name);
	};
	const saveInlineRename = async (projectId) => {
		if (!editingName.trim()) {
			setEditingProjectId(null);
			return;
		}
		try {
			const updated = (await axios.patch(route("settings.projects.update", projectId), { name: editingName.trim() })).data.project;
			setProjects((current) => current.map((item) => item.id === projectId ? {
				...item,
				...updated
			} : item));
			setEditingProjectId(null);
			setProjectError("");
		} catch (exception) {
			setProjectError(isAxiosError(exception) ? exception.response?.data?.message ?? "Could not rename the project." : "Could not rename the project.");
		}
	};
	const updateProjectColor = async (project, color) => {
		try {
			const updated = (await axios.patch(route("settings.projects.update", project.id), { color })).data.project;
			setProjects((current) => current.map((item) => item.id === project.id ? {
				...item,
				...updated,
				color
			} : item));
			setColorPickerProjectId(null);
			setProjectError("");
		} catch (exception) {
			setProjectError(isAxiosError(exception) ? exception.response?.data?.message ?? "Could not update project color." : "Could not update project color.");
		}
	};
	const archiveProject = async (project) => {
		if (!window.confirm(`Archive "${project.name}"? Active requests will remain preserved.`)) return;
		try {
			await axios.delete(route("settings.projects.destroy", project.id));
			setProjects((current) => current.map((item) => item.id === project.id ? {
				...item,
				archived_at: (/* @__PURE__ */ new Date()).toISOString()
			} : item));
			setProjectError("");
		} catch (exception) {
			setProjectError(isAxiosError(exception) ? exception.response?.data?.message ?? "Could not archive the project." : "Could not archive the project.");
		}
	};
	const restoreProject = async (project) => {
		try {
			const updated = (await axios.patch(route("settings.projects.update", project.id), { archived: false })).data.project;
			setProjects((current) => current.map((item) => item.id === project.id ? {
				...item,
				...updated,
				archived_at: null
			} : item));
			setProjectError("");
		} catch (exception) {
			setProjectError(isAxiosError(exception) ? exception.response?.data?.message ?? "Could not restore the project." : "Could not restore the project.");
		}
	};
	const moveProject = async (index, direction) => {
		const next = [...projects];
		const target = index + direction;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		setProjects(next);
		try {
			await axios.post(route("settings.projects.reorder"), { order: next.map((project) => project.id) });
		} catch (exception) {
			setProjectError(isAxiosError(exception) ? exception.response?.data?.message ?? "Could not reorder projects." : "Could not reorder projects.");
		}
	};
	const activeCount = projects.filter((p) => !p.archived_at).length;
	const archivedCount = projects.filter((p) => Boolean(p.archived_at)).length;
	const filteredProjects = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		return projects.filter((project) => {
			if (!(!query || project.name.toLowerCase().includes(query) || project.slug && project.slug.toLowerCase().includes(query))) return false;
			if (filterState === "active") return !project.archived_at;
			if (filterState === "archived") return Boolean(project.archived_at);
			return true;
		});
	}, [
		projects,
		searchQuery,
		filterState
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-zinc-800 bg-[#111216] p-6 sm:p-7 shadow-sm",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-800/80 pb-5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-violet-400",
						children: /* @__PURE__ */ jsx(FolderKanban, { className: "h-5 w-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2.5",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "text-base font-semibold text-zinc-100",
								children: "Projects & Initiatives"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-violet-300",
								children: [activeCount, " Active"]
							}),
							archivedCount > 0 && /* @__PURE__ */ jsxs("span", {
								className: "rounded-full border border-zinc-800 bg-[#0c0d12] px-2 py-0.5 font-mono text-[10px] text-zinc-400",
								children: [archivedCount, " Archived"]
							})
						]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-0.5 text-xs text-zinc-400",
						children: "Organize requests into dedicated initiative boards with color swatches, active telemetry, and ordering."
					})] })]
				}), canManageAreas && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#0c0d12] px-2 py-1.5",
							children: COLOR_SWATCHES.slice(0, 5).map((swatch) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setNewProjectColor(swatch.hex),
								title: swatch.name,
								className: `h-4 w-4 rounded-full transition-transform ${newProjectColor === swatch.hex ? "scale-125 ring-2 ring-white shadow-sm" : "opacity-70 hover:opacity-100 hover:scale-110"}`,
								style: { backgroundColor: swatch.hex }
							}, swatch.hex))
						}),
						/* @__PURE__ */ jsx("input", {
							value: newProject,
							onChange: (e) => setNewProject(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addProject();
								}
							},
							placeholder: "New initiative name…",
							className: "w-48 sm:w-60 rounded-xl border border-zinc-800 bg-[#0c0d12] px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: addProject,
							disabled: adding || !newProject.trim(),
							className: "flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50",
							children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", { children: adding ? "Adding…" : "Add Initiative" })]
						})
					]
				})]
			}),
			projectError && /* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex items-center justify-between gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ jsx("span", { children: projectError })]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setProjectError(""),
					className: "text-rose-400 hover:text-white",
					children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex flex-1 items-center gap-2 max-w-md",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full",
						children: [
							/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }),
							/* @__PURE__ */ jsx("input", {
								type: "text",
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value),
								placeholder: "Filter initiatives by name or slug…",
								className: "w-full rounded-xl border border-zinc-800 bg-[#0c0d12] pl-9 pr-9 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
							}),
							searchQuery && /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setSearchQuery(""),
								className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white",
								children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
							})
						]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between sm:justify-end gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setFilterState("all"),
								className: `rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${filterState === "all" ? "border border-zinc-700 bg-zinc-800 text-white" : "border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:text-zinc-200"}`,
								children: [
									"All (",
									projects.length,
									")"
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setFilterState("active"),
								className: `rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${filterState === "active" ? "border border-violet-500/40 bg-violet-500/15 text-violet-300" : "border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:text-zinc-200"}`,
								children: [
									"Active (",
									activeCount,
									")"
								]
							}),
							archivedCount > 0 && /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setFilterState("archived"),
								className: `rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${filterState === "archived" ? "border border-rose-500/40 bg-rose-500/15 text-rose-300" : "border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:text-zinc-200"}`,
								children: [
									"Archived (",
									archivedCount,
									")"
								]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center rounded-lg border border-zinc-800 bg-[#0c0d12] p-0.5",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setViewMode("grid"),
							className: `flex h-7 w-7 items-center justify-center rounded-md transition-colors ${viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
							title: "Grid View (High-Density Multi-Column)",
							children: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setViewMode("table"),
							className: `flex h-7 w-7 items-center justify-center rounded-md transition-colors ${viewMode === "table" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
							title: "Table View (Compact Rows)",
							children: /* @__PURE__ */ jsx(List, { className: "h-3.5 w-3.5" })
						})]
					})]
				})]
			}),
			filteredProjects.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#0c0d12] py-16 text-center",
				children: [
					/* @__PURE__ */ jsx(FolderKanban, { className: "h-8 w-8 text-zinc-600 mb-2" }),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-semibold text-zinc-300",
						children: "No initiatives match your filter."
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-[11px] text-zinc-500 mt-1",
						children: "Try adjusting your search query or status filter."
					}),
					(searchQuery || filterState !== "all") && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							setSearchQuery("");
							setFilterState("all");
						},
						className: "mt-3 rounded-lg border border-zinc-750 bg-zinc-850 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors",
						children: "Reset Filters"
					})
				]
			}) : viewMode === "grid" ? /* @__PURE__ */ jsx("div", {
				className: "mt-5 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4",
				children: filteredProjects.map((project) => {
					const originalIndex = projects.findIndex((p) => p.id === project.id);
					const isEditing = editingProjectId === project.id;
					const isPickingColor = colorPickerProjectId === project.id;
					const projectColor = project.color || "#8B5CF6";
					return /* @__PURE__ */ jsxs("div", {
						className: `group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-150 ${project.archived_at ? "border-zinc-850 bg-[#090a0f]/60 opacity-60 hover:opacity-100 hover:border-zinc-800" : "border-zinc-800 bg-[#0c0d12] hover:border-zinc-700 hover:bg-[#0f1017]"}`,
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2.5 min-w-0",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => canManageAreas && setColorPickerProjectId(isPickingColor ? null : project.id),
										title: canManageAreas ? "Click to change initiative color" : void 0,
										className: `relative h-5 w-5 rounded-md shadow-sm transition-transform ring-1 ring-white/10 ${canManageAreas ? "hover:scale-110 cursor-pointer" : ""}`,
										style: { backgroundColor: projectColor }
									}), isPickingColor && canManageAreas && /* @__PURE__ */ jsx("div", {
										className: "absolute left-0 top-7 z-20 flex gap-1.5 rounded-xl border border-zinc-700 bg-[#14151b] p-2 shadow-2xl backdrop-blur-xl",
										children: COLOR_SWATCHES.map((swatch) => /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => updateProjectColor(project, swatch.hex),
											title: swatch.name,
											className: `h-4 w-4 rounded-full transition-transform ${projectColor === swatch.hex ? "scale-125 ring-2 ring-white" : "opacity-70 hover:opacity-100 hover:scale-110"}`,
											style: { backgroundColor: swatch.hex }
										}, swatch.hex))
									})]
								}), /* @__PURE__ */ jsxs("span", {
									className: "font-mono text-[11px] font-semibold text-zinc-500",
									children: ["#", originalIndex + 1]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold",
									style: {
										borderColor: `${projectColor}40`,
										backgroundColor: `${projectColor}15`,
										color: projectColor
									},
									children: [/* @__PURE__ */ jsx(Activity, { className: "h-3 w-3" }), /* @__PURE__ */ jsxs("span", { children: [project.active_count ?? 0, " active"] })]
								}), project.archived_at && /* @__PURE__ */ jsx("span", {
									className: "rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-400",
									children: "Archived"
								})]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-3.5",
							children: isEditing ? /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ jsx("input", {
										type: "text",
										value: editingName,
										onChange: (e) => setEditingName(e.target.value),
										onKeyDown: (e) => {
											if (e.key === "Enter") saveInlineRename(project.id);
											if (e.key === "Escape") setEditingProjectId(null);
										},
										autoFocus: true,
										className: "w-full rounded-lg border border-violet-500 bg-[#090a0f] px-2.5 py-1 text-xs text-white focus:outline-none"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => saveInlineRename(project.id),
										className: "flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
										title: "Save",
										children: /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setEditingProjectId(null),
										className: "flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30",
										title: "Cancel",
										children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
									})
								]
							}) : /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-semibold text-zinc-100 truncate group-hover:text-white",
								children: project.name
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 font-mono text-[11px] text-zinc-500 truncate",
								children: project.slug ? `/${project.slug}` : "No slug configured"
							})] })
						})] }), canManageAreas && /* @__PURE__ */ jsxs("div", {
							className: "mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: originalIndex === 0,
									onClick: () => moveProject(originalIndex, -1),
									className: "flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors",
									title: "Move Up",
									children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-3 w-3" })
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: originalIndex === projects.length - 1,
									onClick: () => moveProject(originalIndex, 1),
									className: "flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors",
									title: "Move Down",
									children: /* @__PURE__ */ jsx(ArrowDown, { className: "h-3 w-3" })
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => startInlineRename(project),
									className: "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-violet-300 hover:bg-violet-500/10 transition-colors",
									children: [/* @__PURE__ */ jsx(Edit2, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Rename" })]
								}), project.archived_at ? /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => restoreProject(project),
									className: "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors",
									children: [/* @__PURE__ */ jsx(RotateCcw, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Restore" })]
								}) : /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => archiveProject(project),
									className: "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/10 transition-colors",
									children: [/* @__PURE__ */ jsx(Archive, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Archive" })]
								})]
							})]
						})]
					}, project.id);
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0d12]",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "border-b border-zinc-800 bg-zinc-900/40 text-[10px] font-semibold uppercase tracking-wider text-zinc-400",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-4 py-3 w-16",
								children: "#"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-4 py-3",
								children: "Initiative"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-4 py-3 hidden sm:table-cell",
								children: "Slug"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-4 py-3",
								children: "Telemetry"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-4 py-3 hidden md:table-cell",
								children: "Status"
							}),
							canManageAreas && /* @__PURE__ */ jsx("th", {
								className: "px-4 py-3 text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-zinc-800/60",
						children: filteredProjects.map((project) => {
							const originalIndex = projects.findIndex((p) => p.id === project.id);
							const isEditing = editingProjectId === project.id;
							const isPickingColor = colorPickerProjectId === project.id;
							const projectColor = project.color || "#8B5CF6";
							return /* @__PURE__ */ jsxs("tr", {
								className: `transition-colors ${project.archived_at ? "bg-[#090a0f]/40 opacity-60 hover:opacity-90" : "hover:bg-zinc-850/40"}`,
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "px-4 py-3 font-mono text-[11px] text-zinc-500",
										children: ["#", originalIndex + 1]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "relative shrink-0",
												children: [/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => canManageAreas && setColorPickerProjectId(isPickingColor ? null : project.id),
													className: "h-4 w-4 rounded-md shadow-sm transition-transform hover:scale-110",
													style: { backgroundColor: projectColor },
													title: "Click to change color"
												}), isPickingColor && canManageAreas && /* @__PURE__ */ jsx("div", {
													className: "absolute left-0 top-6 z-20 flex gap-1.5 rounded-xl border border-zinc-700 bg-[#14151b] p-2 shadow-2xl backdrop-blur-xl",
													children: COLOR_SWATCHES.map((swatch) => /* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => updateProjectColor(project, swatch.hex),
														title: swatch.name,
														className: "h-4 w-4 rounded-full transition-transform hover:scale-110",
														style: { backgroundColor: swatch.hex }
													}, swatch.hex))
												})]
											}), isEditing ? /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-1.5",
												children: [
													/* @__PURE__ */ jsx("input", {
														type: "text",
														value: editingName,
														onChange: (e) => setEditingName(e.target.value),
														onKeyDown: (e) => {
															if (e.key === "Enter") saveInlineRename(project.id);
															if (e.key === "Escape") setEditingProjectId(null);
														},
														autoFocus: true,
														className: "rounded-lg border border-violet-500 bg-[#090a0f] px-2 py-0.5 text-xs text-white focus:outline-none"
													}),
													/* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => saveInlineRename(project.id),
														className: "text-emerald-400 hover:text-emerald-300",
														children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" })
													}),
													/* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => setEditingProjectId(null),
														className: "text-rose-400 hover:text-rose-300",
														children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
													})
												]
											}) : /* @__PURE__ */ jsx("span", {
												className: "font-semibold text-zinc-100",
												children: project.name
											})]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-4 py-3 font-mono text-[11px] text-zinc-500 hidden sm:table-cell",
										children: project.slug ? `/${project.slug}` : "—"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ jsxs("span", {
											className: "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold",
											style: {
												borderColor: `${projectColor}40`,
												backgroundColor: `${projectColor}15`,
												color: projectColor
											},
											children: [/* @__PURE__ */ jsx(Activity, { className: "h-2.5 w-2.5" }), /* @__PURE__ */ jsxs("span", { children: [project.active_count ?? 0, " active"] })]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-4 py-3 hidden md:table-cell",
										children: project.archived_at ? /* @__PURE__ */ jsx("span", {
											className: "rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-400",
											children: "Archived"
										}) : /* @__PURE__ */ jsx("span", {
											className: "rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400",
											children: "Active"
										})
									}),
									canManageAreas && /* @__PURE__ */ jsx("td", {
										className: "px-4 py-3 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-end gap-1.5",
											children: [
												/* @__PURE__ */ jsx("button", {
													type: "button",
													disabled: originalIndex === 0,
													onClick: () => moveProject(originalIndex, -1),
													className: "flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors",
													title: "Move Up",
													children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-3 w-3" })
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													disabled: originalIndex === projects.length - 1,
													onClick: () => moveProject(originalIndex, 1),
													className: "flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors",
													title: "Move Down",
													children: /* @__PURE__ */ jsx(ArrowDown, { className: "h-3 w-3" })
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => startInlineRename(project),
													className: "rounded-md border border-zinc-800 bg-[#111216] px-2 py-1 text-[11px] font-medium text-violet-300 hover:border-violet-500/40 hover:bg-violet-500/10 transition-colors",
													children: "Rename"
												}),
												project.archived_at ? /* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => restoreProject(project),
													className: "rounded-md border border-zinc-800 bg-[#111216] px-2 py-1 text-[11px] font-medium text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors",
													children: "Restore"
												}) : /* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => archiveProject(project),
													className: "rounded-md border border-zinc-800 bg-[#111216] px-2 py-1 text-[11px] font-medium text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors",
													children: "Archive"
												})
											]
										})
									})
								]
							}, project.id);
						})
					})]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Settings/components/MemberFormModal.tsx
function MemberFormModal({ show, onClose, roles, editingMember, onSaved }) {
	const [member, setMember] = useState({
		name: "",
		username: "",
		email: "",
		password: "",
		role_id: roles[0]?.id ? String(roles[0].id) : ""
	});
	const [teamError, setTeamError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	useEffect(() => {
		if (editingMember) setMember({
			name: editingMember.name,
			username: editingMember.username,
			email: editingMember.email ?? "",
			password: "",
			role_id: editingMember.role_id ? String(editingMember.role_id) : roles[0]?.id ? String(roles[0].id) : ""
		});
		else setMember({
			name: "",
			username: "",
			email: "",
			password: "",
			role_id: roles[0]?.id ? String(roles[0].id) : ""
		});
		setTeamError("");
	}, [
		editingMember,
		show,
		roles
	]);
	const submitMember = async (event) => {
		event.preventDefault();
		setTeamError("");
		setSubmitting(true);
		try {
			const payload = {
				...member,
				role_id: Number(member.role_id),
				...member.password ? {} : { password: void 0 }
			};
			const savedUser = (editingMember ? await axios.patch(route("settings.team.update", editingMember.id), payload) : await axios.post(route("settings.team.store"), payload)).data.user;
			notifySuccess(editingMember ? "Member updated" : "Member created", `${savedUser.name} (@${savedUser.username}) access configured.`);
			onSaved(savedUser, !!editingMember);
			onClose();
		} catch (exception) {
			const data = isAxiosError(exception) ? exception.response?.data : null;
			const errors = data?.errors;
			const errorMsg = errors ? Object.values(errors).flat().join(" ") : data?.message ?? "Could not save this account.";
			setTeamError(errorMsg);
			notifyError("Failed to save member", errorMsg);
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsx(Modal, {
		show,
		onClose,
		maxWidth: "lg",
		children: /* @__PURE__ */ jsxs("div", {
			className: "p-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-white/[0.08] pb-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-specular",
							children: editingMember ? /* @__PURE__ */ jsx(KeyRound, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-bold text-white tracking-tight",
							children: editingMember ? `Edit ${editingMember.name}` : "New Member Credentials"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 text-xs text-zinc-400",
							children: editingMember ? "Leave password empty to keep existing login credentials intact." : "Assign a role and configure initial credentials."
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400",
							children: [/* @__PURE__ */ jsx("kbd", { children: "Esc" }), " to close"]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white",
							"aria-label": "Close modal",
							children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
						})]
					})]
				}),
				teamError && /* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 backdrop-blur-sm",
					children: [/* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-rose-400" }), /* @__PURE__ */ jsx("div", {
						className: "flex-1 font-medium leading-relaxed",
						children: teamError
					})]
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: submitMember,
					className: "mt-5 space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "grid gap-3.5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400",
									children: [
										/* @__PURE__ */ jsx(User, { className: "h-3 w-3 text-zinc-500" }),
										/* @__PURE__ */ jsx("span", { children: "Full Name" }),
										/* @__PURE__ */ jsx("span", {
											className: "text-rose-400",
											children: "*"
										})
									]
								}), /* @__PURE__ */ jsx("input", {
									required: true,
									placeholder: "Full Name",
									value: member.name,
									onChange: (event) => setMember({
										...member,
										name: event.target.value
									}),
									className: "mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "text-zinc-500 font-mono",
											children: "@"
										}),
										/* @__PURE__ */ jsx("span", { children: "Username" }),
										/* @__PURE__ */ jsx("span", {
											className: "text-rose-400",
											children: "*"
										})
									]
								}), /* @__PURE__ */ jsx("input", {
									required: true,
									placeholder: "Username (e.g. jdoe)",
									value: member.username,
									onChange: (event) => setMember({
										...member,
										username: event.target.value
									}),
									className: "mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all font-mono"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400",
									children: [/* @__PURE__ */ jsx(Mail, { className: "h-3 w-3 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Email Address" })]
								}), /* @__PURE__ */ jsx("input", {
									type: "email",
									placeholder: "Email Address (optional)",
									value: member.email,
									onChange: (event) => setMember({
										...member,
										email: event.target.value
									}),
									className: "mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400",
									children: [
										/* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-zinc-500" }),
										/* @__PURE__ */ jsxs("span", { children: ["Password ", editingMember ? "(Optional)" : ""] }),
										!editingMember && /* @__PURE__ */ jsx("span", {
											className: "text-rose-400",
											children: "*"
										})
									]
								}), /* @__PURE__ */ jsx("input", {
									minLength: 8,
									required: !editingMember,
									type: "password",
									placeholder: editingMember ? "New password (optional)" : "Initial password",
									value: member.password,
									onChange: (event) => setMember({
										...member,
										password: event.target.value
									}),
									className: "mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all"
								})] })
							]
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
							className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
							children: ["Access Role ", /* @__PURE__ */ jsx("span", {
								className: "text-rose-400",
								children: "*"
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3",
							children: roles.map((role) => {
								const isSelected = member.role_id === String(role.id);
								return /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setMember({
										...member,
										role_id: String(role.id)
									}),
									className: `group relative flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${isSelected ? "border-cyan-500/40 bg-cyan-500/10 text-white shadow-specular ring-1 ring-cyan-500/20" : "border-white/[0.08] bg-[#07090e]/60 text-zinc-400 hover:border-white/[0.15] hover:bg-white/[0.03] hover:text-zinc-200"}`,
									children: [/* @__PURE__ */ jsx("span", {
										className: `text-xs font-semibold ${isSelected ? "text-cyan-300" : "text-zinc-300"}`,
										children: role.name
									}), /* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full transition-all ${isSelected ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-zinc-700 group-hover:bg-zinc-600"}` })]
								}, role.id);
							})
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: onClose,
								className: "rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors",
								children: "Cancel"
							}), /* @__PURE__ */ jsx("button", {
								disabled: submitting,
								type: "submit",
								className: "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(6,182,212,0.35)] shadow-specular hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all",
								children: submitting ? "Saving..." : editingMember ? "Save Changes" : "Create Account"
							})]
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Features/Settings/components/WorkspaceSnapshotCard.tsx
function WorkspaceSnapshotCard({ activeProjectsCount, teamAccountsCount, projects = [], users = [], audits = [], onSelectTab }) {
	const totalActiveRequests = projects.reduce((sum, p) => sum + (p.active_count ?? 0), 0);
	const archivedProjectsCount = projects.filter((p) => Boolean(p.archived_at)).length;
	const activeUsersCount = users.filter((u) => u.active !== false).length;
	const inactiveUsersCount = users.filter((u) => u.active === false).length;
	const adminsCount = users.filter((u) => {
		const name = (u.role?.name ?? "").toLowerCase();
		return name.includes("owner") || name.includes("admin");
	}).length;
	const devsCount = users.filter((u) => {
		const name = (u.role?.name ?? "").toLowerCase();
		return name.includes("dev") || name.includes("engineer");
	}).length;
	const designersCount = users.filter((u) => {
		const name = (u.role?.name ?? "").toLowerCase();
		return name.includes("design") || name.includes("ui") || name.includes("ux");
	}).length;
	const stakeholdersCount = users.filter((u) => {
		const name = (u.role?.name ?? "").toLowerCase();
		return !name.includes("owner") && !name.includes("admin") && !name.includes("dev") && !name.includes("engineer") && !name.includes("design") && !name.includes("ui") && !name.includes("ux");
	}).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						onClick: () => onSelectTab?.("projects"),
						className: "group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c] cursor-pointer",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-violet-400",
									children: /* @__PURE__ */ jsx(FolderKanban, { className: "h-4 w-4" })
								}), onSelectTab && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300",
									children: ["Manage ", /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 transition-transform group-hover:translate-x-0.5" })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-medium text-zinc-400",
										children: "Active initiatives"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums",
										children: activeProjectsCount
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-[11px] text-zinc-500",
										children: archivedProjectsCount > 0 ? `${archivedProjectsCount} archived boards preserved` : "All project boards active"
									})
								]
							}),
							projects.length > 0 && /* @__PURE__ */ jsxs("div", {
								className: "mt-3 flex items-center gap-1.5 overflow-hidden pt-2 border-t border-zinc-800/60",
								children: [projects.slice(0, 6).map((p) => /* @__PURE__ */ jsx("span", {
									title: p.name,
									className: "h-2 w-2 rounded-full ring-1 ring-white/10",
									style: { backgroundColor: p.color || "#8B5CF6" }
								}, p.id)), projects.length > 6 && /* @__PURE__ */ jsxs("span", {
									className: "font-mono text-[10px] text-zinc-500",
									children: ["+", projects.length - 6]
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						onClick: () => onSelectTab?.("team"),
						className: "group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c] cursor-pointer",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-cyan-400",
									children: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" })
								}), onSelectTab && /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300",
									children: ["Team Roster ", /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 transition-transform group-hover:translate-x-0.5" })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-medium text-zinc-400",
										children: "Team roster"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums",
										children: teamAccountsCount || "—"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1 text-[11px] text-zinc-500",
										children: [
											activeUsersCount,
											" active · ",
											inactiveUsersCount,
											" paused"
										]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-3 flex items-center gap-1.5 text-[10px] font-medium pt-2 border-t border-zinc-800/60",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300 font-mono",
										children: [adminsCount, " Admin"]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "rounded bg-cyan-500/15 px-1.5 py-0.5 text-cyan-300 font-mono",
										children: [devsCount, " Dev"]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300 font-mono",
										children: [designersCount, " Design"]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c]",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-emerald-400",
									children: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" })
								}), /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1 text-[11px] font-medium text-emerald-400",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }), " Live Telemetry"]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-medium text-zinc-400",
										children: "Active workload"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums",
										children: totalActiveRequests
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-[11px] text-zinc-500",
										children: activeProjectsCount > 0 ? `~${(totalActiveRequests / Math.max(1, activeProjectsCount)).toFixed(1)} requests / initiative` : "No open requests"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/60",
								children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400" }), /* @__PURE__ */ jsx("span", { children: "All priority queues operational" })]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c]",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-amber-400",
									children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" })
								}), /* @__PURE__ */ jsx("span", {
									className: "rounded border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300",
									children: "RBAC Active"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-medium text-zinc-400",
										children: "Studio engine"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums",
										children: "Relay v2.4"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-[11px] text-zinc-500",
										children: "Dual S3 / WebP Transcoder"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/60",
								children: [/* @__PURE__ */ jsx(Cpu, { className: "h-3 w-3 text-cyan-400" }), /* @__PURE__ */ jsx("span", { children: "Transactional Email Engine Active" })]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm sm:p-7",
				children: [
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" }),
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-cyan-600/10 blur-3xl" }),
					/* @__PURE__ */ jsxs("div", {
						className: "relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "max-w-2xl space-y-3",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-300",
									children: [
										/* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-zinc-400" }),
										/* @__PURE__ */ jsx("span", { children: "Workspace Operations & Intelligence" }),
										/* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-zinc-500" }),
										/* @__PURE__ */ jsxs("span", {
											className: "text-zinc-400",
											children: [projects.length, " Total Initiatives"]
										})
									]
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "text-2xl font-bold tracking-tight text-white sm:text-3xl",
									children: "Projects, People, and Delivery Telemetry."
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs leading-relaxed text-zinc-400 sm:text-sm",
									children: "Expansive operational command for Relay Studio. Monitor project scopes, member access privileges, active throughput, and system deployment status in real time."
								})
							]
						}), onSelectTab && /* @__PURE__ */ jsxs("div", {
							className: "flex shrink-0 flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => onSelectTab("projects"),
								className: "group flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-850 px-4 py-2.5 text-xs font-medium text-zinc-200 shadow-sm transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white active:scale-[0.98]",
								children: [
									/* @__PURE__ */ jsx(FolderKanban, { className: "h-4 w-4 text-violet-400 transition-transform group-hover:scale-110" }),
									/* @__PURE__ */ jsx("span", { children: "Manage Projects" }),
									/* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })
								]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => onSelectTab("team"),
								className: "group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:bg-zinc-200 active:scale-[0.98]",
								children: [
									/* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-zinc-950 transition-transform group-hover:scale-110" }),
									/* @__PURE__ */ jsx("span", { children: "Team Roster" }),
									/* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })
								]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-violet-400",
								children: /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-semibold text-zinc-100",
								children: "Initiative Distribution & Workload"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-zinc-400",
								children: "Real-time request capacity across active project workspaces."
							})] })]
						}), /* @__PURE__ */ jsxs("span", {
							className: "font-mono text-xs text-zinc-400",
							children: [projects.length, " Total"]
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-4 divide-y divide-zinc-800/60",
						children: projects.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "py-6 text-center text-xs text-zinc-500",
							children: "No projects configured."
						}) : projects.slice(0, 6).map((project) => {
							const activeCount = project.active_count ?? 0;
							const workloadPercent = totalActiveRequests > 0 ? Math.round(activeCount / totalActiveRequests * 100) : 0;
							return /* @__PURE__ */ jsxs("div", {
								className: "py-3 text-xs first:pt-1 last:pb-1",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2.5 min-w-0",
										children: [
											/* @__PURE__ */ jsx("div", {
												className: "h-3 w-3 rounded-full shrink-0 shadow-sm",
												style: { backgroundColor: project.color || "#8B5CF6" }
											}),
											/* @__PURE__ */ jsx("span", {
												className: "font-medium text-zinc-200 truncate",
												children: project.name
											}),
											project.slug && /* @__PURE__ */ jsxs("span", {
												className: "font-mono text-[11px] text-zinc-500 hidden sm:inline",
												children: ["/", project.slug]
											})
										]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 shrink-0",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "rounded border border-zinc-800 bg-[#0c0d12] px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-300",
											children: [activeCount, " active"]
										}), project.archived_at && /* @__PURE__ */ jsx("span", {
											className: "rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-400",
											children: "Archived"
										})]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("div", {
										className: "h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800",
										children: /* @__PURE__ */ jsx("div", {
											className: "h-full rounded-full transition-all duration-300",
											style: {
												width: `${Math.max(4, workloadPercent)}%`,
												backgroundColor: project.color || "#8B5CF6"
											}
										})
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-mono text-[10px] text-zinc-500 shrink-0 w-8 text-right",
										children: [workloadPercent, "%"]
									})]
								})]
							}, project.id);
						})
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-cyan-400",
								children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-semibold text-zinc-100",
								children: "Access & Permissions Matrix"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-zinc-400",
								children: "Role-Based Access Control (RBAC) privilege policies."
							})] })]
						}), /* @__PURE__ */ jsx("span", {
							className: "font-mono text-xs text-emerald-400",
							children: "Enforced"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-4 space-y-3 text-xs",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5 min-w-0",
									children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-violet-400 shrink-0" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-zinc-200",
											children: "Admins & Owners"
										}), /* @__PURE__ */ jsxs("span", {
											className: "rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] text-violet-300",
											children: [adminsCount, " Assigned"]
										})]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 text-[11px] text-zinc-400 truncate",
										children: "Full studio control, team rosters, and initiative creation."
									})] })]
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5 min-w-0",
									children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-cyan-400 shrink-0" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-zinc-200",
											children: "Developers"
										}), /* @__PURE__ */ jsxs("span", {
											className: "rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300",
											children: [devsCount, " Assigned"]
										})]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 text-[11px] text-zinc-400 truncate",
										children: "Code delivery, queue triage, status transitions & attachments."
									})] })]
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5 min-w-0",
									children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 shrink-0" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-zinc-200",
											children: "Designers"
										}), /* @__PURE__ */ jsxs("span", {
											className: "rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300",
											children: [designersCount, " Assigned"]
										})]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 text-[11px] text-zinc-400 truncate",
										children: "UI/UX feedback, design reviews, asset uploads & visual approvals."
									})] })]
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5 min-w-0",
									children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-amber-400 shrink-0" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-zinc-200",
											children: "Stakeholders"
										}), /* @__PURE__ */ jsxs("span", {
											className: "rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] text-amber-300",
											children: [stakeholdersCount, " Assigned"]
										})]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 text-[11px] text-zinc-400 truncate",
										children: "Request submission, status viewing, commenting & progress monitoring."
									})] })]
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-amber-400",
							children: /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-semibold text-zinc-100",
							children: "Workspace Audit Log & Governance Activity"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-zinc-400",
							children: "Chronological feed of administrative, permission, and project changes."
						})] })]
					}), /* @__PURE__ */ jsxs("span", {
						className: "font-mono text-xs text-zinc-400",
						children: [audits.length, " Recent Events"]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-4",
					children: audits.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "py-8 text-center",
						children: [/* @__PURE__ */ jsx(Clock, { className: "mx-auto h-6 w-6 text-zinc-600" }), /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-xs text-zinc-500",
							children: "No governance audit events recorded yet."
						})]
					}) : /* @__PURE__ */ jsx("div", {
						className: "divide-y divide-zinc-800/60",
						children: audits.map((audit) => {
							const tagConfig = getActionTagConfig(audit.event);
							const actorName = audit.user?.name || "System Actor";
							const formattedDate = audit.created_at ? new Date(audit.created_at).toLocaleString(void 0, {
								month: "short",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit"
							}) : "Recent";
							return /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 text-xs first:pt-1 last:pb-1",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ jsx("span", {
										className: `rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider shrink-0 ${tagConfig.badgeClass}`,
										children: tagConfig.label
									}), /* @__PURE__ */ jsxs("div", {
										className: "min-w-0 truncate",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "font-medium text-zinc-200",
												children: actorName
											}),
											/* @__PURE__ */ jsx("span", {
												className: "text-zinc-500 mx-1.5",
												children: "·"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "text-zinc-400 truncate",
												children: tagConfig.description(audit)
											})
										]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3 shrink-0 text-[11px] font-mono text-zinc-500 pl-8 sm:pl-0",
									children: [audit.ip_address && /* @__PURE__ */ jsx("span", {
										className: "hidden md:inline text-zinc-600",
										children: audit.ip_address
									}), /* @__PURE__ */ jsx("span", { children: formattedDate })]
								})]
							}, audit.id);
						})
					})
				})]
			})
		]
	});
}
function getActionTagConfig(event) {
	switch (event) {
		case "member.role_updated": return {
			label: "Role Updated",
			badgeClass: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
			description: (a) => {
				return `Updated access role for ${a.new_values?.name || `User #${a.auditable_id}`}`;
			}
		};
		case "member.invited": return {
			label: "Member Added",
			badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
			description: (a) => {
				return `Invited new team member: ${a.new_values?.name || `User #${a.auditable_id}`}`;
			}
		};
		case "member.removed": return {
			label: "Member Removed",
			badgeClass: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
			description: (a) => {
				return `Removed member account: ${a.old_values?.name || `User #${a.auditable_id}`}`;
			}
		};
		case "project.created": return {
			label: "Project Created",
			badgeClass: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
			description: (a) => {
				return `Created initiative workspace: ${a.new_values?.name || `Project #${a.auditable_id}`}`;
			}
		};
		case "project.archived": return {
			label: "Project Archived",
			badgeClass: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
			description: (a) => {
				return `Archived project initiative #${a.auditable_id}`;
			}
		};
		default: return {
			label: event.replace(/[._]/g, " "),
			badgeClass: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
			description: (a) => `Executed ${event} on ${a.auditable_type || "entity"} #${a.auditable_id || ""}`
		};
	}
}
//#endregion
//#region resources/js/Pages/Settings/Index.tsx
function Settings({ projects: initialProjects, users: initialUsers, roles, canManageAreas, canManageTeam, audits = [] }) {
	const [projects, setProjects] = useState(initialProjects);
	const [users, setUsers] = useState(initialUsers);
	const [activeTab, setActiveTab] = useState("projects");
	const [showMemberModal, setShowMemberModal] = useState(false);
	const [editingMember, setEditingMember] = useState(null);
	const handleSavedMember = (savedUser, isEdit) => {
		setUsers((cur) => isEdit ? cur.map((u) => u.id === savedUser.id ? savedUser : u) : [...cur, savedUser]);
	};
	const activeProjectsCount = projects.filter((p) => !p.archived_at).length;
	const teamCount = users.length;
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
						children: "Controls"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-zinc-600",
						children: "/"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500",
						children: "Workspace Management"
					})
				]
			}), /* @__PURE__ */ jsx("h1", {
				className: "mt-1 text-lg font-semibold text-zinc-100 sm:text-xl",
				children: "Studio Settings"
			})] }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 text-xs",
				children: /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#111216] px-3 py-1 font-medium text-emerald-400 shadow-sm",
					children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" }), "Relay Studio Engine v2.4"]
				})
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Settings · Workspace Studio" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto max-w-[1600px] space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3",
						children: [/* @__PURE__ */ jsxs("nav", {
							className: "flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111216] p-1.5 shadow-sm",
							children: [
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setActiveTab("projects"),
									className: `flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${activeTab === "projects" ? "border border-violet-500/40 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]" : "border border-transparent text-zinc-400 hover:border-zinc-700/60 hover:bg-[#14161c] hover:text-zinc-200"}`,
									children: [
										/* @__PURE__ */ jsx(FolderKanban, { className: `h-3.5 w-3.5 ${activeTab === "projects" ? "text-violet-400" : "text-zinc-500"}` }),
										/* @__PURE__ */ jsx("span", { children: "Projects & Initiatives" }),
										/* @__PURE__ */ jsx("span", {
											className: `rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${activeTab === "projects" ? "bg-violet-500/25 text-violet-200" : "bg-zinc-800 text-zinc-400"}`,
											children: activeProjectsCount
										})
									]
								}),
								canManageTeam && /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setActiveTab("team"),
									className: `flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${activeTab === "team" ? "border border-cyan-500/40 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "border border-transparent text-zinc-400 hover:border-zinc-700/60 hover:bg-[#14161c] hover:text-zinc-200"}`,
									children: [
										/* @__PURE__ */ jsx(Users, { className: `h-3.5 w-3.5 ${activeTab === "team" ? "text-cyan-400" : "text-zinc-500"}` }),
										/* @__PURE__ */ jsx("span", { children: "Team & Access Control" }),
										/* @__PURE__ */ jsx("span", {
											className: `rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${activeTab === "team" ? "bg-cyan-500/25 text-cyan-200" : "bg-zinc-800 text-zinc-400"}`,
											children: teamCount
										})
									]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setActiveTab("snapshot"),
									className: `flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-150 ${activeTab === "snapshot" ? "border border-emerald-500/40 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border border-transparent text-zinc-400 hover:border-zinc-700/60 hover:bg-[#14161c] hover:text-zinc-200"}`,
									children: [
										/* @__PURE__ */ jsx(Sparkles, { className: `h-3.5 w-3.5 ${activeTab === "snapshot" ? "text-emerald-400" : "text-zinc-500"}` }),
										/* @__PURE__ */ jsx("span", { children: "Workspace Snapshot" }),
										/* @__PURE__ */ jsx("span", {
											className: `rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${activeTab === "snapshot" ? "bg-emerald-500/25 text-emerald-200" : "bg-zinc-800 text-zinc-400"}`,
											children: "Live"
										})
									]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "hidden lg:flex items-center gap-2 text-[11px] text-zinc-500 font-mono",
							children: [
								/* @__PURE__ */ jsx("span", { children: "Workspace Scope: Global" }),
								/* @__PURE__ */ jsx("span", { children: "•" }),
								/* @__PURE__ */ jsx("span", {
									className: "text-zinc-400",
									children: "1600px High-Density View"
								})
							]
						})]
					}),
					activeTab === "projects" && /* @__PURE__ */ jsx(ProjectsManagementCard, {
						projects,
						setProjects,
						canManageAreas
					}),
					activeTab === "team" && canManageTeam && /* @__PURE__ */ jsx(TeamManagementCard, {
						users,
						setUsers,
						onAddMember: () => {
							setEditingMember(null);
							setShowMemberModal(true);
						},
						onEditMember: (user) => {
							setEditingMember(user);
							setShowMemberModal(true);
						}
					}),
					activeTab === "snapshot" && /* @__PURE__ */ jsx(WorkspaceSnapshotCard, {
						activeProjectsCount,
						teamAccountsCount: teamCount,
						projects,
						users,
						audits,
						onSelectTab: (tab) => setActiveTab(tab)
					})
				]
			}),
			canManageTeam && /* @__PURE__ */ jsx(MemberFormModal, {
				show: showMemberModal,
				onClose: () => setShowMemberModal(false),
				roles,
				editingMember,
				onSaved: handleSavedMember
			})
		]
	});
}
//#endregion
export { Settings as default };
