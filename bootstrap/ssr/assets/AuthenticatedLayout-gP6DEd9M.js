import { Link, router, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, AlertOctagon, AlertTriangle, Archive, ArrowRight, ArrowRightLeft, AtSign, Bell, Building2, Calendar, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Clock, Copy, Download, Edit3, ExternalLink, FileCode, FileSpreadsheet, FileText, Flame, FolderKanban, Inbox, KanbanSquare, Keyboard, LayoutDashboard, Link2, ListFilter, Loader2, LogOut, Mail, Maximize2, MessageSquare, Paperclip, Play, Plus, RefreshCw, RotateCcw, Search, Send, Settings, Shield, Sliders, SlidersHorizontal, Sparkles, Tag, Trash2, UploadCloud, User, UserCheck, X, Zap, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Command } from "cmdk";
import axios, { isAxiosError } from "axios";
import { Toaster, toast, toast as toast$1 } from "sonner";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
//#region resources/js/Components/Dropdown.tsx
var DropDownContext = createContext({
	open: false,
	setOpen: () => {},
	toggleOpen: () => {}
});
var Dropdown = ({ children }) => {
	const [open, setOpen] = useState(false);
	const toggleOpen = () => {
		setOpen((previousState) => !previousState);
	};
	return /* @__PURE__ */ jsx(DropDownContext.Provider, {
		value: {
			open,
			setOpen,
			toggleOpen
		},
		children: /* @__PURE__ */ jsx("div", {
			className: "relative",
			children
		})
	});
};
var Trigger = ({ children }) => {
	const { open, setOpen, toggleOpen } = useContext(DropDownContext);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		onClick: toggleOpen,
		children
	}), open && /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-40",
		onClick: () => setOpen(false)
	})] });
};
var Content = ({ align = "right", width = "48", contentClasses = "p-1 bg-[#0d1322]/95 border border-white/[0.1] backdrop-blur-2xl shadow-2xl shadow-specular", position = "down", children }) => {
	const { open, setOpen } = useContext(DropDownContext);
	let originClass = "";
	let posClass = "";
	if (position === "up") {
		posClass = "bottom-full mb-2";
		if (align === "left") originClass = "ltr:origin-bottom-left rtl:origin-bottom-right start-0";
		else if (align === "right") originClass = "ltr:origin-bottom-right rtl:origin-bottom-left end-0";
		else originClass = "origin-bottom";
	} else {
		posClass = "mt-2";
		if (align === "left") originClass = "ltr:origin-top-left rtl:origin-top-right start-0";
		else if (align === "right") originClass = "ltr:origin-top-right rtl:origin-top-left end-0";
		else originClass = "origin-top";
	}
	let widthClasses = "";
	if (width === "48") widthClasses = "w-48";
	return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Transition, {
		show: open,
		enter: "transition ease-out duration-150",
		enterFrom: "opacity-0 scale-95",
		enterTo: "opacity-100 scale-100",
		leave: "transition ease-in duration-100",
		leaveFrom: "opacity-100 scale-100",
		leaveTo: "opacity-0 scale-95",
		children: /* @__PURE__ */ jsx("div", {
			className: `absolute z-50 rounded-xl shadow-2xl ${posClass} ${originClass} ${widthClasses}`,
			onClick: () => setOpen(false),
			children: /* @__PURE__ */ jsx("div", {
				className: `rounded-xl overflow-hidden ` + contentClasses,
				children
			})
		})
	}) });
};
var DropdownLink = ({ className = "", children, ...props }) => {
	return /* @__PURE__ */ jsx(Link, {
		...props,
		className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs font-medium text-zinc-300 transition duration-150 ease-in-out hover:bg-white/[0.08] hover:text-white focus:bg-white/[0.08] focus:text-white focus:outline-none " + className,
		children
	});
};
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
//#endregion
//#region resources/js/Components/Modal.tsx
function Modal({ children, show = false, maxWidth = "2xl", closeable = true, onClose = () => {} }) {
	const close = () => {
		if (closeable) onClose();
	};
	const maxWidthClass = {
		sm: "sm:max-w-sm",
		md: "sm:max-w-md",
		lg: "sm:max-w-lg",
		xl: "sm:max-w-xl",
		"2xl": "sm:max-w-2xl",
		"3xl": "sm:max-w-3xl",
		"4xl": "sm:max-w-4xl",
		"5xl": "sm:max-w-5xl"
	}[maxWidth] ?? "sm:max-w-2xl";
	return /* @__PURE__ */ jsx(Transition, {
		show,
		leave: "duration-200",
		children: /* @__PURE__ */ jsxs(Dialog, {
			as: "div",
			id: "modal",
			className: "fixed inset-0 z-50 flex transform items-center justify-center overflow-y-auto px-4 py-6 transition-all sm:px-0",
			onClose: close,
			children: [/* @__PURE__ */ jsx(TransitionChild, {
				enter: "ease-out duration-300",
				enterFrom: "opacity-0",
				enterTo: "opacity-100",
				leave: "ease-in duration-200",
				leaveFrom: "opacity-100",
				leaveTo: "opacity-0",
				children: /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-md" })
			}), /* @__PURE__ */ jsx(TransitionChild, {
				enter: "ease-out duration-300",
				enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
				enterTo: "opacity-100 translate-y-0 sm:scale-100",
				leave: "ease-in duration-200",
				leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
				leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
				children: /* @__PURE__ */ jsxs(DialogPanel, {
					className: `relative mb-6 transform overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] shadow-specular backdrop-blur-2xl ring-1 ring-white/[0.05] transition-all sm:mx-auto sm:w-full ${maxWidthClass}`,
					children: [/* @__PURE__ */ jsx("div", {
						className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent",
						"aria-hidden": "true"
					}), children]
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/Components/WorkspaceSwitcher.tsx
function WorkspaceSwitcher({ collapsed = false }) {
	const pageProps = usePage().props;
	const currentWorkspace = pageProps.currentWorkspace;
	const userWorkspaces = pageProps.userWorkspaces ?? [];
	const [isOpen, setIsOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newWorkspaceName, setNewWorkspaceName] = useState("");
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState("");
	const dropdownRef = useRef(null);
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
		};
		if (isOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);
	const activeWorkspaceName = currentWorkspace?.name ?? "Relay Studio";
	const activeInitials = currentWorkspace?.name ? currentWorkspace.name.trim().split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() : "RS";
	const handleSwitch = (workspace) => {
		if (workspace.id === currentWorkspace?.id) {
			setIsOpen(false);
			return;
		}
		router.post(route("workspaces.switch", workspace.id), {}, {
			preserveScroll: true,
			onSuccess: () => {
				setIsOpen(false);
			}
		});
	};
	const handleCreateWorkspace = (e) => {
		e.preventDefault();
		if (!newWorkspaceName.trim()) {
			setCreateError("Workspace name is required");
			return;
		}
		setCreating(true);
		setCreateError("");
		router.post(route("workspaces.store"), { name: newWorkspaceName.trim() }, {
			preserveScroll: true,
			onSuccess: () => {
				setCreating(false);
				setNewWorkspaceName("");
				setIsCreateModalOpen(false);
				setIsOpen(false);
			},
			onError: (errors) => {
				setCreating(false);
				setCreateError(errors.name ?? "Failed to create workspace.");
			}
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative w-full",
		ref: dropdownRef,
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setIsOpen(!isOpen),
				className: `group flex items-center rounded-xl border border-white/[0.06] bg-[#12131a] p-1.5 transition-all hover:border-zinc-700/80 hover:bg-[#181924] ${collapsed ? "justify-center w-10 h-10 p-0" : "w-full justify-between"}`,
				title: collapsed ? activeWorkspaceName : void 0,
				"aria-expanded": isOpen,
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex min-w-0 items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-xs font-bold font-mono tracking-tight text-cyan-300 shadow-sm",
						children: activeInitials
					}), !collapsed && /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 text-left",
						children: [/* @__PURE__ */ jsx("div", {
							className: "truncate text-xs font-bold text-zinc-100 group-hover:text-white",
							children: activeWorkspaceName
						}), /* @__PURE__ */ jsx("div", {
							className: "truncate text-[10px] font-mono text-zinc-400",
							children: currentWorkspace?.slug ? `@${currentWorkspace.slug}` : "workspace"
						})]
					})]
				}), !collapsed && /* @__PURE__ */ jsx(ChevronsUpDown, { className: "h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300" })]
			}),
			isOpen && /* @__PURE__ */ jsxs("div", {
				className: "absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-zinc-800 bg-[#0e0f15] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400",
						children: "Workspaces"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "max-h-56 space-y-0.5 overflow-y-auto no-scrollbar",
						children: userWorkspaces.length > 0 ? userWorkspaces.map((ws) => {
							const isActive = ws.id === currentWorkspace?.id;
							const wsInitials = ws.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
							return /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => handleSwitch(ws),
								className: `flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${isActive ? "bg-zinc-800/80 text-white font-medium" : "text-zinc-300 hover:bg-zinc-850 hover:text-white"}`,
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex min-w-0 items-center gap-2.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: `flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-mono font-bold ${isActive ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`,
										children: wsInitials
									}), /* @__PURE__ */ jsx("span", {
										className: "truncate",
										children: ws.name
									})]
								}), isActive && /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 shrink-0 text-cyan-400" })]
							}, ws.id);
						}) : /* @__PURE__ */ jsx("div", {
							className: "px-2.5 py-2 text-xs text-zinc-400",
							children: activeWorkspaceName
						})
					}),
					/* @__PURE__ */ jsx("div", { className: "my-1 border-t border-zinc-800" }),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => {
							setIsOpen(false);
							setIsCreateModalOpen(true);
						},
						className: "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300",
						children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", { children: "Create Workspace" })]
					})
				]
			}),
			/* @__PURE__ */ jsx(Modal, {
				show: isCreateModalOpen,
				onClose: () => setIsCreateModalOpen(false),
				maxWidth: "md",
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-6",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-white/[0.08] pb-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-sm",
									children: /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-sm font-bold text-white tracking-tight",
									children: "Create Workspace"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-0.5 text-xs text-zinc-400",
									children: "Collaborate on requests and projects in an isolated workspace."
								})] })]
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setIsCreateModalOpen(false),
								className: "flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white",
								children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
							})]
						}),
						createError && /* @__PURE__ */ jsx("div", {
							className: "mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300",
							children: createError
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: handleCreateWorkspace,
							className: "mt-5 space-y-4",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
								className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
								children: ["Workspace Name ", /* @__PURE__ */ jsx("span", {
									className: "text-rose-400",
									children: "*"
								})]
							}), /* @__PURE__ */ jsx("input", {
								autoFocus: true,
								required: true,
								type: "text",
								placeholder: "e.g. Acme Engineering",
								value: newWorkspaceName,
								onChange: (e) => setNewWorkspaceName(e.target.value),
								className: "mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-sm transition-all"
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setIsCreateModalOpen(false),
									className: "rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors",
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									disabled: creating,
									type: "submit",
									className: "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all",
									children: creating ? "Creating..." : "Create Workspace"
								})]
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Components/Sidebar.tsx
function Sidebar() {
	const pageProps = usePage().props;
	const user = pageProps.auth?.user ?? { name: "User" };
	const roleName = pageProps.auth?.role?.name ?? "Member";
	const notifications = pageProps.workspaceNotifications ?? [];
	const projects = pageProps.workspaceProjects ?? [];
	const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
	const isMyWorkActive = route().current("requests.index") && searchParams?.get("my_work") === "1";
	const isBoardActive = route().current("requests.*") && !isMyWorkActive && !searchParams?.get("project");
	const activeProjectId = searchParams?.get("project");
	const [collapsed, setCollapsed] = useState(false);
	useEffect(() => {
		const stored = localStorage.getItem("relay_sidebar_collapsed");
		if (stored !== null) setCollapsed(stored === "true");
	}, []);
	const toggleCollapsed = () => {
		setCollapsed((prev) => {
			const next = !prev;
			localStorage.setItem("relay_sidebar_collapsed", String(next));
			return next;
		});
	};
	const mainLinks = [
		{
			name: "Dashboard",
			href: route("dashboard"),
			active: route().current("dashboard"),
			icon: LayoutDashboard,
			shortcut: "⌘D"
		},
		{
			name: "My Tasks",
			href: route("requests.index", { my_work: "1" }),
			active: isMyWorkActive,
			icon: Sparkles,
			shortcut: "⌘M"
		},
		{
			name: "Studio Board",
			href: route("requests.index"),
			active: isBoardActive,
			icon: KanbanSquare,
			shortcut: "⌘B"
		}
	];
	const unreadCount = pageProps.unreadNotificationsCount ?? notifications.filter((n) => !n.read_at).length;
	const workspaceLinks = [{
		name: "Inbox & Updates",
		href: route("notifications.index"),
		active: route().current("notifications.*"),
		icon: Bell,
		badge: unreadCount > 0 ? unreadCount > 9 ? "9+" : unreadCount : null
	}, {
		name: "Settings & Team",
		href: route("settings.index"),
		active: route().current("settings.*"),
		icon: Settings,
		badge: null
	}];
	return /* @__PURE__ */ jsxs("aside", {
		className: `sticky top-0 z-30 flex h-screen shrink-0 flex-col justify-between border-r border-zinc-800/80 bg-[#0c0d12] transition-all duration-200 ease-in-out select-none ${collapsed ? "w-[76px] p-3" : "w-[280px] p-4"}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: `flex items-center gap-2 border-b border-zinc-800/80 pb-3.5 ${collapsed ? "justify-center px-0 flex-col gap-2" : "justify-between px-1"}`,
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex-1 min-w-0 w-full",
						children: /* @__PURE__ */ jsx(WorkspaceSwitcher, { collapsed })
					}), !collapsed && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: toggleCollapsed,
						className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white",
						title: "Collapse sidebar (⌘[)",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
					})]
				}),
				collapsed && /* @__PURE__ */ jsx("div", {
					className: "flex justify-center pt-2.5",
					children: /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: toggleCollapsed,
						className: "flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white",
						title: "Expand sidebar (⌘[)",
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 space-y-1",
					children: [!collapsed && /* @__PURE__ */ jsx("p", {
						className: "px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
						children: "Workspace"
					}), mainLinks.map((link) => {
						const Icon = link.icon;
						return /* @__PURE__ */ jsxs(Link, {
							href: link.href,
							prefetch: "hover",
							cacheFor: "30s",
							title: collapsed ? link.name : void 0,
							className: `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${link.active ? "bg-zinc-800 text-white shadow-sm border border-zinc-750" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60 border border-transparent"} ${collapsed ? "justify-center px-0 h-11 w-full" : ""}`,
							children: [/* @__PURE__ */ jsx(Icon, { className: `h-5 w-5 shrink-0 transition-colors ${link.active ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}` }), !collapsed && /* @__PURE__ */ jsxs("div", {
								className: "flex flex-1 items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: link.name
								}), link.shortcut && /* @__PURE__ */ jsx("kbd", {
									className: "text-[11px] font-mono text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100",
									children: link.shortcut
								})]
							})]
						}, link.name);
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 space-y-1",
					children: [!collapsed && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between px-3 pb-1.5",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
							children: "Initiatives"
						}), /* @__PURE__ */ jsx(Link, {
							href: route("requests.index"),
							prefetch: "hover",
							cacheFor: "30s",
							className: "text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors",
							children: "All"
						})]
					}), projects.slice(0, 6).map((project) => {
						const isProjectActive = String(project.id) === activeProjectId;
						return /* @__PURE__ */ jsxs(Link, {
							href: route("requests.index", { project: project.id }),
							prefetch: "hover",
							cacheFor: "30s",
							title: collapsed ? project.name : void 0,
							className: `group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all ${isProjectActive ? "bg-zinc-800 text-white border border-zinc-750" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50 border border-transparent"} ${collapsed ? "justify-center px-0 h-10 w-full" : ""}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-2.5 w-2.5 shrink-0 rounded-full",
								style: { backgroundColor: project.color ?? "#71717a" }
							}), !collapsed && /* @__PURE__ */ jsxs("div", {
								className: "flex flex-1 items-center justify-between overflow-hidden",
								children: [/* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: project.name
								}), (project.active_count ?? 0) > 0 && /* @__PURE__ */ jsx("span", {
									className: "ml-2 flex h-5 min-w-5 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-1.5 text-[10px] font-mono text-zinc-400",
									children: project.active_count
								})]
							})]
						}, project.id);
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 space-y-1",
					children: [!collapsed && /* @__PURE__ */ jsx("p", {
						className: "px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
						children: "Settings"
					}), workspaceLinks.map((link) => {
						const Icon = link.icon;
						return /* @__PURE__ */ jsxs(Link, {
							href: link.href,
							prefetch: "hover",
							cacheFor: "30s",
							title: collapsed ? link.name : void 0,
							className: `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${link.active ? "bg-zinc-800 text-white shadow-sm border border-zinc-750" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60 border border-transparent"} ${collapsed ? "justify-center px-0 h-11 w-full" : ""}`,
							children: [/* @__PURE__ */ jsx(Icon, { className: `h-5 w-5 shrink-0 transition-colors ${link.active ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}` }), !collapsed && /* @__PURE__ */ jsxs("div", {
								className: "flex flex-1 items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: link.name
								}), link.badge && /* @__PURE__ */ jsx("span", {
									className: "flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-800 border border-zinc-750 px-1.5 text-[10px] font-mono font-medium text-zinc-300",
									children: link.badge
								})]
							})]
						}, link.name);
					})]
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "border-t border-zinc-800/80 pt-3",
			children: /* @__PURE__ */ jsxs(Dropdown, { children: [/* @__PURE__ */ jsx(Dropdown.Trigger, { children: /* @__PURE__ */ jsxs("button", {
				type: "button",
				className: `group flex w-full items-center rounded-xl border border-transparent p-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-800 hover:bg-zinc-850/60 hover:text-white ${collapsed ? "justify-center" : "justify-between"}`,
				title: collapsed ? user.name : void 0,
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex min-w-0 items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-800 text-xs font-semibold text-zinc-200",
						children: user.name.charAt(0)
					}), !collapsed && /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 text-left",
						children: [/* @__PURE__ */ jsx("p", {
							className: "truncate text-sm font-medium text-zinc-200 group-hover:text-white",
							children: user.name
						}), /* @__PURE__ */ jsx("p", {
							className: "truncate text-xs text-zinc-400",
							children: roleName
						})]
					})]
				}), !collapsed && /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:text-zinc-300" })]
			}) }), /* @__PURE__ */ jsxs(Dropdown.Content, {
				align: "left",
				position: "up",
				contentClasses: "w-[250px] p-1.5 rounded-xl border border-zinc-800 bg-[#121318] shadow-2xl text-xs",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "px-3 py-2.5 border-b border-zinc-800 mb-1",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "font-semibold text-zinc-100 text-sm",
								children: user.name
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-zinc-400 truncate mt-0.5",
								children: user.email || `@${user.username}`
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700",
								children: [/* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }), roleName]
							})
						]
					}),
					/* @__PURE__ */ jsxs(Dropdown.Link, {
						href: route("profile.edit"),
						prefetch: "hover",
						cacheFor: "30s",
						className: "py-2 px-2.5 text-xs",
						children: [/* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Profile & Account" })]
					}),
					/* @__PURE__ */ jsxs(Dropdown.Link, {
						href: route("notifications.index"),
						prefetch: "hover",
						cacheFor: "30s",
						className: "py-2 px-2.5 text-xs",
						children: [/* @__PURE__ */ jsx(Bell, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Notifications" })]
					}),
					/* @__PURE__ */ jsxs(Dropdown.Link, {
						href: route("settings.index"),
						prefetch: "hover",
						cacheFor: "30s",
						className: "py-2 px-2.5 text-xs",
						children: [/* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Workspace Settings" })]
					}),
					/* @__PURE__ */ jsx("div", { className: "my-1 border-t border-zinc-800" }),
					/* @__PURE__ */ jsxs(Dropdown.Link, {
						href: route("logout"),
						method: "post",
						as: "button",
						className: "py-2 px-2.5 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300",
						children: [/* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 text-rose-400" }), /* @__PURE__ */ jsx("span", { children: "Sign out" })]
					})
				]
			})] })
		})]
	});
}
//#endregion
//#region resources/js/Components/CommandPalette.tsx
function CommandPalette({ open, setOpen, onOpenCreate, onOpenShortcuts, projects = [] }) {
	const [search, setSearch] = useState("");
	const [searchResults, setSearchResults] = useState({
		requests: [],
		projects: []
	});
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		const down = (e) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey) || e.key === "/" && !["INPUT", "TEXTAREA"].includes(e.target?.tagName)) {
				e.preventDefault();
				setOpen(!open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, [open, setOpen]);
	useEffect(() => {
		const query = search.trim();
		if (!query) {
			setSearchResults({
				requests: [],
				projects: []
			});
			return;
		}
		const timer = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
				setSearchResults(res.data);
			} catch {} finally {
				setLoading(false);
			}
		}, 150);
		return () => clearTimeout(timer);
	}, [search]);
	if (!open) return null;
	const navigate = (url) => {
		setOpen(false);
		router.visit(url);
	};
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh] backdrop-blur-md animate-in fade-in duration-150",
		onClick: () => setOpen(false),
		children: /* @__PURE__ */ jsx("div", {
			className: "w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d1322]/95 shadow-2xl backdrop-blur-2xl shadow-specular animate-in zoom-in-95 duration-150",
			onClick: (e) => e.stopPropagation(),
			children: /* @__PURE__ */ jsxs(Command, {
				label: "Command Menu",
				className: "flex flex-col",
				shouldFilter: false,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5",
						children: [
							/* @__PURE__ */ jsx(Search, { className: "h-4 w-4 shrink-0 text-violet-400" }),
							/* @__PURE__ */ jsx(Command.Input, {
								value: search,
								onValueChange: setSearch,
								placeholder: "Type to search tickets or jump to page...",
								className: "w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none",
								autoFocus: true
							}),
							loading && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 shrink-0 animate-spin text-violet-400" }),
							/* @__PURE__ */ jsx("kbd", {
								className: "flex h-5 items-center gap-0.5 rounded border border-white/[0.1] bg-white/[0.04] px-1.5 text-[10px] font-mono text-zinc-400",
								children: "ESC"
							})
						]
					}),
					/* @__PURE__ */ jsxs(Command.List, {
						className: "custom-scroll max-h-[360px] overflow-y-auto p-2 text-xs",
						children: [
							searchResults.requests.length > 0 && /* @__PURE__ */ jsx(Command.Group, {
								heading: /* @__PURE__ */ jsxs("span", {
									className: "px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400",
									children: [
										"Matching Tickets (",
										searchResults.requests.length,
										")"
									]
								}),
								children: searchResults.requests.map((req) => /* @__PURE__ */ jsxs(Command.Item, {
									value: `REQ-${req.id} ${req.title}`,
									onSelect: () => navigate(`/requests/${req.id}`),
									className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2.5 min-w-0",
										children: [
											/* @__PURE__ */ jsxs("span", {
												className: "font-mono text-xs font-bold text-violet-400 shrink-0",
												children: ["#REQ-", req.id]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `h-2 w-2 rounded-full shrink-0 ${req.priority === "urgent" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : req.priority === "high" ? "bg-amber-400" : req.priority === "low" ? "bg-zinc-500" : "bg-cyan-400"}`,
												title: `Priority: ${req.priority}`
											}),
											/* @__PURE__ */ jsx("span", {
												className: "truncate text-xs font-medium text-zinc-200",
												children: req.title
											})
										]
									}), req.project && /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1.5 shrink-0 ml-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "h-2 w-2 rounded-full",
											style: { backgroundColor: req.project.color || "#8b5cf6" }
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-zinc-400 font-medium",
											children: req.project.name
										})]
									})]
								}, `req-${req.id}`))
							}),
							searchResults.projects.length > 0 && /* @__PURE__ */ jsx(Command.Group, {
								heading: /* @__PURE__ */ jsxs("span", {
									className: "px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400",
									children: [
										"Projects (",
										searchResults.projects.length,
										")"
									]
								}),
								children: searchResults.projects.map((proj) => /* @__PURE__ */ jsxs(Command.Item, {
									value: `project ${proj.name}`,
									onSelect: () => navigate(route("requests.index", { project: String(proj.id) })),
									className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ jsx("span", {
											className: "h-2.5 w-2.5 rounded-full",
											style: { backgroundColor: proj.color || "#6366f1" }
										}), /* @__PURE__ */ jsx("span", {
											className: "font-medium",
											children: proj.name
										})]
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-zinc-500",
										children: "Jump to project"
									})]
								}, `search-proj-${proj.id}`))
							}),
							/* @__PURE__ */ jsxs(Command.Group, {
								heading: /* @__PURE__ */ jsx("span", {
									className: "px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500",
									children: "Actions"
								}),
								children: [
									onOpenCreate && /* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => {
											setOpen(false);
											onOpenCreate();
										},
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx("div", {
												className: "flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300",
												children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" })
											}), /* @__PURE__ */ jsx("span", {
												className: "font-semibold",
												children: "Create New Work Request"
											})]
										}), /* @__PURE__ */ jsx("kbd", {
											className: "rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400",
											children: "C"
										})]
									}),
									onOpenShortcuts && /* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => {
											setOpen(false);
											onOpenShortcuts();
										},
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx("div", {
												className: "flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300",
												children: /* @__PURE__ */ jsx(Keyboard, { className: "h-3.5 w-3.5" })
											}), /* @__PURE__ */ jsx("span", {
												className: "font-semibold",
												children: "Keyboard Shortcuts Cheat-sheet"
											})]
										}), /* @__PURE__ */ jsx("kbd", {
											className: "rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400",
											children: "?"
										})]
									}),
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: async () => {
											setOpen(false);
											try {
												await axios.post(route("notifications.read-all"));
												toast.success("All notifications marked as read");
												router.reload();
											} catch {
												toast.error("Failed to mark notifications as read");
											}
										},
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx("div", {
												className: "flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300",
												children: /* @__PURE__ */ jsx(CheckCheck, { className: "h-3.5 w-3.5" })
											}), /* @__PURE__ */ jsx("span", {
												className: "font-semibold",
												children: "Mark All Notifications as Read"
											})]
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-zinc-500",
											children: "Inbox"
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs(Command.Group, {
								heading: /* @__PURE__ */ jsx("span", {
									className: "px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500",
									children: "Quick Filters"
								}),
								children: [
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("requests.index", { my_work: "1" })),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx("div", {
												className: "flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300",
												children: /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" })
											}), /* @__PURE__ */ jsx("span", {
												className: "font-semibold",
												children: "My Assigned Tasks"
											})]
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-zinc-500",
											children: "Filter work"
										})]
									}),
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("requests.index", { status: "review" })),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx("div", {
												className: "flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300",
												children: /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" })
											}), /* @__PURE__ */ jsx("span", {
												className: "font-semibold",
												children: "Review & Sign-Off Queue"
											})]
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-zinc-500",
											children: "Pending sign-off"
										})]
									}),
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("requests.index", { priority: "urgent" })),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx("div", {
												className: "flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300",
												children: /* @__PURE__ */ jsx(Flame, { className: "h-3.5 w-3.5" })
											}), /* @__PURE__ */ jsx("span", {
												className: "font-semibold",
												children: "Urgent Priority Items"
											})]
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-zinc-500",
											children: "High priority"
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs(Command.Group, {
								heading: /* @__PURE__ */ jsx("span", {
									className: "px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500",
									children: "Navigation"
								}),
								children: [
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("dashboard")),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Dashboard / Overview" })]
										}), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 text-zinc-600" })]
									}),
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("requests.index")),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx(KanbanSquare, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Live Kanban Board" })]
										}), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 text-zinc-600" })]
									}),
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("settings.index")),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Settings & Workspaces" })]
										}), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 text-zinc-600" })]
									}),
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("notifications.index")),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx(Bell, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Notifications" })]
										}), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 text-zinc-600" })]
									}),
									/* @__PURE__ */ jsxs(Command.Item, {
										onSelect: () => navigate(route("profile.edit")),
										className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Profile & Account" })]
										}), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 text-zinc-600" })]
									})
								]
							}),
							projects.length > 0 && searchResults.projects.length === 0 && /* @__PURE__ */ jsx(Command.Group, {
								heading: /* @__PURE__ */ jsx("span", {
									className: "px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500",
									children: "Jump to Project"
								}),
								children: projects.map((proj) => /* @__PURE__ */ jsxs(Command.Item, {
									onSelect: () => navigate(route("requests.index", { project: String(proj.id) })),
									className: "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ jsx(FolderKanban, { className: "h-3.5 w-3.5 text-indigo-400" }), /* @__PURE__ */ jsx("span", { children: proj.name })]
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-zinc-500",
										children: "View Board"
									})]
								}, proj.id))
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-t border-white/[0.06] bg-[#07090e]/60 px-4 py-2 text-[11px] text-zinc-500",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsxs("span", { children: ["Navigate ", /* @__PURE__ */ jsx("kbd", {
								className: "rounded border border-white/[0.1] px-1 py-0.5 font-mono text-[9px] text-zinc-400",
								children: "↑↓"
							})] }), /* @__PURE__ */ jsxs("span", { children: ["Select ", /* @__PURE__ */ jsx("kbd", {
								className: "rounded border border-white/[0.1] px-1 py-0.5 font-mono text-[9px] text-zinc-400",
								children: "↵"
							})] })]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[10px] text-violet-400",
							children: "Relay Command Studio"
						})]
					})
				]
			})
		})
	});
}
//#endregion
//#region resources/js/Features/Requests/components/BoardHeader.tsx
function BoardHeader({ viewMode, onViewModeChange, onAddRequest }) {
	const [exportOpen, setExportOpen] = useState(false);
	const dropdownRef = useRef(null);
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setExportOpen(false);
		};
		if (exportOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [exportOpen]);
	const handleExport = (format) => {
		setExportOpen(false);
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set("format", format);
		window.location.href = `/requests/export?${searchParams.toString()}`;
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center justify-between gap-4",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
			className: "text-xl font-bold tracking-tight text-white",
			children: "Live Studio Board"
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-0.5 text-xs text-zinc-400",
			children: "Smooth drag-and-drop workflow across stages with fast-path status triage."
		})] }), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2.5",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center rounded-xl border border-zinc-800 bg-[#0d0e12] p-1 shadow-sm",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onViewModeChange("board"),
						className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "board" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`,
						title: "Kanban Board view",
						children: [/* @__PURE__ */ jsx(KanbanSquare, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "Board"
						})]
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onViewModeChange("list"),
						className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`,
						title: "Interactive List/Table view",
						children: [/* @__PURE__ */ jsx(ListFilter, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "List"
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative",
					ref: dropdownRef,
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setExportOpen((prev) => !prev),
						className: "flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0d0e12] px-3.5 py-2 text-xs font-medium text-zinc-300 shadow-sm transition-all duration-150 hover:border-zinc-700 hover:bg-[#121318] hover:text-white active:scale-[0.98]",
						title: "Export Backlog Data",
						children: [
							/* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5 text-zinc-400" }),
							/* @__PURE__ */ jsx("span", { children: "Export" }),
							/* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3 text-zinc-500 transition-transform duration-150" })
						]
					}), exportOpen && /* @__PURE__ */ jsxs("div", {
						className: "absolute right-0 top-full mt-2 w-52 rounded-xl border border-zinc-800 bg-[#0c0d12] p-1.5 shadow-2xl z-30 backdrop-blur-md animate-in fade-in duration-100 divide-y divide-zinc-800/60",
						children: [/* @__PURE__ */ jsx("div", {
							className: "px-2 py-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider",
							children: "Data Portability"
						}), /* @__PURE__ */ jsxs("div", {
							className: "py-1 space-y-0.5",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => handleExport("csv"),
								className: "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors group",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400",
									children: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-medium text-zinc-200 group-hover:text-white",
										children: "Export as CSV"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-zinc-500",
										children: "Standard CSV spreadsheet"
									})]
								})]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => handleExport("json"),
								className: "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors group",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-cyan-400",
									children: /* @__PURE__ */ jsx(FileCode, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-medium text-zinc-200 group-hover:text-white",
										children: "Export as JSON"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-zinc-500",
										children: "Full structured archive"
									})]
								})]
							})]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onAddRequest,
					className: "flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:bg-zinc-200 active:scale-[0.98]",
					children: [
						/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
						/* @__PURE__ */ jsx("span", { children: "Add Request" }),
						/* @__PURE__ */ jsx("kbd", {
							className: "rounded bg-zinc-200 px-1 py-0.5 text-[9px] font-mono text-zinc-800",
							children: "C"
						})
					]
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/BoardFilterBar.tsx
function BoardFilterBar({ filters, projects, users, statuses, priorities }) {
	const { preset, setPreset, counts, search, setSearch, showAdvancedFilters, setShowAdvancedFilters, isFiltered, resetFilters, selectedProject, setSelectedProject, owner, setOwner, requester, setRequester, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter } = filters;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#0d0e12] p-1.5 shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-1",
					children: [
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setPreset("all"),
							className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${preset === "all" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"}`,
							children: [/* @__PURE__ */ jsx("span", { children: "All Work" }), /* @__PURE__ */ jsx("span", {
								className: "rounded bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300",
								children: counts.all
							})]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setPreset("my"),
							className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${preset === "my" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"}`,
							children: [
								/* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-zinc-400" }),
								/* @__PURE__ */ jsx("span", { children: "My Tasks" }),
								/* @__PURE__ */ jsx("span", {
									className: "rounded bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300 font-semibold",
									children: counts.my
								})
							]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setPreset("review"),
							className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${preset === "review" ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"}`,
							children: [
								/* @__PURE__ */ jsx(Clock, { className: "h-3 w-3 text-zinc-400" }),
								/* @__PURE__ */ jsx("span", { children: "In Review" }),
								counts.review > 0 && /* @__PURE__ */ jsx("span", {
									className: "rounded bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300 font-semibold",
									children: counts.review
								})
							]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setPreset("blocked"),
							className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${preset === "blocked" ? "bg-zinc-800 text-rose-300 shadow-sm border border-rose-900/40" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"}`,
							children: [
								/* @__PURE__ */ jsx(AlertOctagon, { className: "h-3 w-3 text-rose-400" }),
								/* @__PURE__ */ jsx("span", { children: "Blocked" }),
								counts.blocked > 0 && /* @__PURE__ */ jsx("span", {
									className: "rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-300 font-semibold",
									children: counts.blocked
								})
							]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setPreset("urgent"),
							className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${preset === "urgent" ? "bg-zinc-800 text-amber-300 shadow-sm border border-amber-900/40" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50"}`,
							children: [
								/* @__PURE__ */ jsx(Flame, { className: "h-3 w-3 text-amber-400" }),
								/* @__PURE__ */ jsx("span", { children: "Urgent" }),
								counts.urgent > 0 && /* @__PURE__ */ jsx("span", {
									className: "rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-300 font-semibold",
									children: counts.urgent
								})
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 w-full sm:w-auto",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "relative flex-1 sm:w-56",
							children: [
								/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }),
								/* @__PURE__ */ jsx("input", {
									id: "board-search-input",
									value: search,
									onChange: (e) => setSearch(e.target.value),
									placeholder: "Search board...",
									className: "w-full rounded-lg border border-zinc-800 bg-[#14151b] pl-9 pr-7 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
								}),
								/* @__PURE__ */ jsx("kbd", {
									className: "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-zinc-750 bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-500",
									children: "/"
								})
							]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setShowAdvancedFilters(!showAdvancedFilters),
							className: `flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${showAdvancedFilters ? "border-zinc-600 bg-zinc-800 text-zinc-100" : "border-zinc-800 bg-zinc-850 text-zinc-400 hover:text-zinc-200"}`,
							title: "Toggle advanced filters",
							children: [/* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", {
								className: "hidden md:inline",
								children: "Filters"
							})]
						}),
						isFiltered && /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: resetFilters,
							className: "flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 px-1",
							title: "Reset all filters",
							children: [/* @__PURE__ */ jsx(RotateCcw, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", {
								className: "hidden lg:inline",
								children: "Reset"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5 overflow-x-auto pb-1 text-xs",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500 pr-1 shrink-0",
						children: "Project:"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setSelectedProject(""),
						className: `rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${selectedProject === "" ? "bg-zinc-800 text-white border border-zinc-700/60" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"}`,
						children: "All Projects"
					}),
					projects.map((proj) => {
						const active = selectedProject === String(proj.id);
						return /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setSelectedProject(active ? "" : String(proj.id)),
							className: `flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${active ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: "h-2 w-2 rounded-full",
								style: { backgroundColor: proj.color ?? "#71717a" }
							}), /* @__PURE__ */ jsx("span", { children: proj.name })]
						}, proj.id);
					})
				]
			}),
			showAdvancedFilters && /* @__PURE__ */ jsxs("div", {
				className: "grid gap-2.5 rounded-xl border border-zinc-800 bg-[#111216] p-3 text-xs shadow-sm sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-150",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
						children: "Assignee"
					}), /* @__PURE__ */ jsxs("select", {
						value: owner,
						onChange: (e) => setOwner(e.target.value),
						className: "mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All assignees"
						}), users.map((item) => /* @__PURE__ */ jsx("option", {
							value: item.id,
							children: item.name
						}, item.id))]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
						children: "Requester"
					}), /* @__PURE__ */ jsxs("select", {
						value: requester,
						onChange: (e) => setRequester(e.target.value),
						className: "mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All requesters"
						}), users.map((item) => /* @__PURE__ */ jsx("option", {
							value: item.id,
							children: item.name
						}, item.id))]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
						children: "Status Column"
					}), /* @__PURE__ */ jsxs("select", {
						value: statusFilter,
						onChange: (e) => setStatusFilter(e.target.value),
						className: "mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All statuses"
						}), Object.entries(statuses).map(([val, lbl]) => /* @__PURE__ */ jsx("option", {
							value: val,
							children: lbl
						}, val))]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500",
						children: "Priority Level"
					}), /* @__PURE__ */ jsxs("select", {
						value: priorityFilter,
						onChange: (e) => setPriorityFilter(e.target.value),
						className: "mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All priorities"
						}), Object.entries(priorities).map(([val, lbl]) => /* @__PURE__ */ jsx("option", {
							value: val,
							children: lbl
						}, val))]
					})] })
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Components/Badge.tsx
function Badge({ variant = "zinc", dot = false, className = "", children }) {
	const config = {
		violet: {
			container: "bg-violet-500/10 text-violet-300 border-violet-400/25",
			dot: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
		},
		emerald: {
			container: "bg-emerald-500/10 text-emerald-300 border-emerald-400/25",
			dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
		},
		rose: {
			container: "bg-rose-500/10 text-rose-300 border-rose-400/25",
			dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"
		},
		zinc: {
			container: "bg-zinc-800/60 text-zinc-300 border-white/[0.08]",
			dot: "bg-zinc-400"
		},
		fuchsia: {
			container: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/25",
			dot: "bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)]"
		},
		indigo: {
			container: "bg-indigo-500/10 text-indigo-300 border-indigo-400/25",
			dot: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
		},
		amber: {
			container: "bg-amber-500/10 text-amber-300 border-amber-400/25",
			dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
		},
		cyan: {
			container: "bg-cyan-500/10 text-cyan-300 border-cyan-400/25",
			dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
		},
		orange: {
			container: "bg-orange-500/10 text-orange-300 border-orange-400/25",
			dot: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"
		},
		blue: {
			container: "bg-blue-500/10 text-blue-300 border-blue-400/25",
			dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
		}
	}[variant];
	return /* @__PURE__ */ jsxs("span", {
		className: `inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-md transition-all ${config.container} ${className}`,
		children: [dot && /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}` }), children]
	});
}
//#endregion
//#region resources/js/Components/MarkdownViewer.tsx
function highlightCodeLine(line, language) {
	const lang = (language || "").toLowerCase().trim();
	let commentPattern = "//.*$";
	if ([
		"python",
		"py",
		"bash",
		"sh",
		"zsh"
	].includes(lang)) commentPattern = "#.*$";
	else if (lang === "sql") commentPattern = "(--.*$)|(/\\*.*?\\*/)";
	else if (lang === "php") commentPattern = "(//.*$)|(#.*$)|(/\\*.*?\\*/)";
	let keywordList = [
		"const",
		"let",
		"var",
		"function",
		"return",
		"if",
		"else",
		"for",
		"while",
		"switch",
		"case",
		"break",
		"continue",
		"import",
		"export",
		"from",
		"default",
		"class",
		"extends",
		"async",
		"await",
		"try",
		"catch",
		"finally",
		"throw",
		"new",
		"typeof",
		"instanceof",
		"interface",
		"type",
		"enum",
		"public",
		"private",
		"protected",
		"readonly",
		"static",
		"true",
		"false",
		"null",
		"undefined",
		"this",
		"super",
		"yield"
	];
	if (lang === "php") keywordList = [
		"function",
		"class",
		"interface",
		"trait",
		"public",
		"protected",
		"private",
		"readonly",
		"static",
		"final",
		"return",
		"if",
		"else",
		"elseif",
		"foreach",
		"for",
		"while",
		"switch",
		"case",
		"break",
		"continue",
		"use",
		"namespace",
		"new",
		"try",
		"catch",
		"finally",
		"throw",
		"extends",
		"implements",
		"true",
		"false",
		"null",
		"echo",
		"print",
		"fn"
	];
	else if (["python", "py"].includes(lang)) keywordList = [
		"def",
		"class",
		"return",
		"if",
		"elif",
		"else",
		"for",
		"while",
		"in",
		"import",
		"from",
		"as",
		"try",
		"except",
		"finally",
		"raise",
		"with",
		"async",
		"await",
		"lambda",
		"pass",
		"yield",
		"True",
		"False",
		"None",
		"and",
		"or",
		"not",
		"is"
	];
	else if (lang === "sql") keywordList = [
		"SELECT",
		"FROM",
		"WHERE",
		"INSERT",
		"INTO",
		"VALUES",
		"UPDATE",
		"SET",
		"DELETE",
		"JOIN",
		"LEFT",
		"RIGHT",
		"INNER",
		"OUTER",
		"ON",
		"GROUP",
		"BY",
		"ORDER",
		"HAVING",
		"LIMIT",
		"OFFSET",
		"AND",
		"OR",
		"NOT",
		"IN",
		"IS",
		"NULL",
		"AS",
		"CREATE",
		"TABLE",
		"ALTER",
		"DROP",
		"INDEX",
		"PRIMARY",
		"KEY",
		"FOREIGN",
		"REFERENCES",
		"UNION",
		"ALL",
		"DISTINCT"
	];
	else if ([
		"bash",
		"sh",
		"zsh"
	].includes(lang)) keywordList = [
		"if",
		"then",
		"else",
		"elif",
		"fi",
		"for",
		"while",
		"do",
		"done",
		"in",
		"case",
		"esac",
		"echo",
		"exit",
		"return",
		"function",
		"export",
		"source",
		"local"
	];
	else if (lang === "json") keywordList = [
		"true",
		"false",
		"null"
	];
	const keywordPattern = `\\b(?:${keywordList.join("|")})\\b`;
	const tokenRegex = new RegExp(`(?<comment>${commentPattern})|(?<str>"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`)|(?<num>\\b\\d+(?:\\.\\d+)?\\b)|(?<fn>\\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\\s*\\())|(?<kw>${lang === "php" ? "(?:<\\?php|\\?>)|" : ""}${keywordPattern})|(?<variable>\\$[a-zA-Z0-9_]+)`, lang === "sql" ? "gi" : "g");
	const elements = [];
	let lastIndex = 0;
	let match;
	while ((match = tokenRegex.exec(line)) !== null) {
		if (match.index > lastIndex) elements.push(line.slice(lastIndex, match.index));
		const groups = match.groups || {};
		const matchedText = match[0];
		if (groups.comment) elements.push(/* @__PURE__ */ jsx("span", {
			className: "text-zinc-500 italic",
			children: matchedText
		}, match.index));
		else if (groups.str) elements.push(/* @__PURE__ */ jsx("span", {
			className: "text-emerald-400",
			children: matchedText
		}, match.index));
		else if (groups.num) elements.push(/* @__PURE__ */ jsx("span", {
			className: "text-violet-400",
			children: matchedText
		}, match.index));
		else if (groups.kw) elements.push(/* @__PURE__ */ jsx("span", {
			className: "text-sky-400 font-medium",
			children: matchedText
		}, match.index));
		else if (groups.fn) elements.push(/* @__PURE__ */ jsx("span", {
			className: "text-amber-400",
			children: matchedText
		}, match.index));
		else if (groups.variable) elements.push(/* @__PURE__ */ jsx("span", {
			className: "text-cyan-300",
			children: matchedText
		}, match.index));
		else elements.push(matchedText);
		lastIndex = tokenRegex.lastIndex;
	}
	if (lastIndex < line.length) elements.push(line.slice(lastIndex));
	return elements.length > 0 ? elements : line;
}
function CodeBlock({ code, language }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	const lines = code.split("\n");
	return /* @__PURE__ */ jsxs("div", {
		className: "group relative my-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "absolute right-3 top-3 flex items-center gap-2 z-10",
			children: [language && /* @__PURE__ */ jsx("span", {
				className: "rounded bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono uppercase text-zinc-400",
				children: language
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: handleCopy,
				className: "flex h-6 w-6 items-center justify-center rounded bg-white/[0.06] text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity border border-white/[0.08]",
				title: "Copy code",
				children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
			})]
		}), /* @__PURE__ */ jsx("pre", {
			className: "bg-[#090a0f] border border-white/[0.08] p-4 rounded-xl font-mono text-sm overflow-x-auto text-zinc-200",
			children: /* @__PURE__ */ jsx("code", { children: lines.map((line, i) => /* @__PURE__ */ jsx("div", {
				className: "leading-relaxed",
				children: highlightCodeLine(line, language)
			}, i)) })
		})]
	});
}
function MarkdownViewer({ content, onToggleChecklist, className = "" }) {
	if (!content) return null;
	const rawLines = content.split("\n");
	const handleCheckboxToggle = (lineIndex, currentChecked) => {
		if (!onToggleChecklist) return;
		const newLines = [...rawLines];
		const targetLine = newLines[lineIndex];
		if (currentChecked) newLines[lineIndex] = targetLine.replace(/- \[[xX]\]/, "- [ ]");
		else newLines[lineIndex] = targetLine.replace(/- \[ \]/, "- [x]");
		onToggleChecklist(newLines.join("\n"));
	};
	const formatInline = (text) => {
		return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, index) => {
			if (part.startsWith("**") && part.endsWith("**")) return /* @__PURE__ */ jsx("strong", {
				className: "font-semibold text-zinc-100",
				children: part.slice(2, -2)
			}, index);
			if (part.startsWith("`") && part.endsWith("`")) return /* @__PURE__ */ jsx("code", {
				className: "rounded border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300",
				children: part.slice(1, -1)
			}, index);
			return part;
		});
	};
	const blocks = [];
	let inCodeBlock = false;
	let codeLanguage = "";
	let codeLines = [];
	for (let i = 0; i < rawLines.length; i++) {
		const line = rawLines[i];
		const codeBlockMatch = line.match(/^```(\w+)?$/);
		if (codeBlockMatch && !inCodeBlock) {
			inCodeBlock = true;
			codeLanguage = codeBlockMatch[1] || "";
			codeLines = [];
			continue;
		}
		if (line.trim() === "```" && inCodeBlock) {
			inCodeBlock = false;
			blocks.push({
				type: "code",
				code: codeLines.join("\n"),
				language: codeLanguage
			});
			codeLanguage = "";
			codeLines = [];
			continue;
		}
		if (inCodeBlock) codeLines.push(line);
		else blocks.push({
			type: "line",
			line,
			originalIndex: i
		});
	}
	if (inCodeBlock) blocks.push({
		type: "code",
		code: codeLines.join("\n"),
		language: codeLanguage
	});
	return /* @__PURE__ */ jsx("div", {
		className: `space-y-1.5 text-xs leading-relaxed text-zinc-300 select-text ${className}`,
		children: blocks.map((block, idx) => {
			if (block.type === "code") return /* @__PURE__ */ jsx(CodeBlock, {
				code: block.code,
				language: block.language
			}, idx);
			const { line, originalIndex } = block;
			const trimmed = line.trim();
			const checkMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
			if (checkMatch) {
				const isChecked = checkMatch[2].toLowerCase() === "x";
				const itemText = checkMatch[3];
				return /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-2.5 py-0.5 group/item cursor-pointer",
					onClick: () => handleCheckboxToggle(originalIndex, isChecked),
					children: [/* @__PURE__ */ jsx("input", {
						type: "checkbox",
						checked: isChecked,
						onChange: () => handleCheckboxToggle(originalIndex, isChecked),
						className: "mt-0.5 h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
					}), /* @__PURE__ */ jsx("span", {
						className: `flex-1 transition-colors ${isChecked ? "line-through text-zinc-500" : "text-zinc-200 group-hover/item:text-white"}`,
						children: formatInline(itemText)
					})]
				}, idx);
			}
			if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) return /* @__PURE__ */ jsxs("div", {
				className: "flex items-start gap-2 pl-1 py-0.2",
				children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" }), /* @__PURE__ */ jsx("span", { children: formatInline(trimmed.slice(2)) })]
			}, idx);
			if (trimmed.startsWith("### ")) return /* @__PURE__ */ jsx("h4", {
				className: "mt-2 text-xs font-bold text-zinc-100 uppercase tracking-wider",
				children: trimmed.slice(4)
			}, idx);
			if (!trimmed) return /* @__PURE__ */ jsx("div", { className: "h-1" }, idx);
			return /* @__PURE__ */ jsx("p", {
				className: "text-zinc-300",
				children: formatInline(line)
			}, idx);
		})
	});
}
/**
* Utility to extract checklist statistics from markdown text.
* Returns { completed: number, total: number, percentage: number }
*/
function getChecklistStats(content) {
	if (!content) return null;
	const matches = content.match(/- \[[ xX]\]/g);
	if (!matches || matches.length === 0) return null;
	const total = matches.length;
	const completed = matches.filter((m) => m.toLowerCase().includes("x")).length;
	return {
		completed,
		total,
		percentage: Math.round(completed / total * 100)
	};
}
//#endregion
//#region resources/js/Features/Requests/components/RequestCard.tsx
var statusTone$1 = {
	new: "zinc",
	ready: "blue",
	doing: "amber",
	review: "violet",
	done: "emerald"
};
function RequestCard({ request, index, onQuickStatus, onOpenDrawer, isSelected = false, onToggleSelect, isKeyboardFocused = false }) {
	const checklist = getChecklistStats(request.description);
	const nextAction = request.status === "ready" ? {
		label: "Start",
		icon: Play,
		iconClass: "fill-current",
		next: "doing",
		color: "border-zinc-750 bg-zinc-850/90 text-zinc-300 hover:border-blue-500/50 hover:bg-blue-950/40 hover:text-blue-200"
	} : request.status === "doing" ? {
		label: "Review",
		icon: Send,
		iconClass: "",
		next: "review",
		color: "border-zinc-750 bg-zinc-850/90 text-zinc-300 hover:border-violet-500/50 hover:bg-violet-950/40 hover:text-violet-200"
	} : request.status === "review" ? {
		label: "Approve",
		icon: Check,
		iconClass: "stroke-[2.5]",
		next: "done",
		color: "border-emerald-800/60 bg-emerald-950/20 text-emerald-300 hover:border-emerald-600/80 hover:bg-emerald-950/50 hover:text-emerald-100"
	} : null;
	return /* @__PURE__ */ jsx(Draggable, {
		draggableId: String(request.id),
		index,
		children: (provided, snapshot) => {
			const baseTransform = provided.draggableProps.style?.transform;
			const transform = snapshot.isDragging && baseTransform ? `${baseTransform} rotate(1.2deg) scale(1.025)` : baseTransform;
			const cardStyle = {
				...provided.draggableProps.style,
				transform,
				transition: snapshot.isDragging ? void 0 : "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease",
				cursor: snapshot.isDragging ? "grabbing" : "pointer"
			};
			return /* @__PURE__ */ jsxs("div", {
				ref: provided.innerRef,
				...provided.draggableProps,
				...provided.dragHandleProps,
				style: cardStyle,
				onClick: (e) => {
					if (snapshot.isDragging) return;
					const target = e.target;
					if (target.closest("button") || target.closest("a") || target.closest("input")) return;
					if (onOpenDrawer) onOpenDrawer(request);
					else router.visit(route("requests.show", request.id));
				},
				id: `kanban-card-${request.id}`,
				className: `group relative mb-2.5 rounded-xl border p-3.5 select-none transition-all duration-150 ${snapshot.isDragging ? "border-zinc-500 bg-[#16171f] shadow-2xl shadow-black/80 ring-1 ring-white/20 z-50" : isKeyboardFocused ? "border-violet-500/80 bg-[#181926] ring-2 ring-violet-500/60 shadow-lg shadow-violet-500/10 z-20" : isSelected ? "border-blue-500/80 bg-blue-950/20 shadow-md ring-1 ring-blue-500/30" : "border-white/[0.07] bg-[#111216] hover:border-zinc-700 hover:bg-[#14151a]"}`,
				children: [
					onToggleSelect && /* @__PURE__ */ jsx("div", {
						className: `absolute left-2.5 top-2.5 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`,
						onClick: (e) => {
							e.stopPropagation();
							onToggleSelect(request.id);
						},
						children: /* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: isSelected,
							onChange: () => onToggleSelect(request.id),
							className: "h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shadow-sm"
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: `flex items-start justify-between gap-2.5 ${onToggleSelect && isSelected ? "pl-4" : ""}`,
						children: [/* @__PURE__ */ jsx("p", {
							onClick: (e) => {
								if (onOpenDrawer) {
									e.preventDefault();
									onOpenDrawer(request);
								}
							},
							className: "line-clamp-2 text-xs font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-white",
							children: request.title
						}), /* @__PURE__ */ jsx(Badge, {
							variant: request.priority === "urgent" ? "rose" : statusTone$1[request.status] ?? "zinc",
							dot: request.priority === "urgent",
							className: "shrink-0",
							children: request.priority === "urgent" ? "Urgent" : request.priority_label
						})]
					}),
					request.description && /* @__PURE__ */ jsx("p", {
						className: "mt-2 line-clamp-2 text-[11px] leading-relaxed text-zinc-400",
						children: request.description
					}),
					checklist && /* @__PURE__ */ jsxs("div", {
						className: "mt-2.5 flex items-center gap-2 text-[10px] text-zinc-400",
						children: [/* @__PURE__ */ jsx("div", {
							className: "h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden",
							children: /* @__PURE__ */ jsx("div", {
								className: "h-full bg-emerald-500 rounded-full transition-all",
								style: { width: `${checklist.percentage}%` }
							})
						}), /* @__PURE__ */ jsxs("span", {
							className: "font-mono",
							children: [
								checklist.completed,
								"/",
								checklist.total
							]
						})]
					}),
					(request.due_date && request.due_human || request.tags && request.tags.length > 0) && /* @__PURE__ */ jsxs("div", {
						className: "mt-2.5 flex flex-wrap items-center gap-1.5",
						children: [request.due_date && /* @__PURE__ */ jsxs("span", {
							className: `inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${request.is_overdue ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : request.due_human === "Due today" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-zinc-700/50 bg-zinc-800/80 text-zinc-400"}`,
							children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${request.is_overdue ? "bg-rose-400" : request.due_human === "Due today" ? "bg-amber-400" : "bg-zinc-500"}` }), /* @__PURE__ */ jsx("span", { children: request.due_human ?? request.due_date })]
						}), request.tags?.map((tag) => /* @__PURE__ */ jsx("span", {
							className: "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] px-1.5 py-0.5 rounded",
							children: tag.startsWith("#") ? tag : `#${tag}`
						}, tag))]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3.5 flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-2.5 text-[11px]",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-1.5 min-w-0 flex-1",
							children: request.project ? /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1.5 min-w-0 max-w-full truncate rounded-md border border-zinc-800 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300",
								children: [/* @__PURE__ */ jsx("span", {
									className: "h-1.5 w-1.5 rounded-full shrink-0",
									style: { backgroundColor: request.project.color ?? "#71717a" }
								}), /* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: request.project.name
								})]
							}) : /* @__PURE__ */ jsx("span", {
								className: "truncate rounded-md border border-zinc-800 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400",
								children: "No project"
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 text-zinc-400 shrink-0",
							children: [
								nextAction && onQuickStatus && !request.is_blocked && /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: (e) => {
										e.preventDefault();
										e.stopPropagation();
										onQuickStatus(request, nextAction.next);
									},
									className: `flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-sm transition-all duration-150 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto cursor-pointer ${nextAction.color}`,
									title: `Move to ${nextAction.label}`,
									children: [/* @__PURE__ */ jsx(nextAction.icon, { className: `h-2.5 w-2.5 ${nextAction.iconClass}` }), /* @__PURE__ */ jsx("span", { children: nextAction.label })]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: (e) => {
										e.preventDefault();
										e.stopPropagation();
										navigator.clipboard.writeText(`${window.location.origin}/requests/${request.id}`);
										toast.success("Link copied");
									},
									className: "hidden sm:inline-flex opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 transition-opacity p-0.5",
									title: "Copy link",
									children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
								}),
								request.files_count ? /* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1 text-[10px] text-zinc-400",
									children: [/* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3 text-zinc-500" }), request.files_count]
								}) : null,
								request.assignee ? /* @__PURE__ */ jsx("div", {
									className: "flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-200 shrink-0",
									title: request.assignee.name,
									children: request.assignee.name.charAt(0)
								}) : /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-zinc-500 shrink-0",
									children: "Unassigned"
								})
							]
						})]
					}),
					request.is_blocked && /* @__PURE__ */ jsxs("div", {
						className: "mt-2.5 flex items-start gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 px-2.5 py-1.5 text-[11px] text-rose-300",
						children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" }), /* @__PURE__ */ jsxs("span", {
							className: "truncate font-medium",
							children: ["Blocked", request.blocked_reason ? ` · ${request.blocked_reason}` : ""]
						})]
					})
				]
			});
		}
	});
}
//#endregion
//#region resources/js/Features/Requests/components/KanbanBoard.tsx
var columnHeaders = {
	new: { dot: "bg-zinc-500" },
	ready: { dot: "bg-blue-400" },
	doing: { dot: "bg-amber-400" },
	review: { dot: "bg-purple-400" },
	done: { dot: "bg-emerald-400" }
};
function KanbanBoard({ requests, statuses, onDragEnd, onQuickStatus, onOpenDrawer, selectedIds, onToggleSelect }) {
	const [collapsedColumns, setCollapsedColumns] = useState(() => {
		if (typeof window !== "undefined") try {
			return JSON.parse(localStorage.getItem("relay_collapsed_columns") || "[]");
		} catch {
			return [];
		}
		return [];
	});
	const toggleColumnCollapse = (columnKey) => {
		setCollapsedColumns((prev) => {
			const next = prev.includes(columnKey) ? prev.filter((k) => k !== columnKey) : [...prev, columnKey];
			if (typeof window !== "undefined") localStorage.setItem("relay_collapsed_columns", JSON.stringify(next));
			return next;
		});
	};
	const columns = useMemo(() => Object.entries(statuses).map(([value, label]) => ({
		value,
		label,
		requests: requests.filter((request) => request.status === value)
	})), [requests, statuses]);
	const [focusedColIndex, setFocusedColIndex] = useState(null);
	const [focusedCardIndex, setFocusedCardIndex] = useState(null);
	const focusedCard = useMemo(() => {
		if (focusedColIndex === null || focusedCardIndex === null) return null;
		const col = columns[focusedColIndex];
		if (!col || !col.requests[focusedCardIndex]) return null;
		return col.requests[focusedCardIndex];
	}, [
		columns,
		focusedColIndex,
		focusedCardIndex
	]);
	useEffect(() => {
		const handleKeyDown = (e) => {
			const target = e.target;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) return;
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const key = e.key;
			if (key === "j" || key === "J") {
				e.preventDefault();
				setFocusedColIndex((prevCol) => {
					let colIdx = prevCol ?? 0;
					if (!columns[colIdx]?.requests.length) {
						const firstWithCards = columns.findIndex((c) => c.requests.length > 0);
						if (firstWithCards !== -1) colIdx = firstWithCards;
					}
					setFocusedCardIndex((prevCard) => {
						const colRequests = columns[colIdx]?.requests || [];
						if (colRequests.length === 0) return null;
						if (prevCard === null) return 0;
						return Math.min(colRequests.length - 1, prevCard + 1);
					});
					return colIdx;
				});
			} else if (key === "k" || key === "K") {
				e.preventDefault();
				setFocusedColIndex((prevCol) => {
					let colIdx = prevCol ?? 0;
					if (!columns[colIdx]?.requests.length) {
						const firstWithCards = columns.findIndex((c) => c.requests.length > 0);
						if (firstWithCards !== -1) colIdx = firstWithCards;
					}
					setFocusedCardIndex((prevCard) => {
						if ((columns[colIdx]?.requests || []).length === 0) return null;
						if (prevCard === null) return 0;
						return Math.max(0, prevCard - 1);
					});
					return colIdx;
				});
			} else if (key === "h" || key === "H") {
				e.preventDefault();
				setFocusedColIndex((prevCol) => {
					const nextCol = Math.max(0, (prevCol ?? 0) - 1);
					setFocusedCardIndex((prevCard) => {
						const targetReqs = columns[nextCol]?.requests || [];
						if (targetReqs.length === 0) return null;
						if (prevCard === null) return 0;
						return Math.min(targetReqs.length - 1, prevCard);
					});
					return nextCol;
				});
			} else if (key === "l" || key === "L") {
				e.preventDefault();
				setFocusedColIndex((prevCol) => {
					const currentCol = prevCol ?? 0;
					const nextCol = Math.min(columns.length - 1, currentCol + 1);
					setFocusedCardIndex((prevCard) => {
						const targetReqs = columns[nextCol]?.requests || [];
						if (targetReqs.length === 0) return null;
						if (prevCard === null) return 0;
						return Math.min(targetReqs.length - 1, prevCard);
					});
					return nextCol;
				});
			} else if (key === " " || key === "Enter") {
				if (focusedCard) {
					e.preventDefault();
					onOpenDrawer(focusedCard);
				}
			} else if (key === "Escape") {
				setFocusedColIndex(null);
				setFocusedCardIndex(null);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		columns,
		focusedCard,
		onOpenDrawer
	]);
	useEffect(() => {
		if (focusedCard) {
			const cardEl = document.getElementById(`kanban-card-${focusedCard.id}`);
			if (cardEl) cardEl.scrollIntoView({
				block: "nearest",
				inline: "nearest",
				behavior: "smooth"
			});
		}
	}, [focusedCard]);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ jsx(DragDropContext, {
			onDragEnd,
			children: /* @__PURE__ */ jsx("div", {
				className: "flex min-w-0 gap-4 overflow-x-auto pb-4",
				children: columns.map((column, colIdx) => {
					const style = columnHeaders[column.value] ?? { dot: "bg-zinc-400" };
					if (collapsedColumns.includes(column.value)) return /* @__PURE__ */ jsxs("div", {
						onClick: () => toggleColumnCollapse(column.value),
						className: "flex min-h-[580px] w-12 shrink-0 flex-col items-center justify-between rounded-xl border border-zinc-800 bg-[#0e1015] py-4 cursor-pointer hover:border-zinc-700 transition-colors shadow-sm select-none",
						title: `Expand ${column.label}`,
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center gap-3",
								children: [/* @__PURE__ */ jsx("span", { className: `h-2.5 w-2.5 rounded-full ${style.dot}` }), /* @__PURE__ */ jsx("span", {
									className: "flex h-5 min-w-5 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-1 text-[10px] font-mono text-zinc-400",
									children: column.requests.length
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "py-8",
								children: /* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold tracking-wider text-zinc-400 uppercase transform -rotate-90 block whitespace-nowrap",
									children: column.label
								})
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "text-zinc-500 hover:text-zinc-300",
								title: "Expand column",
								children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
							})
						]
					}, column.value);
					return /* @__PURE__ */ jsxs("section", {
						className: `flex min-h-[580px] w-[310px] shrink-0 flex-col rounded-xl border p-3 shadow-sm transition-colors ${focusedColIndex === colIdx ? "border-violet-500/30 bg-[#111218]" : "border-white/[0.07] bg-[#111216]"}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-3 flex items-center justify-between border-b border-zinc-800/80 px-1 pb-2.5",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full ${style.dot}` }), /* @__PURE__ */ jsx("h2", {
									className: "text-xs font-semibold uppercase tracking-wider text-zinc-300",
									children: column.label
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "flex h-5 min-w-5 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-1.5 text-[10px] font-medium tabular-nums text-zinc-400",
									children: column.requests.length
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => toggleColumnCollapse(column.value),
									className: "flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors",
									title: "Collapse column",
									children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
								})]
							})]
						}), /* @__PURE__ */ jsx(Droppable, {
							droppableId: column.value,
							children: (provided, snapshot) => /* @__PURE__ */ jsxs("div", {
								ref: provided.innerRef,
								...provided.droppableProps,
								className: `custom-scroll flex-1 rounded-lg p-1 transition-colors duration-150 overflow-y-auto ${snapshot.isDraggingOver ? "bg-zinc-850/50 ring-1 ring-zinc-700/60" : ""}`,
								children: [column.requests.length > 0 ? column.requests.map((request, index) => /* @__PURE__ */ jsx(RequestCard, {
									request,
									index,
									onQuickStatus,
									onOpenDrawer,
									isSelected: selectedIds.has(request.id),
									onToggleSelect,
									isKeyboardFocused: focusedCard?.id === request.id
								}, request.id)) : !snapshot.isDraggingOver ? /* @__PURE__ */ jsx("div", {
									className: "flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-850 px-3 py-16 text-center text-xs text-zinc-600",
									children: /* @__PURE__ */ jsx("span", { children: "Drop cards here" })
								}) : null, provided.placeholder]
							})
						})]
					}, column.value);
				})
			})
		}), requests.some((request) => request.is_blocked) && /* @__PURE__ */ jsx("p", {
			className: "text-center text-[11px] text-zinc-500",
			children: "Blocked requests stay in their normal status column and carry a visible roadblock indicator."
		})]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/RequestListView.tsx
var statusTone = {
	new: "zinc",
	ready: "blue",
	doing: "amber",
	review: "violet",
	done: "emerald"
};
function RequestListView({ requests, onSelectRequest, onQuickStatus, selectedIds = /* @__PURE__ */ new Set(), onToggleSelect, onSelectAll }) {
	const isAllSelected = requests.length > 0 && requests.every((r) => selectedIds.has(r.id));
	const handleSelectAllToggle = () => {
		if (!onSelectAll) return;
		if (isAllSelected) onSelectAll([]);
		else onSelectAll(requests.map((r) => r.id));
	};
	return /* @__PURE__ */ jsx("div", {
		className: "w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#0e1015] shadow-xl",
		children: /* @__PURE__ */ jsx("div", {
			className: "overflow-x-auto custom-scroll",
			children: /* @__PURE__ */ jsxs("table", {
				className: "w-full text-left border-collapse text-xs",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
					className: "border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider",
					children: [
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-4 w-10 text-center",
							children: /* @__PURE__ */ jsx("input", {
								type: "checkbox",
								checked: isAllSelected,
								onChange: handleSelectAllToggle,
								className: "h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
							})
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3 w-28",
							children: "Status"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3",
							children: "Title & Tasks"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3 w-40",
							children: "Initiative"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3 w-28",
							children: "Due Date"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3 w-36",
							children: "Tags"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3 w-28",
							children: "Priority"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3 w-36",
							children: "Assignee"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "py-3 px-3 w-28 text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ jsx("tbody", {
					className: "divide-y divide-zinc-850/60",
					children: requests.length > 0 ? requests.map((req) => {
						const isSelected = selectedIds.has(req.id);
						const checklist = getChecklistStats(req.description);
						const nextAction = req.status === "ready" ? {
							label: "Start",
							icon: Play,
							next: "doing",
							color: "text-blue-300 hover:bg-blue-950/40 border-blue-800/60"
						} : req.status === "doing" ? {
							label: "Review",
							icon: Send,
							next: "review",
							color: "text-violet-300 hover:bg-violet-950/40 border-violet-800/60"
						} : req.status === "review" ? {
							label: "Approve",
							icon: Check,
							next: "done",
							color: "text-emerald-300 hover:bg-emerald-950/40 border-emerald-800/60"
						} : null;
						return /* @__PURE__ */ jsxs("tr", {
							onClick: () => onSelectRequest(req),
							className: `group cursor-pointer transition-colors ${isSelected ? "bg-blue-500/[0.08] hover:bg-blue-500/[0.12]" : "hover:bg-zinc-850/50"}`,
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-center",
									onClick: (e) => {
										e.stopPropagation();
										if (onToggleSelect) onToggleSelect(req.id);
									},
									children: /* @__PURE__ */ jsx("input", {
										type: "checkbox",
										checked: isSelected,
										onChange: () => onToggleSelect && onToggleSelect(req.id),
										className: "h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-3",
									children: /* @__PURE__ */ jsx(Badge, {
										variant: statusTone[req.status] ?? "zinc",
										className: "text-[10px] font-medium",
										children: req.status_label ?? req.status
									})
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-3 min-w-[240px]",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [
											req.is_blocked && /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5 shrink-0 text-rose-400" }),
											/* @__PURE__ */ jsx("span", {
												className: "font-semibold text-zinc-200 group-hover:text-white transition-colors truncate",
												children: req.title
											}),
											req.files_count ? /* @__PURE__ */ jsxs("span", {
												className: "flex items-center gap-0.5 text-[10px] text-zinc-500",
												children: [/* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3" }), req.files_count]
											}) : null
										]
									}), checklist && /* @__PURE__ */ jsxs("div", {
										className: "mt-1 flex items-center gap-2 text-[10px] text-zinc-500",
										children: [/* @__PURE__ */ jsx("div", {
											className: "h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden",
											children: /* @__PURE__ */ jsx("div", {
												className: "h-full bg-emerald-500 rounded-full",
												style: { width: `${checklist.percentage}%` }
											})
										}), /* @__PURE__ */ jsxs("span", { children: [
											checklist.completed,
											"/",
											checklist.total,
											" tasks"
										] })]
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-3",
									children: req.project ? /* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-1.5 truncate rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[11px] font-medium text-zinc-300",
										children: [/* @__PURE__ */ jsx("span", {
											className: "h-1.5 w-1.5 rounded-full shrink-0",
											style: { backgroundColor: req.project.color ?? "#71717a" }
										}), /* @__PURE__ */ jsx("span", {
											className: "truncate",
											children: req.project.name
										})]
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-zinc-500",
										children: "No initiative"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-3",
									children: req.due_date ? /* @__PURE__ */ jsxs("span", {
										className: `inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${req.is_overdue ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : req.due_human === "Due today" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-zinc-700/50 bg-zinc-800/80 text-zinc-400"}`,
										children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${req.is_overdue ? "bg-rose-400" : req.due_human === "Due today" ? "bg-amber-400" : "bg-zinc-500"}` }), /* @__PURE__ */ jsx("span", {
											className: "truncate",
											children: req.due_human ?? req.due_date
										})]
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-zinc-600",
										children: "-"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-3",
									children: req.tags && req.tags.length > 0 ? /* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-1 max-w-[180px]",
										children: [req.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsx("span", {
											className: "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] px-1.5 py-0.5 rounded",
											children: tag.startsWith("#") ? tag : `#${tag}`
										}, tag)), req.tags.length > 3 && /* @__PURE__ */ jsxs("span", {
											className: "text-[10px] text-zinc-500",
											children: ["+", req.tags.length - 3]
										})]
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-[11px] text-zinc-600",
										children: "-"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-3",
									children: /* @__PURE__ */ jsx(Badge, {
										variant: req.priority === "urgent" ? "rose" : "zinc",
										dot: req.priority === "urgent",
										className: "text-[10px]",
										children: req.priority_label
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-3",
									children: req.assignee ? /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("div", {
											className: "flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-200 shrink-0",
											children: req.assignee.name.charAt(0)
										}), /* @__PURE__ */ jsx("span", {
											className: "truncate text-zinc-300 text-[11px]",
											children: req.assignee.name
										})]
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-zinc-500 text-[11px]",
										children: "Unassigned"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-3 text-right",
									children: nextAction && onQuickStatus && !req.is_blocked && /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: (e) => {
											e.stopPropagation();
											onQuickStatus(req, nextAction.next);
										},
										className: `inline-flex items-center gap-1 rounded-md border bg-zinc-900 px-2 py-1 text-[10px] font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${nextAction.color}`,
										children: [/* @__PURE__ */ jsx(nextAction.icon, { className: "h-2.5 w-2.5" }), /* @__PURE__ */ jsx("span", { children: nextAction.label })]
									})
								})
							]
						}, req.id);
					}) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
						colSpan: 9,
						className: "py-12 text-center text-zinc-500",
						children: "No requests found in this view."
					}) })
				})]
			})
		})
	});
}
//#endregion
//#region resources/js/Features/Requests/components/BulkActionBar.tsx
function BulkActionBar({ selectedCount, onClearSelection, onBulkUpdateStatus, onBulkUpdatePriority, onBulkUpdateAssignee, users, statuses, priorities }) {
	const [loading, setLoading] = useState(false);
	if (selectedCount === 0) return null;
	const handleAction = async (fn) => {
		setLoading(true);
		try {
			await fn();
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsx("div", {
		className: "fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-5 duration-200 pointer-events-none",
		children: /* @__PURE__ */ jsxs("div", {
			className: "pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl border border-zinc-750 bg-[#121318]/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 text-xs text-zinc-200",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 pr-2 border-r border-zinc-800",
					children: [/* @__PURE__ */ jsx("span", {
						className: "flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold font-mono text-white px-1",
						children: selectedCount
					}), /* @__PURE__ */ jsx("span", {
						className: "font-semibold text-zinc-100",
						children: "Selected"
					})]
				}),
				loading ? /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 px-3 py-1 text-zinc-400",
					children: [/* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-blue-400" }), /* @__PURE__ */ jsx("span", { children: "Updating..." })]
				}) : /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx(ArrowRightLeft, { className: "h-3.5 w-3.5 text-zinc-400" }), /* @__PURE__ */ jsxs("select", {
							defaultValue: "",
							onChange: (e) => {
								if (e.target.value) handleAction(() => onBulkUpdateStatus(e.target.value));
							},
							className: "rounded-lg border border-zinc-700 bg-zinc-850 px-2 py-1 text-xs text-zinc-200 focus:ring-0 focus:border-zinc-500 cursor-pointer",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								disabled: true,
								children: "Move status..."
							}), Object.entries(statuses).map(([val, label]) => /* @__PURE__ */ jsx("option", {
								value: val,
								children: label
							}, val))]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx(Flame, { className: "h-3.5 w-3.5 text-zinc-400" }), /* @__PURE__ */ jsxs("select", {
							defaultValue: "",
							onChange: (e) => {
								if (e.target.value) handleAction(() => onBulkUpdatePriority(e.target.value));
							},
							className: "rounded-lg border border-zinc-700 bg-zinc-850 px-2 py-1 text-xs text-zinc-200 focus:ring-0 focus:border-zinc-500 cursor-pointer",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								disabled: true,
								children: "Set priority..."
							}), Object.entries(priorities).map(([val, label]) => /* @__PURE__ */ jsx("option", {
								value: val,
								children: label
							}, val))]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ jsx(UserCheck, { className: "h-3.5 w-3.5 text-zinc-400" }), /* @__PURE__ */ jsxs("select", {
							defaultValue: "",
							onChange: (e) => {
								if (e.target.value !== "") {
									const val = e.target.value === "null" ? null : Number(e.target.value);
									handleAction(() => onBulkUpdateAssignee(val));
								}
							},
							className: "rounded-lg border border-zinc-700 bg-zinc-850 px-2 py-1 text-xs text-zinc-200 focus:ring-0 focus:border-zinc-500 cursor-pointer",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "",
									disabled: true,
									children: "Assign to..."
								}),
								/* @__PURE__ */ jsx("option", {
									value: "null",
									children: "Unassigned"
								}),
								users.map((u) => /* @__PURE__ */ jsx("option", {
									value: u.id,
									children: u.name
								}, u.id))
							]
						})]
					})
				] }),
				/* @__PURE__ */ jsx("div", {
					className: "pl-2 border-l border-zinc-800",
					children: /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClearSelection,
						className: "flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
						title: "Deselect all (Esc)",
						children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
					})
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Components/ImageLightbox.tsx
function ImageLightbox({ src, alt, onClose }) {
	const [scale, setScale] = useState(1);
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);
	if (!src) return null;
	const handleZoomIn = (e) => {
		e.stopPropagation();
		setScale((prev) => Math.min(prev + .3, 3));
	};
	const handleZoomOut = (e) => {
		e.stopPropagation();
		setScale((prev) => Math.max(prev - .3, .6));
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in-0 duration-150 select-none",
		onClick: onClose,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "absolute top-4 right-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#121318]/90 p-1.5 shadow-2xl backdrop-blur-md",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: handleZoomOut,
					className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
					title: "Zoom Out",
					children: /* @__PURE__ */ jsx(ZoomOut, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "text-xs font-mono text-zinc-400 px-1",
					children: [Math.round(scale * 100), "%"]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: handleZoomIn,
					className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
					title: "Zoom In",
					children: /* @__PURE__ */ jsx(ZoomIn, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ jsx("a", {
					href: src,
					download: true,
					className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
					title: "Download Image",
					children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ jsx("a", {
					href: src,
					target: "_blank",
					rel: "noreferrer",
					className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
					title: "Open in new tab",
					children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ jsx("div", { className: "h-4 w-[1px] bg-zinc-800 mx-0.5" }),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors",
					title: "Close (Esc)",
					children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "max-h-[85vh] max-w-[90vw] overflow-auto flex items-center justify-center transition-transform duration-150",
			onClick: (e) => e.stopPropagation(),
			children: /* @__PURE__ */ jsx("img", {
				src,
				alt: alt ?? "Attached preview",
				style: { transform: `scale(${scale})` },
				className: "max-h-[82vh] max-w-[88vw] object-contain rounded-xl shadow-2xl transition-transform duration-100 border border-white/10"
			})
		})]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/FileDropZone.tsx
function FileDropZone({ children, onFilesDropped, className = "", disabled = false, label = "Drop files to attach to this request" }) {
	const [dragCounter, setDragCounter] = useState(0);
	const isDragging = dragCounter > 0;
	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;
		if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) setDragCounter((prev) => prev + 1);
	};
	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;
		setDragCounter((prev) => Math.max(0, prev - 1));
	};
	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};
	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragCounter(0);
		if (disabled) return;
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			onFilesDropped(Array.from(e.dataTransfer.files));
			e.dataTransfer.clearData();
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		onDragEnter: handleDragEnter,
		onDragLeave: handleDragLeave,
		onDragOver: handleDragOver,
		onDrop: handleDrop,
		className: `relative ${className}`,
		children: [children, isDragging && /* @__PURE__ */ jsxs("div", {
			className: "absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-500/80 bg-[#0c0d12]/90 backdrop-blur-md p-6 text-center animate-in fade-in-0 duration-150 pointer-events-none",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/40 bg-violet-500/10 text-violet-400 mb-3 shadow-specular animate-bounce",
					children: /* @__PURE__ */ jsx(UploadCloud, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm font-semibold text-white",
					children: label
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs text-zinc-400 mt-1",
					children: "Images, PDFs, or design assets up to 500MB"
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/QuickViewDrawer.tsx
function QuickViewDrawer({ requestId, onClose, onUpdated, projects, users, statuses, priorities }) {
	const [request, setRequest] = useState(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [copied, setCopied] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [lightboxSrc, setLightboxSrc] = useState(null);
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [descriptionDraft, setDescriptionDraft] = useState("");
	useEffect(() => {
		if (!requestId) {
			setRequest(null);
			return;
		}
		let isMounted = true;
		setLoading(true);
		axios.get(route("requests.show", requestId), { headers: { Accept: "application/json" } }).then((res) => {
			if (isMounted) {
				const data = res.data.props?.request ?? res.data.request ?? res.data;
				setRequest(data);
				setDescriptionDraft(data.description ?? "");
			}
		}).catch(() => {}).finally(() => {
			if (isMounted) setLoading(false);
		});
		return () => {
			isMounted = false;
		};
	}, [requestId]);
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);
	if (!requestId) return null;
	const handleCopyLink = () => {
		const url = `${window.location.origin}/requests/${requestId}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		toast.success("Link copied to clipboard");
		setTimeout(() => setCopied(false), 2e3);
	};
	const handlePatch = async (changes) => {
		if (!request) return;
		setSaving(true);
		try {
			const updated = (await axios.patch(route("requests.update", request.id), changes)).data.request ?? {
				...request,
				...changes
			};
			setRequest(updated);
			if (onUpdated) onUpdated(updated);
			toast.success("Updated");
		} catch (err) {
			toast.error(err?.response?.data?.message ?? "Failed to update");
		} finally {
			setSaving(false);
		}
	};
	const handleSaveDescription = async () => {
		setIsEditingDescription(false);
		if (request && descriptionDraft !== request.description) await handlePatch({ description: descriptionDraft });
	};
	const handleToggleChecklist = async (updatedMarkdown) => {
		setDescriptionDraft(updatedMarkdown);
		await handlePatch({ description: updatedMarkdown });
	};
	const uploadFiles = async (files) => {
		if (!files.length || !request) return;
		setSaving(true);
		const formData = new FormData();
		files.forEach((file) => formData.append("files[]", file));
		try {
			const res = await axios.post(route("requests.files.store", request.id), formData, { headers: { "Content-Type": "multipart/form-data" } });
			const updated = res.data.request ?? {
				...request,
				files: [...request.files ?? [], ...res.data.files ?? []]
			};
			setRequest(updated);
			if (onUpdated) onUpdated(updated);
			toast.success(`Uploaded ${files.length} file(s)`);
		} catch (err) {
			toast.error(err?.response?.data?.message ?? "Could not upload files");
		} finally {
			setSaving(false);
		}
	};
	useEffect(() => {
		if (!request) return;
		const handlePaste = (e) => {
			const files = Array.from(e.clipboardData?.files ?? []);
			if (files.length > 0) {
				e.preventDefault();
				uploadFiles(files);
				toast.info("Uploading pasted image from clipboard...");
			}
		};
		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, [request]);
	const handleAddComment = async (e) => {
		e.preventDefault();
		if (!newComment.trim() || !request) return;
		setSaving(true);
		try {
			const updated = (await axios.post(route("requests.comments.store", request.id), { body: newComment })).data.request ?? request;
			setRequest(updated);
			setNewComment("");
			toast.success("Comment added");
		} catch {
			toast.error("Could not post comment");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 overflow-hidden",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200",
				onClick: onClose
			}),
			/* @__PURE__ */ jsx("div", {
				className: "fixed inset-y-0 right-0 flex max-w-full pl-10",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-screen max-w-xl bg-[#0e1015] border-l border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/40 shrink-0",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 min-w-0",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs font-mono font-medium text-zinc-400",
									children: ["#", requestId]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-zinc-600",
									children: "·"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "truncate text-xs text-zinc-400 font-medium",
									children: request?.project?.name ?? "No Project"
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: handleCopyLink,
									className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
									title: "Copy direct link",
									children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ jsx(Link, {
									href: route("requests.show", requestId),
									className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
									title: "Open full page",
									children: /* @__PURE__ */ jsx(Maximize2, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ jsx("div", { className: "h-4 w-[1px] bg-zinc-800 mx-1" }),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: onClose,
									className: "flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors",
									title: "Close (Esc)",
									children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
								})
							]
						})]
					}), /* @__PURE__ */ jsx(FileDropZone, {
						onFilesDropped: uploadFiles,
						label: "Drop files to attach to this request",
						className: "flex-1 flex flex-col min-h-0 overflow-hidden",
						children: /* @__PURE__ */ jsx("div", {
							className: "flex-1 overflow-y-auto custom-scroll p-6 space-y-6",
							children: loading && !request ? /* @__PURE__ */ jsxs("div", {
								className: "space-y-4 animate-pulse",
								children: [
									/* @__PURE__ */ jsx("div", { className: "h-7 w-3/4 rounded-lg bg-zinc-800/60" }),
									/* @__PURE__ */ jsx("div", { className: "h-20 w-full rounded-xl bg-zinc-800/40" }),
									/* @__PURE__ */ jsx("div", { className: "h-32 w-full rounded-xl bg-zinc-800/40" })
								]
							}) : request ? /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3 p-3 rounded-xl border border-zinc-800/80 bg-[#121318]/60",
									children: [
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1",
											children: "Status"
										}), /* @__PURE__ */ jsx("select", {
											value: request.status,
											onChange: (e) => handlePatch({ status: e.target.value }),
											className: "w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0",
											children: Object.entries(statuses).map(([val, label]) => /* @__PURE__ */ jsx("option", {
												value: val,
												children: label
											}, val))
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1",
											children: "Priority"
										}), /* @__PURE__ */ jsx("select", {
											value: request.priority,
											onChange: (e) => handlePatch({ priority: e.target.value }),
											className: "w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0",
											children: Object.entries(priorities).map(([val, label]) => /* @__PURE__ */ jsx("option", {
												value: val,
												children: label
											}, val))
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1",
											children: "Assignee"
										}), /* @__PURE__ */ jsxs("select", {
											value: request.assignee_id ?? "",
											onChange: (e) => handlePatch({ assignee_id: e.target.value ? Number(e.target.value) : null }),
											className: "w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0",
											children: [/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Unassigned"
											}), users.map((u) => /* @__PURE__ */ jsx("option", {
												value: u.id,
												children: u.name
											}, u.id))]
										})] }),
										/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1",
											children: "Initiative"
										}), /* @__PURE__ */ jsxs("select", {
											value: request.area_id ?? "",
											onChange: (e) => handlePatch({ area_id: e.target.value ? Number(e.target.value) : null }),
											className: "w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0",
											children: [/* @__PURE__ */ jsx("option", {
												value: "",
												children: "No Initiative"
											}), projects.map((p) => /* @__PURE__ */ jsx("option", {
												value: p.id,
												children: p.name
											}, p.id))]
										})] })
									]
								}),
								request.is_blocked && /* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/20 p-3 text-xs text-rose-300",
									children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 shrink-0 text-rose-400 mt-0.5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "font-semibold text-rose-200",
										children: "Roadblock Flagged"
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-0.5 text-zinc-400",
										children: request.blocked_reason || "Work is blocked."
									})] })]
								}),
								/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h2", {
									className: "text-lg font-bold text-white tracking-tight leading-snug",
									children: request.title
								}) }),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs font-semibold text-zinc-300",
											children: "Description & Tasks"
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => {
												if (isEditingDescription) handleSaveDescription();
												else setIsEditingDescription(true);
											},
											className: "text-[11px] font-medium text-zinc-400 hover:text-white transition-colors",
											children: isEditingDescription ? "Done" : "Edit text"
										})]
									}), isEditingDescription ? /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx("textarea", {
											rows: 5,
											value: descriptionDraft,
											onChange: (e) => setDescriptionDraft(e.target.value),
											className: "w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-200 focus:border-zinc-500 focus:ring-0 font-sans",
											placeholder: "Add Markdown description or checklist tasks with '- [ ] Task name'..."
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex justify-end gap-2",
											children: [/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setIsEditingDescription(false),
												className: "px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200",
												children: "Cancel"
											}), /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: handleSaveDescription,
												className: "rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700",
												children: "Save Description"
											})]
										})]
									}) : /* @__PURE__ */ jsx("div", {
										className: "rounded-xl border border-zinc-800 bg-[#121318]/50 p-3.5",
										children: request.description ? /* @__PURE__ */ jsx(MarkdownViewer, {
											content: request.description,
											onToggleChecklist: handleToggleChecklist
										}) : /* @__PURE__ */ jsx("p", {
											onClick: () => setIsEditingDescription(true),
											className: "text-xs text-zinc-500 italic cursor-pointer hover:text-zinc-400",
											children: "No description. Click to add details or interactive checklists..."
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "text-xs font-semibold text-zinc-300",
											children: [
												"Attachments (",
												request.files?.length ?? 0,
												")"
											]
										}), /* @__PURE__ */ jsxs("label", {
											className: "flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors",
											children: [
												/* @__PURE__ */ jsx(UploadCloud, { className: "h-3 w-3 text-violet-400" }),
												/* @__PURE__ */ jsx("span", { children: "+ Add Files" }),
												/* @__PURE__ */ jsx("input", {
													type: "file",
													multiple: true,
													className: "hidden",
													onChange: (e) => uploadFiles(Array.from(e.target.files ?? []))
												})
											]
										})]
									}), request.files && request.files.length > 0 ? /* @__PURE__ */ jsx("div", {
										className: "grid grid-cols-3 gap-2",
										children: request.files.map((file) => {
											const isImage = file.mime_type?.startsWith("image/");
											return /* @__PURE__ */ jsxs("div", {
												onClick: () => isImage && file.url && setLightboxSrc(file.url),
												className: `group relative rounded-lg border border-zinc-800 bg-zinc-850 overflow-hidden p-2 text-left transition-colors hover:border-zinc-700 ${isImage ? "cursor-pointer" : ""}`,
												children: [isImage ? /* @__PURE__ */ jsx("div", {
													className: "h-16 w-full rounded bg-zinc-900 mb-1.5 overflow-hidden",
													children: /* @__PURE__ */ jsx("img", {
														src: file.url || "",
														alt: file.original_name,
														className: "h-full w-full object-cover group-hover:scale-105 transition-transform duration-150"
													})
												}) : /* @__PURE__ */ jsx("div", {
													className: "h-16 w-full rounded bg-zinc-900 mb-1.5 flex items-center justify-center text-zinc-500",
													children: /* @__PURE__ */ jsx(Paperclip, { className: "h-5 w-5" })
												}), /* @__PURE__ */ jsx("p", {
													className: "truncate text-[10px] font-medium text-zinc-300",
													children: file.original_name
												})]
											}, file.id);
										})
									}) : /* @__PURE__ */ jsx("div", {
										className: "rounded-xl border border-dashed border-zinc-800 bg-[#121318]/40 p-3 text-center",
										children: /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-zinc-500",
											children: "No attachments. Drag files or paste images (⌘V) here."
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-3 pt-2 border-t border-zinc-800",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5 text-zinc-400" }), /* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-zinc-300",
												children: "Comments & Activity"
											})]
										}),
										request.comments && request.comments.length > 0 ? /* @__PURE__ */ jsx("div", {
											className: "space-y-2.5",
											children: request.comments.map((c) => /* @__PURE__ */ jsxs("div", {
												className: "rounded-xl border border-zinc-850 bg-[#121318]/70 p-3 text-xs",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center justify-between text-[11px] mb-1",
													children: [/* @__PURE__ */ jsx("span", {
														className: "font-semibold text-zinc-200",
														children: c.user?.name ?? "User"
													}), /* @__PURE__ */ jsx("span", {
														className: "text-zinc-500 font-mono",
														children: c.created_at ? new Date(c.created_at).toLocaleDateString([], {
															month: "short",
															day: "numeric"
														}) : ""
													})]
												}), /* @__PURE__ */ jsx("p", {
													className: "text-zinc-300 leading-relaxed whitespace-pre-wrap",
													children: c.body
												})]
											}, c.id))
										}) : /* @__PURE__ */ jsx("p", {
											className: "text-xs text-zinc-500 italic",
											children: "No comments yet."
										}),
										/* @__PURE__ */ jsxs("form", {
											onSubmit: handleAddComment,
											className: "flex gap-2",
											children: [/* @__PURE__ */ jsx("input", {
												type: "text",
												value: newComment,
												onChange: (e) => setNewComment(e.target.value),
												placeholder: "Write a comment...",
												className: "flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:border-zinc-500 focus:ring-0"
											}), /* @__PURE__ */ jsx("button", {
												type: "submit",
												disabled: saving || !newComment.trim(),
												className: "flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors",
												children: /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" })
											})]
										})
									]
								})
							] }) : /* @__PURE__ */ jsx("p", {
								className: "text-xs text-zinc-500",
								children: "Request not found."
							})
						})
					})]
				})
			}),
			/* @__PURE__ */ jsx(ImageLightbox, {
				src: lightboxSrc,
				onClose: () => setLightboxSrc(null)
			})
		]
	});
}
//#endregion
//#region resources/js/lib/toast.tsx
function ToastPill({ id, icon, title, description, action }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a0f]/95 p-3.5 text-zinc-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9)] shadow-specular backdrop-blur-xl ring-1 ring-white/[0.04]",
		children: [
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" }),
			/* @__PURE__ */ jsx("div", {
				className: "flex shrink-0 items-center justify-center",
				children: icon
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs font-semibold text-zinc-100 leading-snug",
					children: title
				}), description && /* @__PURE__ */ jsx("p", {
					className: "mt-0.5 text-[11px] text-zinc-400 leading-snug",
					children: description
				})]
			}),
			action && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					action.onClick();
					toast$1.dismiss(id);
				},
				className: `shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${action.variant === "undo" ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 hover:text-cyan-200" : "border border-violet-500/40 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 hover:text-white"}`,
				children: action.label
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => toast$1.dismiss(id),
				className: "shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300",
				"aria-label": "Dismiss toast",
				children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
			})
		]
	});
}
function notifySuccess(title, description) {
	return toast$1.custom((id) => /* @__PURE__ */ jsx(ToastPill, {
		id,
		title,
		description,
		icon: /* @__PURE__ */ jsx("div", {
			className: "flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
			children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" })
		})
	}));
}
function notifyError(title, description) {
	return toast$1.custom((id) => /* @__PURE__ */ jsx(ToastPill, {
		id,
		title,
		description,
		icon: /* @__PURE__ */ jsx("div", {
			className: "flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400",
			children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" })
		})
	}));
}
//#endregion
//#region resources/js/Features/Requests/components/Create/SingleRequestForm.tsx
function SingleRequestForm({ projects = [], users = [], onClose, onFinished, show = true }) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [areaId, setAreaId] = useState(projects[0] ? String(projects[0].id) : "");
	const [priority, setPriority] = useState("normal");
	const [assigneeId, setAssigneeId] = useState("");
	const [files, setFiles] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [quickError, setQuickError] = useState(null);
	useEffect(() => {
		if (projects.length > 0 && !areaId) setAreaId(String(projects[0].id));
	}, [projects, areaId]);
	useEffect(() => {
		if (!show) return;
		const handlePaste = (e) => {
			const items = e.clipboardData?.items;
			if (!items) return;
			const newFiles = [];
			for (let i = 0; i < items.length; i++) if (items[i].type.indexOf("image") !== -1) {
				const blob = items[i].getAsFile();
				if (blob) newFiles.push(new File([blob], `screenshot-${Date.now()}.png`, { type: blob.type }));
			}
			if (newFiles.length > 0) {
				setFiles((prev) => [...prev, ...newFiles]);
				notifySuccess(`Attached ${newFiles.length} screenshot(s) from clipboard`);
			}
		};
		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, [show]);
	const resetQuickForm = () => {
		setTitle("");
		setDescription("");
		setFiles([]);
		setAssigneeId("");
		setPriority("normal");
		setQuickError(null);
	};
	const submitQuick = async (e) => {
		if (e) e.preventDefault();
		if (!title.trim() || !areaId || submitting) return;
		setSubmitting(true);
		setQuickError(null);
		try {
			const payload = { requests: [{
				client_index: 0,
				title: title.trim(),
				description: description.trim() || null,
				area_id: parseInt(areaId, 10),
				priority,
				assignee_id: assigneeId ? parseInt(assigneeId, 10) : null
			}] };
			const first = ((await axios.post(route("requests.bulk"), payload)).data.results ?? [])[0];
			if (first && first.success && first.request?.id) {
				if (files.length > 0) {
					const formData = new FormData();
					files.forEach((file) => formData.append("files[]", file));
					await axios.post(route("requests.files.store", first.request.id), formData, { headers: { "Content-Type": "multipart/form-data" } });
				}
				notifySuccess("Work request created", `#REQ-${first.request.id}: ${title.trim().slice(0, 45)}`);
				resetQuickForm();
				onFinished();
				onClose();
			} else {
				const err = first?.errors ? Object.values(first.errors).flat().join(", ") : "Failed to create request.";
				setQuickError(err);
				notifyError("Creation failed", err);
			}
		} catch (err) {
			const message = isAxiosError(err) ? err.response?.data?.message ?? "Could not create work request." : "Could not create work request.";
			setQuickError(message);
			notifyError("Creation failed", message);
		} finally {
			setSubmitting(false);
		}
	};
	const handleKeyDown = (e) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			submitQuick();
		}
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submitQuick,
		onKeyDown: handleKeyDown,
		className: "mt-5 space-y-4",
		children: [
			quickError && /* @__PURE__ */ jsxs("div", {
				className: "flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 backdrop-blur-sm",
				children: [/* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-rose-400" }), /* @__PURE__ */ jsx("span", {
					className: "flex-1 font-medium leading-relaxed",
					children: quickError
				})]
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
				className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
				children: ["Request Title ", /* @__PURE__ */ jsx("span", {
					className: "text-rose-400",
					children: "*"
				})]
			}), /* @__PURE__ */ jsx("input", {
				required: true,
				autoFocus: true,
				value: title,
				onChange: (e) => setTitle(e.target.value),
				placeholder: "e.g. Hide timer after wrong answer or reveal",
				className: "mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2.5 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-specular transition-all"
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
				className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
				children: ["Project / Initiative ", /* @__PURE__ */ jsx("span", {
					className: "text-rose-400",
					children: "*"
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: projects.map((proj) => {
					const isSelected = areaId === String(proj.id);
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setAreaId(String(proj.id)),
						className: `flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-left ${isSelected ? "border-violet-500/50 bg-violet-500/20 text-white shadow-specular ring-1 ring-violet-500/20" : "border-white/[0.08] bg-[#07090e]/70 text-zinc-400 hover:border-white/[0.15] hover:bg-white/[0.03] hover:text-white"}`,
						children: [/* @__PURE__ */ jsx(FolderKanban, { className: `h-3.5 w-3.5 shrink-0 ${isSelected ? "text-violet-400" : "text-zinc-500"}` }), /* @__PURE__ */ jsx("span", {
							className: "truncate",
							children: proj.name
						})]
					}, proj.id);
				})
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
					className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
					children: "Priority Level"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-1.5 grid grid-cols-3 gap-2",
					children: [
						{
							id: "urgent",
							label: "Urgent",
							dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
						},
						{
							id: "normal",
							label: "Normal",
							dot: "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
						},
						{
							id: "low",
							label: "Low",
							dot: "bg-zinc-400"
						}
					].map((p) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setPriority(p.id),
						className: `flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${priority === p.id ? "border-violet-500/50 bg-violet-500/20 text-white shadow-specular ring-1 ring-violet-500/20" : "border-white/[0.08] bg-[#07090e]/80 text-zinc-400 hover:border-white/[0.15] hover:text-white"}`,
						children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${p.dot}` }), /* @__PURE__ */ jsx("span", { children: p.label })]
					}, p.id))
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
					className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
					children: "Assignee (Optional)"
				}), /* @__PURE__ */ jsxs("select", {
					value: assigneeId,
					onChange: (e) => setAssigneeId(e.target.value),
					className: "mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-specular transition-all",
					children: [/* @__PURE__ */ jsx("option", {
						value: "",
						children: "Unassigned"
					}), users.map((user) => /* @__PURE__ */ jsxs("option", {
						value: user.id,
						children: [
							user.name,
							" (@",
							user.username,
							")"
						]
					}, user.id))]
				})] })]
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
				className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
				children: "Description & Details (Optional)"
			}), /* @__PURE__ */ jsx("textarea", {
				rows: 3,
				value: description,
				onChange: (e) => setDescription(e.target.value),
				placeholder: "Describe acceptance criteria or replication steps...",
				className: "mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-specular transition-all"
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("label", {
					className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
					children: "Visual Attachments"
				}), /* @__PURE__ */ jsx("span", {
					className: "text-[10px] text-zinc-500",
					children: "Tip: Paste screenshot with ⌘V"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-1.5 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ jsxs("label", {
					className: "flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-white",
					children: [
						/* @__PURE__ */ jsx(UploadCloud, { className: "h-4 w-4 text-violet-400" }),
						/* @__PURE__ */ jsx("input", {
							type: "file",
							multiple: true,
							accept: "image/*,video/*",
							className: "hidden",
							onChange: (e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
						}),
						/* @__PURE__ */ jsx("span", { children: "Upload files" })
					]
				}), files.length > 0 && /* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-2",
					children: files.map((file, idx) => /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-cyan-300",
						children: [
							/* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3" }),
							/* @__PURE__ */ jsx("span", {
								className: "max-w-[140px] truncate",
								children: file.name
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setFiles((prev) => prev.filter((_, i) => i !== idx)),
								className: "ml-1 text-zinc-500 hover:text-rose-400 transition-colors",
								children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
							})
						]
					}, idx))
				})]
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5 text-[11px] text-zinc-400",
					children: [
						/* @__PURE__ */ jsx("kbd", {
							className: "rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300",
							children: "⌘"
						}),
						/* @__PURE__ */ jsx("kbd", {
							className: "rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300",
							children: "Enter"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "ml-0.5 text-zinc-500",
							children: "to submit"
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors",
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						disabled: submitting || !title.trim() || !areaId,
						type: "submit",
						className: "flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.35)] shadow-specular transition-all hover:from-violet-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50",
						children: submitting ? "Creating..." : "Create Request"
					})]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/Create/BulkSpreadsheetForm.tsx
function emptyRow(projects) {
	return {
		title: "",
		description: "",
		area_id: projects[0] ? String(projects[0].id) : "",
		priority: "normal",
		files: []
	};
}
function BulkSpreadsheetForm({ projects = [], onClose, onFinished }) {
	const [rows, setRows] = useState([emptyRow(projects)]);
	const [bulkResult, setBulkResult] = useState(null);
	const [rowResults, setRowResults] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const updateRow = (index, values) => {
		setRows((current) => current.map((row, rowIndex) => rowIndex === index ? {
			...row,
			...values
		} : row));
	};
	const submitBulk = async (event) => {
		if (event) event.preventDefault();
		if (submitting || rows.length === 0) return;
		setSubmitting(true);
		setBulkResult(null);
		const results = [];
		try {
			const chunkSize = 25;
			for (let start = 0; start < rows.length; start += chunkSize) {
				const chunk = rows.slice(start, start + chunkSize).map((row, offset) => ({
					client_index: start + offset,
					title: row.title,
					description: row.description,
					area_id: row.area_id,
					priority: row.priority
				}));
				const response = await axios.post(route("requests.bulk"), { requests: chunk });
				results.push(...response.data.results ?? []);
			}
			for (const item of results.filter((entry) => entry.success)) {
				const rowFiles = rows[item.index]?.files ?? [];
				if (rowFiles.length === 0 || !item.request?.id) continue;
				const formData = new FormData();
				rowFiles.forEach((file) => formData.append("files[]", file));
				await axios.post(route("requests.files.store", item.request.id), formData, { headers: { "Content-Type": "multipart/form-data" } });
			}
			const failed = results.filter((entry) => !entry.success).length;
			const created = results.length - failed;
			setBulkResult({
				created,
				failed
			});
			setRowResults(results);
			if (failed === 0) {
				notifySuccess("Batch creation complete", `Created all ${results.length} work request(s) successfully.`);
				onFinished();
				onClose();
			} else {
				notifyError("Batch completed with issues", `${failed} of ${results.length} requests failed. Please inspect errors.`);
				setRows((current) => current.filter((_, index) => results.some((entry) => !entry.success && entry.index === index)));
			}
		} catch {
			setBulkResult({
				created: 0,
				failed: rows.length
			});
			setRowResults(rows.map((_, index) => ({
				index,
				success: false,
				errors: { row: ["The request could not be created."] }
			})));
			notifyError("Batch failed", "Could not process bulk submission.");
		} finally {
			setSubmitting(false);
		}
	};
	const handleKeyDown = (e) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			submitBulk();
		}
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submitBulk,
		onKeyDown: handleKeyDown,
		className: "mt-5 space-y-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#07090e]/60 px-4 py-2 text-xs text-zinc-400",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4 text-violet-400" }),
						/* @__PURE__ */ jsx("span", {
							className: "font-medium text-zinc-300",
							children: "Matrix Row Editor"
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300",
							children: [
								rows.length,
								" ",
								rows.length === 1 ? "ticket" : "tickets"
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex items-center gap-2 text-[11px] text-zinc-500",
					children: /* @__PURE__ */ jsxs("span", { children: [
						"Press ",
						/* @__PURE__ */ jsx("kbd", {
							className: "rounded border border-white/[0.1] bg-white/[0.04] px-1 py-0.5 font-mono text-[10px] text-zinc-300",
							children: "⌘Enter"
						}),
						" to submit"
					] })
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "custom-scroll max-h-[50vh] space-y-3.5 overflow-y-auto pr-1.5",
				children: rows.map((row, index) => {
					const rowErrorEntry = rowResults.find((r) => r.index === index && !r.success);
					const rowErrorMessage = rowErrorEntry?.errors ? Object.values(rowErrorEntry.errors).flat().join(", ") : null;
					return /* @__PURE__ */ jsxs("div", {
						className: `rounded-2xl border bg-[#07090e]/80 p-4 shadow-specular transition-all ${rowErrorMessage ? "border-rose-500/40 ring-1 ring-rose-500/20" : "border-white/[0.08] hover:border-white/[0.15]"}`,
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "mb-2.5 flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "flex h-5 w-5 items-center justify-center rounded-md border border-violet-500/30 bg-violet-500/10 text-[10px] font-bold text-violet-300",
										children: index + 1
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
										children: "Ticket Item"
									})]
								}), rows.length > 1 && /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setRows((cur) => cur.filter((_, rIdx) => rIdx !== index)),
									className: "flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors",
									children: [/* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Remove" })]
								})]
							}),
							rowErrorMessage && /* @__PURE__ */ jsxs("div", {
								className: "mb-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300",
								children: [/* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" }), /* @__PURE__ */ jsx("span", {
									className: "font-medium leading-snug",
									children: rowErrorMessage
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid gap-2.5 sm:grid-cols-[1fr_170px_130px]",
								children: [
									/* @__PURE__ */ jsx("input", {
										required: true,
										value: row.title,
										onChange: (e) => updateRow(index, { title: e.target.value }),
										placeholder: "Ticket title or summary...",
										className: "rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
									}),
									/* @__PURE__ */ jsxs("select", {
										value: row.area_id,
										onChange: (e) => updateRow(index, { area_id: e.target.value }),
										className: "rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3 py-2 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all",
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Select Project"
										}), projects.map((proj) => /* @__PURE__ */ jsx("option", {
											value: proj.id,
											children: proj.name
										}, proj.id))]
									}),
									/* @__PURE__ */ jsxs("select", {
										value: row.priority,
										onChange: (e) => updateRow(index, { priority: e.target.value }),
										className: "rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3 py-2 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all",
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "urgent",
												children: "🔴 Urgent"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "normal",
												children: "🔵 Normal"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "low",
												children: "⚪ Low"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ jsx("textarea", {
								value: row.description,
								onChange: (e) => updateRow(index, { description: e.target.value }),
								placeholder: "Details or acceptance criteria (optional)...",
								rows: 2,
								className: "mt-2.5 w-full rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-2.5 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ jsxs("label", {
									className: "flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-white",
									children: [
										/* @__PURE__ */ jsx(UploadCloud, { className: "h-3.5 w-3.5 text-violet-400" }),
										/* @__PURE__ */ jsx("span", { children: "Attach files" }),
										/* @__PURE__ */ jsx("input", {
											type: "file",
											multiple: true,
											className: "hidden",
											onChange: (e) => {
												const newFiles = Array.from(e.target.files ?? []);
												if (newFiles.length > 0) updateRow(index, { files: [...row.files ?? [], ...newFiles] });
											}
										})
									]
								}), row.files && row.files.length > 0 && /* @__PURE__ */ jsx("div", {
									className: "flex flex-wrap gap-1.5",
									children: row.files.map((file, fIdx) => /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-cyan-300",
										children: [
											/* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3 text-cyan-400" }),
											/* @__PURE__ */ jsx("span", {
												className: "max-w-[120px] truncate",
												children: file.name
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => updateRow(index, { files: row.files.filter((_, i) => i !== fIdx) }),
												className: "ml-0.5 text-zinc-500 hover:text-rose-400 transition-colors",
												children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
											})
										]
									}, fIdx))
								})]
							})
						]
					}, index);
				})
			}),
			bulkResult && /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#07090e]/90 p-3 text-xs text-zinc-200 shadow-specular",
				children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-400 shrink-0" }), /* @__PURE__ */ jsxs("span", { children: [
					"Created ",
					/* @__PURE__ */ jsx("strong", {
						className: "text-white font-semibold",
						children: bulkResult.created
					}),
					" request(s) successfully.",
					bulkResult.failed > 0 && /* @__PURE__ */ jsxs("span", {
						className: "text-rose-400 ml-1",
						children: [
							"(",
							bulkResult.failed,
							" failed)"
						]
					})
				] })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setRows((cur) => [...cur, emptyRow(projects)]),
					className: "flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all active:scale-[0.98]",
					children: [/* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Add Row" })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors",
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						disabled: submitting || rows.some((r) => !r.title.trim() || !r.area_id),
						type: "submit",
						className: "flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.35)] shadow-specular transition-all hover:from-violet-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50",
						children: submitting ? "Creating..." : `Create ${rows.length} ${rows.length === 1 ? "Ticket" : "Tickets"}`
					})]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/QuickCreateModal.tsx
function QuickCreateModal({ show, onClose, projects = [], users = [], onFinished }) {
	const [mode, setMode] = useState("quick");
	return /* @__PURE__ */ jsx(Modal, {
		show,
		onClose,
		maxWidth: "2xl",
		children: /* @__PURE__ */ jsxs("div", {
			className: "p-6 sm:p-7",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300",
						children: /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ jsx("h2", {
						className: "text-base font-bold text-white",
						children: "Create Work Request"
					})]
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-xs text-zinc-400",
					children: mode === "quick" ? "Add a single ticket in seconds with instant screenshot paste." : "Add multiple tickets in batch matrix mode."
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex rounded-xl border border-white/[0.08] bg-[#07090e] p-1 shadow-inner",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setMode("quick"),
								className: `flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${mode === "quick" ? "bg-violet-500/20 text-violet-300 shadow-specular" : "text-zinc-400 hover:text-white"}`,
								children: [/* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Quick Add" })]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setMode("bulk"),
								className: `flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${mode === "bulk" ? "bg-violet-500/20 text-violet-300 shadow-specular" : "text-zinc-400 hover:text-white"}`,
								children: [/* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Batch (Matrix)" })]
							})]
						}),
						/* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400",
							children: /* @__PURE__ */ jsx("kbd", { children: "Esc" })
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors",
							children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
						})
					]
				})]
			}), mode === "quick" ? /* @__PURE__ */ jsx(SingleRequestForm, {
				show,
				projects,
				users,
				onClose,
				onFinished
			}) : /* @__PURE__ */ jsx(BulkSpreadsheetForm, {
				projects,
				onClose,
				onFinished
			})]
		})
	});
}
//#endregion
//#region resources/js/Features/Requests/components/Detail/RequestHeroHeader.tsx
var pipelineStages = [
	{
		key: "new",
		label: "1. New"
	},
	{
		key: "ready",
		label: "2. Ready"
	},
	{
		key: "doing",
		label: "3. Doing"
	},
	{
		key: "review",
		label: "4. Review"
	},
	{
		key: "done",
		label: "5. Done"
	}
];
var dateLabel$1 = (date) => date ? new Intl.DateTimeFormat(void 0, {
	dateStyle: "medium",
	timeStyle: "short"
}).format(new Date(date)) : "";
function RequestHeroHeader({ request, canEdit, canDelete, saving, onUpdate, onDelete }) {
	const [copied, setCopied] = useState(false);
	const [duplicating, setDuplicating] = useState(false);
	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		toast.success("Ticket link copied to clipboard");
		setTimeout(() => setCopied(false), 2e3);
	};
	const handleDuplicate = () => {
		if (!window.confirm(`Duplicate work request "#REQ-${request.id}"?`)) return;
		setDuplicating(true);
		router.post(route("requests.clone", request.id), {}, {
			onSuccess: () => {
				toast.success("Work request duplicated successfully");
			},
			onError: () => {
				toast.error("Failed to duplicate work request");
				setDuplicating(false);
			},
			onFinish: () => {
				setDuplicating(false);
			}
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border border-white/[0.08] bg-[#0d1322]/80 p-5 shadow-specular backdrop-blur-xl sm:p-6 space-y-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#07090e]/80 p-1",
				children: pipelineStages.map((st) => {
					const active = request.status === st.key;
					return /* @__PURE__ */ jsx("button", {
						type: "button",
						disabled: !canEdit,
						onClick: () => onUpdate({ status: st.key }),
						className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${active ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-specular" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`,
						children: st.label
					}, st.key);
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					request.status === "ready" && canEdit && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onUpdate({ status: "doing" }),
						className: "flex items-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition-all shadow-specular",
						children: [/* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5 fill-current" }), /* @__PURE__ */ jsx("span", { children: "Start Work" })]
					}),
					request.status === "doing" && canEdit && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onUpdate({ status: "review" }),
						className: "flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 px-3.5 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition-all shadow-specular",
						children: [/* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Submit for Review" })]
					}), !request.is_blocked && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => {
							const reason = window.prompt("Why is this task blocked?");
							if (reason) onUpdate({
								is_blocked: true,
								blocked_reason: reason
							});
						},
						className: "flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-all",
						children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Flag Blocked" })]
					})] }),
					request.status === "review" && canEdit && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onUpdate({ status: "done" }),
						className: "flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all shadow-specular",
						children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Approve & Finish" })]
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onUpdate({ status: "doing" }),
						className: "flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all",
						children: /* @__PURE__ */ jsx("span", { children: "Request Changes" })
					})] }),
					canDelete && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: onDelete,
						className: "flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:border-rose-400 hover:bg-rose-600 hover:text-white",
						title: "Delete ticket",
						children: [/* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "Delete"
						})]
					})
				]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap items-start justify-between gap-4",
			children: /* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ jsx(Badge, {
								variant: request.priority === "urgent" ? "rose" : "violet",
								dot: request.priority === "urgent",
								children: request.priority_label
							}),
							/* @__PURE__ */ jsx("span", {
								className: "rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300",
								children: request.project?.name ?? "No project"
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: handleCopyLink,
								className: "flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-zinc-400 hover:border-white/[0.15] hover:text-white transition-colors",
								title: "Copy ticket link",
								children: [copied ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: copied ? "Copied" : "Share" })]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: handleDuplicate,
								disabled: duplicating,
								className: "flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-zinc-400 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300 transition-colors disabled:opacity-50",
								title: "Duplicate this ticket",
								children: [/* @__PURE__ */ jsx(Copy, { className: "h-3 w-3 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: duplicating ? "Duplicating…" : "Duplicate" })]
							})
						]
					}),
					canEdit ? /* @__PURE__ */ jsx("input", {
						defaultValue: request.title,
						onBlur: (event) => {
							if (event.target.value.trim() && event.target.value !== request.title) onUpdate({ title: event.target.value });
						},
						className: "mt-3 w-full min-w-[280px] border-0 border-b border-transparent bg-transparent px-0 text-2xl font-bold tracking-tight text-white outline-none transition-colors focus:border-violet-500 focus:ring-0 sm:text-3xl",
						placeholder: "Request title"
					}) : /* @__PURE__ */ jsx("h1", {
						className: "mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl",
						children: request.title
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-2.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400",
						children: [
							/* @__PURE__ */ jsxs("span", { children: ["Created ", dateLabel$1(request.created_at)] }),
							/* @__PURE__ */ jsx("span", { children: "·" }),
							/* @__PURE__ */ jsx("span", { children: "Requester:" }),
							/* @__PURE__ */ jsx("span", {
								className: "font-semibold text-zinc-200",
								children: request.requester?.name ?? "Unknown"
							}),
							saving && /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1 text-[11px] text-cyan-300",
								children: [/* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3 animate-spin" }), " Saving…"]
							})
						]
					})
				]
			})
		})]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/Detail/RequestBlockerBanner.tsx
function RequestBlockerBanner({ isBlocked, blockedReason, canEdit, onResolve, relations = [] }) {
	if (!isBlocked) return null;
	const blockers = relations.filter((r) => r.type === "blocks");
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-specular",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300",
					children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-xs font-bold text-amber-300 uppercase tracking-wider",
					children: "Roadblock / Stalled Issue"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-0.5 text-xs text-zinc-200",
					children: blockedReason || "This task is flagged as blocked waiting for dependencies or sign-off."
				})] })]
			}), canEdit && /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: onResolve,
				className: "flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-200 shadow-sm transition-all hover:bg-amber-500/30 active:scale-95",
				children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Resolve Blocker" })]
			})]
		}), blockers.length > 0 && /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center gap-2 border-t border-amber-500/20 pt-2.5",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-[11px] font-semibold text-amber-400",
				children: "Blocked by:"
			}), blockers.map((blocker) => /* @__PURE__ */ jsxs(Link, {
				href: route("requests.show", blocker.related_id),
				className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200 transition-colors hover:border-amber-400 hover:bg-amber-500/20",
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "font-mono font-bold",
						children: ["#REQ-", blocker.related_id]
					}),
					blocker.related?.title && /* @__PURE__ */ jsx("span", {
						className: "max-w-[200px] truncate text-zinc-300",
						children: blocker.related.title
					}),
					blocker.related?.status_label && /* @__PURE__ */ jsx("span", {
						className: "rounded bg-black/40 px-1 text-[9px] text-amber-300",
						children: blocker.related.status_label
					}),
					/* @__PURE__ */ jsx(ExternalLink, { className: "h-2.5 w-2.5 opacity-60" })
				]
			}, blocker.id))]
		})]
	});
}
//#endregion
//#region resources/js/Components/Card.tsx
function Card({ className = "", hoverable = false, glow = false, variant = "default", children }) {
	const variantStyles = {
		default: "bg-[#111216] border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]",
		elevated: "bg-[#14151b] border-white/[0.09] shadow-xl shadow-black/50",
		glass: "bg-[#111216]/90 border-white/[0.07] backdrop-blur-xl",
		subtle: "bg-[#0d0e12] border-zinc-850"
	}[variant];
	return /* @__PURE__ */ jsx("div", {
		className: `relative rounded-xl border ${variantStyles} ${hoverable ? "transition-all duration-150 ease-out hover:border-zinc-700 hover:bg-[#15171d]" : ""} ${glow ? "border-zinc-600 shadow-[0_0_30px_rgba(255,255,255,0.03)]" : ""} ${className}`,
		children
	});
}
//#endregion
//#region resources/js/Features/Requests/components/Detail/RequestDescriptionCard.tsx
function RequestDescriptionCard({ description, canEdit, onUpdate }) {
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [descriptionDraft, setDescriptionDraft] = useState(description ?? "");
	useEffect(() => {
		if (!isEditingDescription) setDescriptionDraft(description ?? "");
	}, [description, isEditingDescription]);
	const handleSave = () => {
		onUpdate({ description: descriptionDraft });
		setIsEditingDescription(false);
	};
	const handleCancel = () => {
		setDescriptionDraft(description ?? "");
		setIsEditingDescription(false);
	};
	const handleToggleEdit = () => {
		if (isEditingDescription) {
			if (descriptionDraft !== (description ?? "")) onUpdate({ description: descriptionDraft });
			setIsEditingDescription(false);
		} else {
			setDescriptionDraft(description ?? "");
			setIsEditingDescription(true);
		}
	};
	return /* @__PURE__ */ jsxs(Card, {
		className: "p-5 sm:p-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-3 flex items-center justify-between border-b border-white/[0.06] pb-3",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-xs font-bold uppercase tracking-wider text-zinc-300",
				children: "Description & Scope"
			}), canEdit && /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: handleToggleEdit,
				className: "flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors",
				children: [/* @__PURE__ */ jsx(Edit3, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: isEditingDescription ? "Done Editing" : "Edit Text" })]
			})]
		}), isEditingDescription && canEdit ? /* @__PURE__ */ jsxs("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ jsx("textarea", {
				value: descriptionDraft,
				onChange: (event) => setDescriptionDraft(event.target.value),
				rows: 6,
				placeholder: "Describe requirements, acceptance criteria, or use - [ ] for checklists…",
				className: "w-full resize-y rounded-xl border border-white/[0.08] bg-[#07090e]/80 p-3.5 text-xs font-mono leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: handleCancel,
					className: "rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors",
					children: "Cancel"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: handleSave,
					className: "rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors shadow-sm",
					children: "Save Description"
				})]
			})]
		}) : /* @__PURE__ */ jsx("div", {
			className: "rounded-xl border border-white/[0.04] bg-[#07090e]/40 p-4",
			children: description ? /* @__PURE__ */ jsx(MarkdownViewer, {
				content: description,
				onToggleChecklist: (updated) => {
					setDescriptionDraft(updated);
					onUpdate({ description: updated });
				}
			}) : /* @__PURE__ */ jsx("p", {
				onClick: () => canEdit && setIsEditingDescription(true),
				className: "text-xs text-zinc-500 italic cursor-pointer hover:text-zinc-400",
				children: "No description provided. Click to add details or interactive checklists..."
			})
		})]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/Detail/RequestMediaGallery.tsx
function formatBytes(bytes, decimals = 1) {
	if (!bytes || bytes === 0) return "0 B";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = [
		"B",
		"KB",
		"MB",
		"GB"
	];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
function RequestMediaGallery({ files, canUpload, uploading, onUploadFiles, onRetry, onOpenLightbox }) {
	return /* @__PURE__ */ jsx(FileDropZone, {
		onFilesDropped: onUploadFiles,
		label: "Drop media or attachments to upload",
		disabled: !canUpload,
		children: /* @__PURE__ */ jsxs(Card, {
			className: "p-5 sm:p-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-xs font-bold uppercase tracking-wider text-zinc-300",
					children: "Media & Attachments"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-0.5 text-[11px] text-zinc-500",
					children: "Documents, PDFs, logs, archives, images, and videos · Up to 500MB"
				})] }), canUpload && /* @__PURE__ */ jsxs("label", {
					className: "flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-violet-400 hover:bg-violet-500/10 hover:text-white",
					children: [
						/* @__PURE__ */ jsx(UploadCloud, { className: "h-3.5 w-3.5 text-violet-400" }),
						/* @__PURE__ */ jsx("input", {
							type: "file",
							multiple: true,
							accept: "image/*,video/*,application/pdf,text/*,application/json,application/zip,application/x-zip-compressed,.pdf,.log,.txt,.json,.zip,.csv,.doc,.docx",
							className: "hidden",
							onChange: (event) => {
								const selected = Array.from(event.target.files ?? []);
								if (selected.length) onUploadFiles(selected);
								event.target.value = "";
							}
						}),
						/* @__PURE__ */ jsx("span", { children: uploading ? "Uploading…" : "+ Add Attachment" })
					]
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: files.length ? files.map((file) => {
					const nameLower = file.original_name.toLowerCase();
					const isPdf = file.mime_type === "application/pdf" || nameLower.endsWith(".pdf");
					const isCodeOrLog = nameLower.endsWith(".log") || nameLower.endsWith(".json") || nameLower.endsWith(".txt") || nameLower.endsWith(".csv") || nameLower.endsWith(".md") || file.mime_type?.includes("json") || file.mime_type?.includes("text");
					const isArchive = nameLower.endsWith(".zip") || nameLower.endsWith(".tar") || nameLower.endsWith(".gz") || file.mime_type?.includes("zip");
					return /* @__PURE__ */ jsxs("div", {
						className: "overflow-hidden rounded-xl border border-white/[0.08] bg-[#07090e]/90 shadow-specular",
						children: [
							file.processing_status === "ready" && file.type === "image" && file.url && /* @__PURE__ */ jsx("div", {
								onClick: () => onOpenLightbox(file.url),
								className: "cursor-pointer overflow-hidden group",
								title: "Click to view full image",
								children: /* @__PURE__ */ jsx("img", {
									src: file.url,
									alt: file.original_name,
									className: "aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
								})
							}),
							file.processing_status === "ready" && file.type === "video" && file.url && /* @__PURE__ */ jsx("video", {
								controls: true,
								poster: file.preview_url ?? void 0,
								className: "aspect-video w-full bg-black object-cover",
								children: /* @__PURE__ */ jsx("source", {
									src: file.url,
									type: "video/mp4"
								})
							}),
							file.type === "document" && /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col justify-between p-4 bg-zinc-900/40 border-b border-white/[0.06] min-h-[110px]",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ jsx("div", {
										className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${isPdf ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : isCodeOrLog ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" : isArchive ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-blue-500/30 bg-blue-500/10 text-blue-400"}`,
										children: isPdf ? /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }) : isCodeOrLog ? /* @__PURE__ */ jsx(FileCode, { className: "h-5 w-5" }) : isArchive ? /* @__PURE__ */ jsx(Archive, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" })
									}), /* @__PURE__ */ jsxs("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-1.5 flex-wrap",
											children: [
												isPdf && /* @__PURE__ */ jsx("span", {
													className: "rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 uppercase tracking-wide border border-rose-500/30",
													children: "PDF"
												}),
												isCodeOrLog && /* @__PURE__ */ jsx("span", {
													className: "rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 uppercase tracking-wide border border-cyan-500/30",
													children: "CODE / LOG"
												}),
												isArchive && /* @__PURE__ */ jsx("span", {
													className: "rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wide border border-amber-500/30",
													children: "ARCHIVE"
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-zinc-500",
													children: formatBytes(file.size)
												})
											]
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-1 truncate text-xs font-medium text-zinc-200",
											title: file.original_name,
											children: file.original_name
										})]
									})]
								}), file.url && /* @__PURE__ */ jsx("div", {
									className: "mt-3 flex justify-end",
									children: /* @__PURE__ */ jsxs("a", {
										href: file.url,
										download: file.original_name,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-violet-400 hover:bg-violet-500/10 hover:text-white",
										children: [/* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Download" })]
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate text-xs font-medium text-zinc-200",
										title: file.original_name,
										children: file.original_name
									}), /* @__PURE__ */ jsx(Badge, {
										variant: file.processing_status === "ready" ? "emerald" : file.processing_status === "failed" ? "rose" : "amber",
										dot: true,
										children: file.processing_status === "ready" ? "Ready" : file.processing_status === "failed" ? "Failed" : "Processing"
									})]
								}), file.processing_status === "failed" && /* @__PURE__ */ jsxs("div", {
									className: "mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300",
									children: [/* @__PURE__ */ jsx("p", { children: file.processing_error || "Processing failed." }), canUpload && /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => onRetry(file.id),
										className: "mt-1.5 flex items-center gap-1 font-semibold text-violet-300 hover:text-white",
										children: [/* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }), " Retry processing"]
									})]
								})]
							})
						]
					}, file.id);
				}) : /* @__PURE__ */ jsxs("div", {
					className: "col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] px-4 py-10 text-center",
					children: [
						/* @__PURE__ */ jsx(Paperclip, { className: "h-6 w-6 text-zinc-600 mb-2" }),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-zinc-500 font-medium",
							children: "No media or attachments attached yet."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-zinc-600 mt-1",
							children: "Drag and drop files, documents, or paste images (⌘V)"
						})
					]
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/Features/Requests/components/Detail/RequestDiscussionSection.tsx
var dateLabel = (date) => date ? new Intl.DateTimeFormat(void 0, {
	dateStyle: "medium",
	timeStyle: "short"
}).format(new Date(date)) : "";
function activityLabel(type) {
	return type.replaceAll("_", " ");
}
function renderCommentBody(text) {
	return text.split(/(@[a-zA-Z0-9_\-\.]+)/g).map((part, index) => {
		if (part.startsWith("@") && part.length > 1) return /* @__PURE__ */ jsx("span", {
			className: "inline-flex items-center bg-violet-500/10 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 rounded font-mono text-xs font-semibold mx-0.5 shadow-sm shadow-violet-500/10",
			children: part
		}, index);
		return part;
	});
}
function RequestDiscussionSection({ activities, canComment, saving, onAddComment, users: propUsers }) {
	const pageProps = usePage().props;
	const users = propUsers || pageProps.users || [];
	const [comment, setComment] = useState("");
	const [mentionOpen, setMentionOpen] = useState(false);
	const [mentionQuery, setMentionQuery] = useState("");
	const [mentionIndex, setMentionIndex] = useState(0);
	const textareaRef = useRef(null);
	const filteredUsers = users.filter((u) => {
		const q = mentionQuery.toLowerCase();
		return u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
	});
	const handleTextChange = (e) => {
		const value = e.target.value;
		const cursor = e.target.selectionStart || 0;
		setComment(value);
		const match = value.slice(0, cursor).match(/@([a-zA-Z0-9_\-\.]*)$/);
		if (match) {
			setMentionOpen(true);
			setMentionQuery(match[1]);
			setMentionIndex(0);
		} else setMentionOpen(false);
	};
	const insertMention = (selectedUser) => {
		const cursor = textareaRef.current?.selectionStart || comment.length;
		const textBeforeCursor = comment.slice(0, cursor);
		const textAfterCursor = comment.slice(cursor);
		const match = textBeforeCursor.match(/@([a-zA-Z0-9_\-\.]*)$/);
		if (match) {
			const prefix = textBeforeCursor.slice(0, match.index);
			const insertion = `@${selectedUser.username} `;
			const newComment = `${prefix}${insertion}${textAfterCursor}`;
			setComment(newComment);
			setMentionOpen(false);
			setTimeout(() => {
				if (textareaRef.current) {
					const newCursor = (match.index || 0) + insertion.length;
					textareaRef.current.focus();
					textareaRef.current.setSelectionRange(newCursor, newCursor);
				}
			}, 0);
		}
	};
	const handleKeyDown = (e) => {
		if (!mentionOpen || filteredUsers.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setMentionIndex((prev) => (prev + 1) % filteredUsers.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setMentionIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
		} else if (e.key === "Enter" || e.key === "Tab") {
			e.preventDefault();
			insertMention(filteredUsers[mentionIndex]);
		} else if (e.key === "Escape") {
			e.preventDefault();
			setMentionOpen(false);
		}
	};
	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!comment.trim() || saving) return;
		const body = comment;
		setComment("");
		setMentionOpen(false);
		await onAddComment(body);
	};
	return /* @__PURE__ */ jsxs(Card, {
		className: "p-5 sm:p-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between border-b border-white/[0.06] pb-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 text-cyan-400" }), /* @__PURE__ */ jsx("h2", {
						className: "text-xs font-bold uppercase tracking-wider text-zinc-300",
						children: "Activity & Discussion"
					})]
				}), /* @__PURE__ */ jsxs("span", {
					className: "text-[11px] text-zinc-500",
					children: [
						activities.length,
						" event",
						activities.length === 1 ? "" : "s"
					]
				})]
			}),
			canComment && /* @__PURE__ */ jsxs("div", {
				className: "relative mt-4",
				children: [mentionOpen && filteredUsers.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "absolute bottom-full mb-2 left-0 w-72 max-h-56 overflow-y-auto rounded-xl border border-white/[0.12] bg-[#0d1322]/95 backdrop-blur-xl shadow-2xl p-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-100",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400 border-b border-white/[0.06] mb-1",
						children: [/* @__PURE__ */ jsx(AtSign, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Mention Team Member" })]
					}), filteredUsers.map((u, idx) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => insertMention(u),
						className: `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${idx === mentionIndex ? "bg-violet-500/20 text-white" : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"}`,
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white shadow-sm",
							children: (u.name || u.username).charAt(0).toUpperCase()
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ jsx("div", {
								className: "truncate text-xs font-medium text-zinc-200",
								children: u.name
							}), /* @__PURE__ */ jsxs("div", {
								className: "truncate font-mono text-[10px] text-zinc-400",
								children: ["@", u.username]
							})]
						})]
					}, u.id))]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "flex gap-2",
					children: [/* @__PURE__ */ jsx("textarea", {
						ref: textareaRef,
						value: comment,
						onChange: handleTextChange,
						onKeyDown: handleKeyDown,
						rows: 2,
						placeholder: "Add a comment or update (type @ to mention someone)…",
						className: "min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#07090e]/90 p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
					}), /* @__PURE__ */ jsxs("button", {
						disabled: saving || !comment.trim(),
						type: "submit",
						className: "flex items-center gap-1.5 self-end rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.35)] shadow-specular transition-all hover:from-violet-400 hover:to-indigo-500 disabled:opacity-40",
						children: [/* @__PURE__ */ jsx(Send, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Send" })]
					})]
				})]
			}),
			activities.length ? /* @__PURE__ */ jsx("div", {
				className: "mt-5 divide-y divide-white/[0.04]",
				children: activities.map((activity) => /* @__PURE__ */ jsxs("div", {
					className: "flex gap-3 py-3.5 first:pt-0",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow-sm",
						children: (activity.user?.name ?? "S").charAt(0)
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-baseline gap-2",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-xs font-bold text-zinc-200",
									children: activity.user?.name ?? "System"
								}),
								activity.user?.username && /* @__PURE__ */ jsxs("span", {
									className: "font-mono text-[10px] text-zinc-500",
									children: ["@", activity.user.username]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-zinc-500",
									children: dateLabel(activity.created_at)
								})
							]
						}), activity.type === "comment" ? /* @__PURE__ */ jsx("p", {
							className: "mt-1 whitespace-pre-wrap text-xs leading-relaxed text-zinc-300",
							children: renderCommentBody(activity.body || "")
						}) : /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-zinc-400",
							children: activity.body || activityLabel(activity.type)
						})]
					})]
				}, activity.id))
			}) : /* @__PURE__ */ jsx("div", {
				className: "py-8 text-center text-xs text-zinc-600",
				children: "No activity recorded yet."
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Requests/components/Detail/RequestSidebarProperties.tsx
function RequestSidebarProperties({ request, projects, users, statuses, priorities, canAssign, canEdit, onUpdate, onRequestChange }) {
	const [tagInput, setTagInput] = useState("");
	const [relationTicketId, setRelationTicketId] = useState("");
	const [relationType, setRelationType] = useState("blocks");
	const [linking, setLinking] = useState(false);
	const currentTags = Array.isArray(request.tags) ? request.tags : [];
	const handleAddTag = async (e) => {
		if (e) e.preventDefault();
		const trimmed = tagInput.trim().replace(/^#/, "").toLowerCase();
		if (!trimmed) return;
		if (currentTags.includes(trimmed)) {
			toast.error("Tag already added");
			setTagInput("");
			return;
		}
		const newTags = [...currentTags, trimmed];
		setTagInput("");
		await onUpdate({ tags: newTags });
	};
	const handleRemoveTag = async (tagToRemove) => {
		await onUpdate({ tags: currentTags.filter((t) => t !== tagToRemove) });
	};
	const handleAddRelation = async (e) => {
		e.preventDefault();
		const cleanedId = parseInt(relationTicketId.replace(/[^0-9]/g, ""), 10);
		if (isNaN(cleanedId) || cleanedId <= 0) {
			toast.error("Enter a valid ticket number (e.g. 42)");
			return;
		}
		if (cleanedId === request.id) {
			toast.error("Cannot link a ticket to itself");
			return;
		}
		setLinking(true);
		try {
			const { data } = await axios.post(route("requests.relations.store", request.id), {
				related_id: cleanedId,
				type: relationType
			});
			setRelationTicketId("");
			toast.success("Relation linked");
			if (onRequestChange && data.request) onRequestChange(data.request);
			else router.reload();
		} catch (err) {
			const msg = isAxiosError(err) ? err.response?.data?.message ?? "Could not link relation." : "Could not link relation.";
			toast.error(msg);
		} finally {
			setLinking(false);
		}
	};
	const handleRemoveRelation = async (relationId) => {
		try {
			const { data } = await axios.delete(route("requests.relations.destroy", [request.id, relationId]));
			toast.success("Relation removed");
			if (onRequestChange && data.request) onRequestChange(data.request);
			else router.reload();
		} catch (err) {
			const msg = isAxiosError(err) ? err.response?.data?.message ?? "Could not remove relation." : "Could not remove relation.";
			toast.error(msg);
		}
	};
	return /* @__PURE__ */ jsxs("aside", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsxs(Card, {
				className: "space-y-4 p-5",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 border-b border-white/[0.06] pb-3",
						children: [/* @__PURE__ */ jsx(Sliders, { className: "h-3.5 w-3.5 text-violet-400" }), /* @__PURE__ */ jsx("h2", {
							className: "text-xs font-bold uppercase tracking-wider text-zinc-300",
							children: "Properties"
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block",
						children: [/* @__PURE__ */ jsx("span", {
							className: "mb-1.5 block text-[11px] font-semibold text-zinc-400",
							children: "Status"
						}), /* @__PURE__ */ jsx("select", {
							disabled: !canEdit,
							value: request.status,
							onChange: (event) => onUpdate({ status: event.target.value }),
							className: "w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50",
							children: Object.entries(statuses).map(([value, label]) => /* @__PURE__ */ jsx("option", {
								value,
								children: label
							}, value))
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block",
						children: [/* @__PURE__ */ jsx("span", {
							className: "mb-1.5 block text-[11px] font-semibold text-zinc-400",
							children: "Priority"
						}), /* @__PURE__ */ jsx("select", {
							disabled: !canEdit,
							value: request.priority,
							onChange: (event) => onUpdate({ priority: event.target.value }),
							className: "w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50",
							children: Object.entries(priorities).map(([value, label]) => /* @__PURE__ */ jsx("option", {
								value,
								children: label
							}, value))
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block",
						children: [/* @__PURE__ */ jsx("span", {
							className: "mb-1.5 block text-[11px] font-semibold text-zinc-400",
							children: "Project"
						}), /* @__PURE__ */ jsx("select", {
							disabled: !canEdit,
							value: request.project?.id ?? "",
							onChange: (event) => onUpdate({ area_id: Number(event.target.value) }),
							className: "w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50",
							children: projects.map((project) => /* @__PURE__ */ jsx("option", {
								value: project.id,
								children: project.name
							}, project.id))
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block",
						children: [/* @__PURE__ */ jsx("span", {
							className: "mb-1.5 block text-[11px] font-semibold text-zinc-400",
							children: "Assignee"
						}), /* @__PURE__ */ jsxs("select", {
							disabled: !canAssign,
							value: request.assignee?.id ?? "",
							onChange: (event) => onUpdate({ assignee_id: event.target.value ? Number(event.target.value) : null }),
							className: "w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Unassigned"
							}), users.map((user) => /* @__PURE__ */ jsx("option", {
								value: user.id,
								children: user.name
							}, user.id))]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "border-t border-white/[0.06] pt-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between mb-1.5",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400",
									children: [/* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Due Date" })]
								}), request.due_date && /* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: !canEdit,
									onClick: () => onUpdate({ due_date: null }),
									className: "text-[10px] text-zinc-500 hover:text-rose-400 transition-colors",
									children: "Clear"
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "relative",
								children: /* @__PURE__ */ jsx("input", {
									type: "date",
									disabled: !canEdit,
									value: request.due_date ?? "",
									onChange: (e) => onUpdate({ due_date: e.target.value || null }),
									className: "w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50 [color-scheme:dark]"
								})
							}),
							request.due_date && request.due_human && /* @__PURE__ */ jsx("div", {
								className: "mt-1.5 flex items-center gap-1.5",
								children: /* @__PURE__ */ jsxs("span", {
									className: `inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${request.is_overdue ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : request.due_human === "Due today" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-zinc-700/50 bg-zinc-800/80 text-zinc-400"}`,
									children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${request.is_overdue ? "bg-rose-400" : request.due_human === "Due today" ? "bg-amber-400" : "bg-zinc-500"}` }), /* @__PURE__ */ jsx("span", { children: request.due_human })]
								})
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "border-t border-white/[0.06] pt-3",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-2",
								children: [/* @__PURE__ */ jsx(Tag, { className: "h-3 w-3 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Tags" })]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "flex flex-wrap items-center gap-1.5 mb-2.5",
								children: currentTags.length > 0 ? currentTags.map((tag) => /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] px-2 py-0.5 rounded-md",
									children: [/* @__PURE__ */ jsxs("span", { children: ["#", tag] }), canEdit && /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => handleRemoveTag(tag),
										className: "text-zinc-500 hover:text-rose-400 transition-colors ml-0.5",
										title: "Remove tag",
										children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
									})]
								}, tag)) : /* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-zinc-600",
									children: "No tags assigned"
								})
							}),
							canEdit && /* @__PURE__ */ jsxs("form", {
								onSubmit: handleAddTag,
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Add tag (e.g. bug, api)...",
									value: tagInput,
									onChange: (e) => setTagInput(e.target.value),
									className: "min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#07090e] px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: !tagInput.trim(),
									className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-violet-400 hover:bg-violet-500/10 hover:text-white disabled:opacity-40 transition-colors",
									title: "Add tag",
									children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" })
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs(Card, {
				className: "p-5 space-y-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 border-b border-white/[0.06] pb-3",
						children: [/* @__PURE__ */ jsx(Link2, { className: "h-3.5 w-3.5 text-violet-400" }), /* @__PURE__ */ jsx("h2", {
							className: "text-xs font-bold uppercase tracking-wider text-zinc-300",
							children: "Dependencies & Relations"
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "space-y-2",
						children: request.relations && request.relations.length > 0 ? request.relations.map((rel) => {
							const isBlocker = rel.type === "blocks";
							return /* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#07090e]/80 p-2 text-xs",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 min-w-0 flex-1",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: `rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 border ${isBlocker ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : rel.type === "duplicate" ? "border-purple-500/30 bg-purple-500/10 text-purple-300" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`,
											children: isBlocker ? "Blocks" : rel.type === "duplicate" ? "Duplicate" : "Relates"
										}),
										/* @__PURE__ */ jsxs(Link, {
											href: route("requests.show", rel.related_id),
											className: "font-mono text-[11px] font-bold text-violet-300 hover:underline shrink-0",
											children: ["#REQ-", rel.related_id]
										}),
										rel.related?.title && /* @__PURE__ */ jsx("span", {
											className: "truncate text-zinc-300 text-[11px]",
											title: rel.related.title,
											children: rel.related.title
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1 shrink-0",
									children: [rel.related?.status_label && /* @__PURE__ */ jsx("span", {
										className: "rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400",
										children: rel.related.status_label
									}), canEdit && /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => handleRemoveRelation(rel.id),
										className: "p-1 text-zinc-500 hover:text-rose-400 transition-colors",
										title: "Unlink relation",
										children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
									})]
								})]
							}, rel.id);
						}) : /* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-zinc-600",
							children: "No linked dependencies or relations."
						})
					}),
					canEdit && /* @__PURE__ */ jsxs("form", {
						onSubmit: handleAddRelation,
						className: "space-y-2 border-t border-white/[0.06] pt-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block text-[11px] font-semibold text-zinc-400",
							children: "Link Relation"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsxs("select", {
									value: relationType,
									onChange: (e) => setRelationType(e.target.value),
									className: "w-28 rounded-lg border border-white/[0.08] bg-[#07090e] px-2 py-1.5 text-xs text-zinc-300 focus:border-violet-500 focus:outline-none",
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "blocks",
											children: "Blocked by"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "relates_to",
											children: "Relates to"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "duplicate",
											children: "Duplicate of"
										})
									]
								}),
								/* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "#REQ-123 or 123",
									value: relationTicketId,
									onChange: (e) => setRelationTicketId(e.target.value),
									className: "min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#07090e] px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
								}),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: linking || !relationTicketId.trim(),
									className: "rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-violet-400 hover:bg-violet-500/10 hover:text-white disabled:opacity-40 transition-colors",
									children: linking ? "Linking…" : "Link"
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ jsxs("label", {
					className: `flex items-start gap-3 ${canEdit ? "cursor-pointer select-none" : ""}`,
					children: [/* @__PURE__ */ jsx("input", {
						type: "checkbox",
						disabled: !canEdit,
						checked: request.is_blocked,
						onChange: (event) => onUpdate({
							is_blocked: event.target.checked,
							blocked_reason: event.target.checked ? request.blocked_reason : null
						}),
						className: "mt-0.5 h-4 w-4 rounded border-white/10 bg-[#07090e] text-rose-600 focus:ring-0 disabled:opacity-50"
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "block text-xs font-bold text-white",
						children: "Roadblock / Blocked"
					}), /* @__PURE__ */ jsx("span", {
						className: "mt-0.5 block text-[11px] leading-relaxed text-zinc-500",
						children: "Flag this request as blocked and document the blocker reason."
					})] })]
				}), request.is_blocked && canEdit && /* @__PURE__ */ jsx("textarea", {
					defaultValue: request.blocked_reason ?? "",
					onBlur: (event) => {
						if (event.target.value !== (request.blocked_reason ?? "")) onUpdate({ blocked_reason: event.target.value });
					},
					rows: 3,
					placeholder: "Explain why work is blocked…",
					className: "mt-3 w-full rounded-xl border border-rose-500/30 bg-[#07090e] p-2.5 text-xs text-rose-200 placeholder:text-zinc-600 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Utils/confetti.ts
/**
* Lightweight canvas particle burst celebration.
* Zero external dependencies.
*/
function triggerCelebration(originX, originY) {
	if (typeof window === "undefined") return;
	const canvas = document.createElement("canvas");
	canvas.style.position = "fixed";
	canvas.style.inset = "0";
	canvas.style.width = "100vw";
	canvas.style.height = "100vh";
	canvas.style.pointerEvents = "none";
	canvas.style.zIndex = "9999";
	document.body.appendChild(canvas);
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		canvas.remove();
		return;
	}
	const dpr = window.devicePixelRatio || 1;
	canvas.width = window.innerWidth * dpr;
	canvas.height = window.innerHeight * dpr;
	ctx.scale(dpr, dpr);
	const colors = [
		"#10b981",
		"#3b82f6",
		"#8b5cf6",
		"#f59e0b",
		"#ec4899",
		"#06b6d4"
	];
	const particleCount = 45;
	const startX = originX ?? window.innerWidth * .7;
	const startY = originY ?? window.innerHeight * .5;
	const particles = Array.from({ length: particleCount }, () => {
		const angle = Math.random() * Math.PI * 2;
		const speed = 4 + Math.random() * 8;
		return {
			x: startX,
			y: startY,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 3,
			size: 4 + Math.random() * 5,
			color: colors[Math.floor(Math.random() * colors.length)],
			rotation: Math.random() * 360,
			vRot: (Math.random() - .5) * 12,
			opacity: 1
		};
	});
	let startTime = performance.now();
	const duration = 1200;
	function animate(currentTime) {
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / duration, 1);
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		particles.forEach((p) => {
			p.x += p.vx;
			p.y += p.vy;
			p.vy += .28;
			p.vx *= .98;
			p.rotation += p.vRot;
			p.opacity = Math.max(0, 1 - progress);
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rotation * Math.PI / 180);
			ctx.globalAlpha = p.opacity;
			ctx.fillStyle = p.color;
			ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .6);
			ctx.restore();
		});
		if (progress < 1) requestAnimationFrame(animate);
		else canvas.remove();
	}
	requestAnimationFrame(animate);
}
var triggerConfetti = triggerCelebration;
//#endregion
//#region resources/js/Features/Requests/hooks/useKanbanBoard.ts
function useKanbanBoard({ initialRequests, statuses, priorities = {}, users = [] }) {
	const [boardRequests, setBoardRequests] = useState(initialRequests);
	useEffect(() => {
		setBoardRequests(initialRequests);
	}, [initialRequests]);
	const handleDragEnd = async (result) => {
		if (!result.destination) return;
		const { source, destination, draggableId } = result;
		if (source.droppableId === destination.droppableId && source.index === destination.index) return;
		const cardId = parseInt(draggableId, 10);
		const destinationStatus = destination.droppableId;
		const sourceStatus = source.droppableId;
		const statusLabel = statuses[destinationStatus] ?? destinationStatus;
		const sourceStatusLabel = statuses[sourceStatus] ?? sourceStatus;
		setBoardRequests((prevRequests) => {
			const list = [...prevRequests];
			const itemIndex = list.findIndex((r) => r.id === cardId);
			if (itemIndex === -1) return prevRequests;
			const [movedItem] = list.splice(itemIndex, 1);
			const updatedItem = {
				...movedItem,
				status: destinationStatus,
				status_label: statusLabel
			};
			const destItems = list.filter((r) => r.status === destinationStatus);
			if (destination.index >= destItems.length) {
				if (destItems.length > 0) {
					const lastDestItem = destItems[destItems.length - 1];
					const lastIdxInList = list.findIndex((r) => r.id === lastDestItem.id);
					list.splice(lastIdxInList + 1, 0, updatedItem);
				} else list.push(updatedItem);
			} else {
				const targetSibling = destItems[destination.index];
				const siblingIdxInList = list.findIndex((r) => r.id === targetSibling.id);
				list.splice(siblingIdxInList, 0, updatedItem);
			}
			return list;
		});
		if (destinationStatus === "done") triggerCelebration();
		toast.success(`Moved to ${statusLabel}`, { action: {
			label: "Undo",
			onClick: async () => {
				setBoardRequests((prev) => prev.map((r) => r.id === cardId ? {
					...r,
					status: sourceStatus,
					status_label: sourceStatusLabel
				} : r));
				try {
					await axios.patch(route("requests.update", cardId), { status: sourceStatus });
				} catch {
					toast.error("Could not undo move.");
				}
			}
		} });
		try {
			await axios.patch(route("requests.update", cardId), { status: destinationStatus });
		} catch {
			setBoardRequests((prev) => prev.map((r) => r.id === cardId ? {
				...r,
				status: sourceStatus,
				status_label: sourceStatusLabel
			} : r));
			toast.error("Could not update status. Reverting change.");
		}
	};
	const handleQuickStatus = async (request, nextStatus) => {
		const oldStatus = request.status;
		const statusLabel = statuses[nextStatus] ?? nextStatus;
		const oldStatusLabel = statuses[oldStatus] ?? oldStatus;
		setBoardRequests((prev) => prev.map((r) => r.id === request.id ? {
			...r,
			status: nextStatus,
			status_label: statusLabel
		} : r));
		if (nextStatus === "done") triggerCelebration();
		toast.success(`Moved to ${statusLabel}`, { action: {
			label: "Undo",
			onClick: () => handleQuickStatus(request, oldStatus)
		} });
		try {
			await axios.patch(route("requests.update", request.id), { status: nextStatus });
		} catch {
			setBoardRequests((prev) => prev.map((r) => r.id === request.id ? {
				...r,
				status: oldStatus,
				status_label: oldStatusLabel
			} : r));
			toast.error("Could not update status.");
		}
	};
	const handleCardUpdated = (updated) => {
		setBoardRequests((prev) => prev.map((r) => r.id === updated.id ? {
			...r,
			...updated
		} : r));
	};
	const handleBulkUpdateStatus = async (ids, status) => {
		setBoardRequests((prev) => prev.map((r) => ids.includes(r.id) ? {
			...r,
			status,
			status_label: statuses[status] ?? status
		} : r));
		toast.success(`Updated ${ids.length} requests`);
		if (status === "done") triggerCelebration();
		await Promise.all(ids.map((id) => axios.patch(route("requests.update", id), { status }).catch(() => {})));
	};
	const handleBulkUpdatePriority = async (ids, priority) => {
		setBoardRequests((prev) => prev.map((r) => ids.includes(r.id) ? {
			...r,
			priority,
			priority_label: priorities[priority] ?? priority
		} : r));
		toast.success(`Updated priority for ${ids.length} requests`);
		await Promise.all(ids.map((id) => axios.patch(route("requests.update", id), { priority }).catch(() => {})));
	};
	const handleBulkUpdateAssignee = async (ids, assigneeId) => {
		const assignedUser = users.find((u) => u.id === assigneeId) ?? null;
		setBoardRequests((prev) => prev.map((r) => ids.includes(r.id) ? {
			...r,
			assignee_id: assigneeId,
			assignee: assignedUser
		} : r));
		toast.success(`Reassigned ${ids.length} requests`);
		await Promise.all(ids.map((id) => axios.patch(route("requests.update", id), { assignee_id: assigneeId }).catch(() => {})));
	};
	return {
		boardRequests,
		setBoardRequests,
		handleDragEnd,
		handleQuickStatus,
		handleCardUpdated,
		handleBulkUpdateStatus,
		handleBulkUpdatePriority,
		handleBulkUpdateAssignee
	};
}
//#endregion
//#region resources/js/Features/Requests/hooks/useBoardFilters.ts
function useBoardFilters({ requests, filters, authUser }) {
	const getInitialParams = () => {
		if (typeof window === "undefined") return new URLSearchParams();
		return new URLSearchParams(window.location.search);
	};
	const initialPreset = (() => {
		const urlPreset = getInitialParams().get("preset");
		if (urlPreset && [
			"all",
			"my",
			"review",
			"blocked",
			"urgent"
		].includes(urlPreset)) return urlPreset;
		if (filters.my_work === "1" || filters.my_work === "true") return "my";
		if (filters.status === "review") return "review";
		if (filters.priority === "urgent") return "urgent";
		if (filters.blocked === "1" || filters.is_blocked === "1") return "blocked";
		return "all";
	})();
	const initialProject = (() => {
		return getInitialParams().get("project") ?? filters.project ?? "";
	})();
	const initialStatus = (() => {
		return getInitialParams().get("status") ?? filters.status ?? "";
	})();
	const initialPriority = (() => {
		return getInitialParams().get("priority") ?? filters.priority ?? "";
	})();
	const initialSearch = (() => {
		return getInitialParams().get("search") ?? filters.search ?? "";
	})();
	const initialOwner = (() => {
		return getInitialParams().get("owner") ?? filters.owner ?? "";
	})();
	const initialRequester = (() => {
		return getInitialParams().get("requester") ?? filters.requester ?? "";
	})();
	const [preset, setPreset] = useState(initialPreset);
	const [selectedProject, setSelectedProject] = useState(initialProject);
	const [search, setSearch] = useState(initialSearch);
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [owner, setOwner] = useState(initialOwner);
	const [requester, setRequester] = useState(initialRequester);
	const [statusFilter, setStatusFilter] = useState(initialStatus);
	const [priorityFilter, setPriorityFilter] = useState(initialPriority);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const url = new URL(window.location.href);
		if (preset && preset !== "all") url.searchParams.set("preset", preset);
		else url.searchParams.delete("preset");
		if (selectedProject) url.searchParams.set("project", selectedProject);
		else url.searchParams.delete("project");
		if (statusFilter) url.searchParams.set("status", statusFilter);
		else url.searchParams.delete("status");
		if (priorityFilter) url.searchParams.set("priority", priorityFilter);
		else url.searchParams.delete("priority");
		if (search) url.searchParams.set("search", search);
		else url.searchParams.delete("search");
		if (owner) url.searchParams.set("owner", owner);
		else url.searchParams.delete("owner");
		if (requester) url.searchParams.set("requester", requester);
		else url.searchParams.delete("requester");
		window.history.replaceState({}, "", url.toString());
	}, [
		preset,
		selectedProject,
		statusFilter,
		priorityFilter,
		search,
		owner,
		requester
	]);
	const counts = useMemo(() => {
		const myId = authUser?.id;
		return {
			all: requests.length,
			my: requests.filter((r) => r.assignee?.id === myId).length,
			review: requests.filter((r) => r.status === "review").length,
			blocked: requests.filter((r) => r.is_blocked).length,
			urgent: requests.filter((r) => r.priority === "urgent").length
		};
	}, [requests, authUser]);
	const filteredRequests = useMemo(() => {
		return requests.filter((req) => {
			if (preset === "my" && req.assignee?.id !== authUser?.id) return false;
			if (preset === "review" && req.status !== "review") return false;
			if (preset === "blocked" && !req.is_blocked) return false;
			if (preset === "urgent" && req.priority !== "urgent") return false;
			if (selectedProject && String(req.project?.id) !== selectedProject) return false;
			if (search) {
				const q = search.toLowerCase();
				const matchTitle = req.title.toLowerCase().includes(q);
				const matchDesc = req.description?.toLowerCase().includes(q) ?? false;
				const matchProj = req.project?.name.toLowerCase().includes(q) ?? false;
				const matchUser = req.assignee?.name.toLowerCase().includes(q) ?? false;
				if (!matchTitle && !matchDesc && !matchProj && !matchUser) return false;
			}
			if (owner && String(req.assignee?.id) !== owner) return false;
			if (requester && String(req.requester?.id) !== requester) return false;
			if (statusFilter && req.status !== statusFilter) return false;
			if (priorityFilter && req.priority !== priorityFilter) return false;
			return true;
		});
	}, [
		requests,
		preset,
		selectedProject,
		search,
		owner,
		requester,
		statusFilter,
		priorityFilter,
		authUser
	]);
	const isFiltered = preset !== "all" || Boolean(selectedProject) || Boolean(search) || Boolean(owner) || Boolean(requester) || Boolean(statusFilter) || Boolean(priorityFilter);
	const resetFilters = () => {
		setPreset("all");
		setSelectedProject("");
		setSearch("");
		setOwner("");
		setRequester("");
		setStatusFilter("");
		setPriorityFilter("");
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			url.search = "";
			window.history.replaceState({}, "", url.toString());
		}
		router.get(route("requests.index"), {}, {
			preserveState: true,
			preserveScroll: true,
			replace: true
		});
	};
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "/" && ![
				"INPUT",
				"TEXTAREA",
				"SELECT"
			].includes(e.target?.tagName)) {
				e.preventDefault();
				document.getElementById("board-search-input")?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);
	return {
		preset,
		setPreset,
		selectedProject,
		setSelectedProject,
		search,
		setSearch,
		owner,
		setOwner,
		requester,
		setRequester,
		statusFilter,
		setStatusFilter,
		priorityFilter,
		setPriorityFilter,
		showAdvancedFilters,
		setShowAdvancedFilters,
		counts,
		filteredRequests,
		isFiltered,
		resetFilters
	};
}
//#endregion
//#region resources/js/Features/Notifications/types.ts
function formatRelativeTime(dateString) {
	if (!dateString) return "";
	const now = /* @__PURE__ */ new Date();
	const date = new Date(dateString);
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1e3);
	if (diffInSeconds < 30) return "Just now";
	if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h ago`;
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) return `${diffInDays}d ago`;
	return date.toLocaleDateString([], {
		month: "short",
		day: "numeric"
	});
}
function getNotificationBadge(item) {
	const event = (item.event ?? "").toLowerCase();
	const msg = (item.message ?? "").toLowerCase();
	if (event === "assignment" || msg.includes("assigned") || msg.includes("assignment") || msg.includes("owner")) return {
		category: "assignment",
		label: "Assignment",
		icon: UserCheck,
		pillClass: "bg-purple-500/10 text-purple-300 border-purple-500/25 shadow-[0_0_12px_rgba(168,85,247,0.12)]",
		dotClass: "bg-purple-400"
	};
	if (event === "blocked" || msg.includes("blocked") || msg.includes("blocker")) return {
		category: "blocker",
		label: "Blocker",
		icon: AlertTriangle,
		pillClass: "bg-rose-500/10 text-rose-300 border-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.12)]",
		dotClass: "bg-rose-400"
	};
	if (event === "comment" || msg.includes("comment") || msg.includes("replied")) return {
		category: "comment",
		label: "Comment",
		icon: MessageSquare,
		pillClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.12)]",
		dotClass: "bg-emerald-400"
	};
	if (event === "review" || event === "done" || event === "reopened" || event === "status_changed" || msg.includes("status") || msg.includes("moved") || msg.includes("marked this request")) return {
		category: "status",
		label: event === "review" ? "In Review" : event === "done" ? "Completed" : "Status Change",
		icon: ArrowRightLeft,
		pillClass: "bg-blue-500/10 text-blue-300 border-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.12)]",
		dotClass: "bg-blue-400"
	};
	return {
		category: "general",
		label: "General",
		icon: Sparkles,
		pillClass: "bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.12)]",
		dotClass: "bg-amber-400"
	};
}
//#endregion
//#region resources/js/Features/Notifications/components/NotificationPopover.tsx
function NotificationPopover() {
	const props = usePage().props;
	const initialList = props.workspaceNotifications ?? [];
	const initialUnread = props.unreadNotificationsCount ?? initialList.filter((n) => !n.read_at).length;
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState("all");
	const [notifications, setNotifications] = useState(initialList);
	const [unreadCount, setUnreadCount] = useState(initialUnread);
	const containerRef = useRef(null);
	useEffect(() => {
		const list = props.workspaceNotifications ?? [];
		setNotifications(list);
		setUnreadCount(props.unreadNotificationsCount ?? list.filter((n) => !n.read_at).length);
	}, [props.workspaceNotifications, props.unreadNotificationsCount]);
	useEffect(() => {
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
		}
		function handleKeyDown(event) {
			if (event.key === "Escape") setOpen(false);
		}
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);
	const handleMarkAllRead = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (unreadCount === 0) return;
		setUnreadCount(0);
		setNotifications((prev) => prev.map((item) => ({
			...item,
			read_at: item.read_at ?? (/* @__PURE__ */ new Date()).toISOString()
		})));
		try {
			await axios.post(route("notifications.read-all"));
			notifySuccess("All caught up", "All notifications have been marked as read.");
		} catch {}
	};
	const handleToggleRead = async (id, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const target = notifications.find((n) => n.id === id);
		if (!target) return;
		const isCurrentlyRead = Boolean(target.read_at);
		const newReadAt = isCurrentlyRead ? null : (/* @__PURE__ */ new Date()).toISOString();
		setNotifications((prev) => prev.map((item) => item.id === id ? {
			...item,
			read_at: newReadAt
		} : item));
		setUnreadCount((prev) => isCurrentlyRead ? prev + 1 : Math.max(0, prev - 1));
		try {
			if (isCurrentlyRead) await axios.post(route("notifications.unread", id));
			else await axios.post(route("notifications.read", id));
		} catch {}
	};
	const handleItemClick = (item) => {
		if (!item.read_at) handleToggleRead(item.id);
		setOpen(false);
		const targetUrl = item.url ?? (item.request_id ? route("requests.show", item.request_id) : route("requests.index"));
		router.visit(targetUrl);
	};
	const filteredNotifications = tab === "unread" ? notifications.filter((item) => !item.read_at) : notifications;
	return /* @__PURE__ */ jsxs("div", {
		ref: containerRef,
		className: "relative",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => setOpen((prev) => !prev),
			className: `relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-150 ${open ? "border-violet-500/40 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(167,139,250,0.2)] ring-1 ring-violet-500/30" : "border-white/[0.08] bg-[#0c0d12] text-zinc-400 shadow-sm hover:border-white/20 hover:bg-[#121318] hover:text-white"}`,
			title: unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications",
			"aria-expanded": open,
			children: [/* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }), unreadCount > 0 && /* @__PURE__ */ jsx("span", {
				className: "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold font-mono text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]",
				children: unreadCount > 9 ? "9+" : unreadCount
			})]
		}), open && /* @__PURE__ */ jsxs("div", {
			className: "absolute right-0 top-full mt-2 z-50 w-[380px] sm:w-[420px] rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl ring-1 ring-white/[0.04] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150",
			children: [
				/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-white/[0.06] px-4 py-3 bg-[#0c0d12]/70",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-bold uppercase tracking-wider text-zinc-300",
							children: "Notifications"
						}), unreadCount > 0 && /* @__PURE__ */ jsxs("span", {
							className: "rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[10px] font-bold font-mono text-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.2)]",
							children: [unreadCount, " new"]
						})]
					}), unreadCount > 0 && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: handleMarkAllRead,
						className: "flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white",
						title: "Mark all as read",
						children: [/* @__PURE__ */ jsx(CheckCheck, { className: "h-3.5 w-3.5 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Mark all read" })]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-white/[0.04] bg-[#0c0d12]/40 px-4 py-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "inline-flex rounded-lg border border-white/[0.06] bg-[#07090e] p-0.5",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setTab("unread"),
							className: `flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${tab === "unread" ? "bg-violet-500/20 text-white shadow-sm ring-1 ring-violet-500/30" : "text-zinc-400 hover:text-zinc-200"}`,
							children: [/* @__PURE__ */ jsx("span", { children: "Unread" }), unreadCount > 0 && /* @__PURE__ */ jsx("span", {
								className: `rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${tab === "unread" ? "bg-violet-400 text-black" : "bg-white/10 text-zinc-300"}`,
								children: unreadCount
							})]
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setTab("all"),
							className: `flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${tab === "all" ? "bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10" : "text-zinc-400 hover:text-zinc-200"}`,
							children: [/* @__PURE__ */ jsx("span", { children: "All" }), /* @__PURE__ */ jsx("span", {
								className: "rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] font-mono font-bold text-zinc-400",
								children: notifications.length
							})]
						})]
					}), /* @__PURE__ */ jsxs("span", {
						className: "text-[10px] text-zinc-500 font-mono",
						children: [
							filteredNotifications.length,
							" ",
							filteredNotifications.length === 1 ? "item" : "items"
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "max-h-[380px] overflow-y-auto custom-scroll divide-y divide-white/[0.04]",
					children: filteredNotifications.length > 0 ? filteredNotifications.map((item) => {
						const isUnread = !item.read_at;
						const badge = getNotificationBadge(item);
						const Icon = badge.icon;
						return /* @__PURE__ */ jsxs("div", {
							onClick: () => handleItemClick(item),
							className: `group relative flex items-start gap-3 p-3.5 cursor-pointer transition-all ${isUnread ? "bg-violet-500/[0.04] hover:bg-violet-500/[0.08] border-l-2 border-l-violet-500" : "opacity-75 hover:opacity-100 hover:bg-white/[0.03] border-l-2 border-l-transparent"}`,
							children: [
								/* @__PURE__ */ jsx("div", {
									className: `mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${badge.pillClass}`,
									title: badge.label,
									children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-1.5 truncate",
											children: [item.request_id && /* @__PURE__ */ jsxs("span", {
												className: "font-mono text-[10px] font-bold text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.2 rounded",
												children: ["#REQ-", item.request_id]
											}), /* @__PURE__ */ jsx("p", {
												className: "truncate text-xs font-semibold text-zinc-200 group-hover:text-white",
												children: item.request_title ?? "Work Request Update"
											})]
										}), /* @__PURE__ */ jsx("span", {
											className: "shrink-0 text-[10px] text-zinc-500 font-mono",
											children: formatRelativeTime(item.created_at)
										})]
									}), item.message && /* @__PURE__ */ jsx("p", {
										className: "mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-400",
										children: item.message
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "flex shrink-0 items-center self-center pl-1",
									children: /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: (e) => handleToggleRead(item.id, e),
										className: `flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${isUnread ? "text-violet-400 hover:bg-violet-500/20 hover:text-white" : "text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-200"}`,
										title: isUnread ? "Mark as read" : "Mark as unread",
										"aria-label": isUnread ? "Mark as read" : "Mark as unread",
										children: isUnread ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { className: "group-hover:hidden h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" }), /* @__PURE__ */ jsx(Check, { className: "hidden group-hover:block h-3.5 w-3.5 text-emerald-400" })] }) : /* @__PURE__ */ jsx(Mail, { className: "h-3 w-3 text-zinc-500 hover:text-zinc-300" })
									})
								})
							]
						}, item.id);
					}) : /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center justify-center py-12 px-4 text-center",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0c0d12] text-zinc-400 mb-3 shadow-inner",
								children: tab === "unread" ? /* @__PURE__ */ jsx(Check, { className: "h-6 w-6 text-emerald-400" }) : /* @__PURE__ */ jsx(Inbox, { className: "h-6 w-6 text-zinc-500" })
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs font-bold text-zinc-200",
								children: tab === "unread" ? "All caught up" : "No notifications"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[11px] text-zinc-500 max-w-[240px]",
								children: tab === "unread" ? "No unread notifications in your inbox." : "Workspace notifications will appear here."
							})
						]
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-t border-white/[0.06] bg-[#0c0d12]/70 px-4 py-2.5",
					children: /* @__PURE__ */ jsxs(Link, {
						href: route("notifications.index"),
						onClick: () => setOpen(false),
						className: "group flex items-center justify-between text-xs font-semibold text-zinc-400 transition-colors hover:text-violet-300",
						children: [/* @__PURE__ */ jsx("span", { children: "View all in Inbox" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" })]
					})
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Components/ShortcutsModal.tsx
function ShortcutsModal({ open, onClose }) {
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && open) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in-0 duration-150",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] shadow-specular backdrop-blur-2xl ring-1 ring-white/[0.04] transition-all",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#07090e]/60",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-[#121318] text-violet-400 shadow-specular",
							children: /* @__PURE__ */ jsx(Keyboard, { className: "h-4 w-4" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-bold text-white tracking-tight",
								children: "Keyboard Shortcuts"
							}), /* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300",
								children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-2.5 w-2.5" }), /* @__PURE__ */ jsx("span", { children: "Raycast Mode" })]
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-zinc-400",
							children: "Power user hotkeys and navigation shortcuts"
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400",
							children: /* @__PURE__ */ jsx("kbd", { children: "Esc" })
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onClose,
							className: "flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors",
							"aria-label": "Close shortcuts modal",
							children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
						})]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scroll",
					children: [
						{
							title: "Global Navigation",
							shortcuts: [
								{
									keys: ["G", "D"],
									desc: "Go to Dashboard"
								},
								{
									keys: ["G", "B"],
									desc: "Go to Studio Board"
								},
								{
									keys: ["G", "P"],
									desc: "Go to Initiatives (Projects)"
								},
								{
									keys: ["G", "N"],
									desc: "Go to Notifications Inbox"
								},
								{
									keys: ["G", "S"],
									desc: "Go to Workspace Settings"
								}
							]
						},
						{
							title: "Quick Actions",
							shortcuts: [
								{
									keys: ["C"],
									desc: "New Work Request modal"
								},
								{
									keys: ["⌘", "K"],
									desc: "Open Command Palette"
								},
								{
									keys: ["?"],
									desc: "Open this Keyboard Shortcuts cheat-sheet"
								},
								{
									keys: ["/"],
									desc: "Focus Board Filter Search"
								},
								{
									keys: ["Esc"],
									desc: "Close open drawers, modals, or flyouts"
								}
							]
						},
						{
							title: "Studio Board & Kanban",
							shortcuts: [
								{
									keys: ["Space"],
									desc: "Open Quick View Drawer for selected card"
								},
								{
									keys: ["⌘", "Enter"],
									desc: "Submit active work request form"
								},
								{
									keys: [
										"⌘",
										"⇧",
										"C"
									],
									desc: "Copy direct request link"
								},
								{
									keys: ["⌘", "Z"],
									desc: "Undo last card transition"
								}
							]
						}
					].map((section) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h4", {
						className: "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5",
						children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-violet-400/80" }), /* @__PURE__ */ jsx("span", { children: section.title })]
					}), /* @__PURE__ */ jsx("div", {
						className: "rounded-xl border border-white/[0.08] bg-[#07090e]/70 divide-y divide-white/[0.04] overflow-hidden shadow-inner",
						children: section.shortcuts.map((s, idx) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white/[0.03] transition-colors",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-zinc-300 font-medium",
								children: s.desc
							}), /* @__PURE__ */ jsx("div", {
								className: "flex items-center gap-1.5",
								children: s.keys.map((k, kIdx) => /* @__PURE__ */ jsx("kbd", {
									className: "flex h-5 min-w-5 items-center justify-center rounded border border-white/[0.12] bg-[#121318] px-1.5 font-mono text-[10px] font-semibold text-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
									children: k
								}, kIdx))
							})]
						}, idx))
					})] }, section.title))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "border-t border-white/[0.08] bg-[#07090e]/80 px-6 py-3 flex items-center justify-between text-xs text-zinc-500",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						"Press ",
						/* @__PURE__ */ jsx("kbd", {
							className: "px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04] text-zinc-300 font-mono text-[10px]",
							children: "?"
						}),
						" anywhere to summon"
					] }), /* @__PURE__ */ jsx("span", {
						className: "font-mono text-[11px] text-zinc-500",
						children: "Relay Studio · Linear Ergonomics"
					})]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Layouts/AuthenticatedLayout.tsx
function Authenticated({ header, children }) {
	const props = usePage().props;
	const projects = props.projects ?? [];
	const users = props.users ?? [];
	const [commandOpen, setCommandOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [shortcutsOpen, setShortcutsOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState("");
	useEffect(() => {
		const updateTime = () => {
			setCurrentTime((/* @__PURE__ */ new Date()).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			}));
		};
		updateTime();
		const timer = setInterval(updateTime, 1e4);
		return () => clearInterval(timer);
	}, []);
	useEffect(() => {
		let lastGTime = 0;
		const handleKeyDown = (e) => {
			const target = e.target;
			if ([
				"INPUT",
				"TEXTAREA",
				"SELECT"
			].includes(target?.tagName) || target?.isContentEditable) return;
			if (e.key === "?" || e.shiftKey && e.key === "/") {
				e.preventDefault();
				setShortcutsOpen(true);
				return;
			}
			if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				setCreateOpen(true);
				return;
			}
			const now = Date.now();
			if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
				lastGTime = now;
				return;
			}
			if (lastGTime && now - lastGTime < 1e3) {
				const key = e.key.toLowerCase();
				lastGTime = 0;
				if (key === "d") {
					e.preventDefault();
					router.visit(route("dashboard"));
				} else if (key === "b") {
					e.preventDefault();
					router.visit(route("requests.index"));
				} else if (key === "p") {
					e.preventDefault();
					router.visit(route("requests.index"));
				} else if (key === "n") {
					e.preventDefault();
					router.visit(route("notifications.index"));
				} else if (key === "s") {
					e.preventDefault();
					router.visit(route("settings.index"));
				}
			}
		};
		const handleCustomOpen = () => setCreateOpen(true);
		const handleCustomShortcuts = () => setShortcutsOpen(true);
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("open-quick-create", handleCustomOpen);
		window.addEventListener("open-shortcuts", handleCustomShortcuts);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("open-quick-create", handleCustomOpen);
			window.removeEventListener("open-shortcuts", handleCustomShortcuts);
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "relay-shell relative flex min-h-screen font-sans text-zinc-100 antialiased selection:bg-zinc-700/60 selection:text-white",
		children: [
			/* @__PURE__ */ jsx("div", { className: "relay-grid pointer-events-none fixed inset-0 z-0 opacity-40" }),
			/* @__PURE__ */ jsx(Sidebar, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ jsxs("header", {
					className: "sticky top-0 z-20 flex h-[72px] items-center justify-between gap-5 border-b border-zinc-800/80 bg-[#090a0f]/90 px-7 backdrop-blur-xl sm:px-9",
					children: [/* @__PURE__ */ jsx("div", {
						className: "min-w-0 flex-1",
						children: header
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "hidden xl:flex h-10 items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#121318] px-3.5 text-xs text-zinc-400 font-mono shadow-sm",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "relative flex h-2 w-2",
									children: [/* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500" })]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-zinc-300",
									children: currentTime || "Studio Active"
								})]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setCommandOpen(true),
								className: "hidden sm:flex h-10 items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#121318] px-3.5 text-sm text-zinc-400 shadow-sm transition-colors hover:border-zinc-700 hover:text-zinc-200 w-52 sm:w-64 md:w-72",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", {
										className: "truncate text-xs sm:text-[13px]",
										children: "Search or jump…"
									})]
								}), /* @__PURE__ */ jsx("kbd", {
									className: "rounded-md border border-zinc-750 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400",
									children: "⌘K"
								})]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setCreateOpen(true),
								className: "flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 shadow-sm transition-all hover:bg-zinc-200 active:scale-[0.98]",
								title: "New Request (Press C)",
								children: [
									/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
									/* @__PURE__ */ jsx("span", {
										className: "hidden md:inline",
										children: "New Request"
									}),
									/* @__PURE__ */ jsx("kbd", {
										className: "hidden lg:inline rounded-md bg-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-800",
										children: "C"
									})
								]
							}),
							/* @__PURE__ */ jsx(NotificationPopover, {})
						]
					})]
				}), /* @__PURE__ */ jsx("main", {
					className: "w-full flex-1 p-6 sm:p-8",
					children
				})]
			}),
			/* @__PURE__ */ jsx(CommandPalette, {
				open: commandOpen,
				setOpen: setCommandOpen,
				onOpenCreate: () => setCreateOpen(true),
				onOpenShortcuts: () => setShortcutsOpen(true),
				projects
			}),
			/* @__PURE__ */ jsx(ShortcutsModal, {
				open: shortcutsOpen,
				onClose: () => setShortcutsOpen(false)
			}),
			/* @__PURE__ */ jsx(QuickCreateModal, {
				show: createOpen,
				onClose: () => setCreateOpen(false),
				projects,
				users,
				onFinished: () => router.reload()
			}),
			/* @__PURE__ */ jsx(Toaster, {
				theme: "dark",
				position: "bottom-right",
				closeButton: true,
				toastOptions: { className: "rounded-xl border border-white/[0.08] bg-[#090a0f]/95 text-zinc-100 shadow-2xl backdrop-blur-xl text-xs font-medium ring-1 ring-white/[0.04]" }
			})
		]
	});
}
//#endregion
export { BoardFilterBar as C, Badge as S, Modal as T, QuickViewDrawer as _, useKanbanBoard as a, RequestListView as b, RequestDiscussionSection as c, Card as d, RequestBlockerBanner as f, notifySuccess as g, notifyError as h, useBoardFilters as i, RequestMediaGallery as l, QuickCreateModal as m, formatRelativeTime as n, triggerConfetti as o, RequestHeroHeader as p, getNotificationBadge as r, RequestSidebarProperties as s, Authenticated as t, RequestDescriptionCard as u, ImageLightbox as v, BoardHeader as w, KanbanBoard as x, BulkActionBar as y };
