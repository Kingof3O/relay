import { Head, Link } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { AlertTriangle, FileQuestion, Home, RotateCcw, Search, ShieldAlert, Terminal } from "lucide-react";
//#region resources/js/Pages/Error.tsx
function ErrorPage({ status = 404 }) {
	const config = {
		404: {
			title: "Page Not Found",
			description: "We couldn't find the page or task you're looking for. It may have been moved or deleted.",
			badge: "404 · Not Found",
			icon: FileQuestion
		},
		403: {
			title: "Access Restricted",
			description: "You don't have permission to access this page. Please contact your workspace admin if you need access.",
			badge: "403 · Forbidden",
			icon: ShieldAlert
		},
		500: {
			title: "Server Error",
			description: "Something went wrong on our end. We've logged this issue and are looking into it.",
			badge: "500 · Server Error",
			icon: AlertTriangle
		},
		419: {
			title: "Session Expired",
			description: "Your session has timed out due to inactivity. Please refresh the page to log back in.",
			badge: "419 · Session Expired",
			icon: RotateCcw
		}
	}[status] || {
		title: "Something Went Wrong",
		description: "An unexpected error occurred. Please head back to your workspace dashboard or try again.",
		badge: `${status} · Error`,
		icon: AlertTriangle
	};
	const Icon = config.icon;
	const handleSearchClick = () => {
		const event = new KeyboardEvent("keydown", {
			key: "k",
			code: "KeyK",
			metaKey: true,
			bubbles: true
		});
		document.dispatchEvent(event);
	};
	const handleReload = () => {
		window.location.reload();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative min-h-screen w-full bg-[#07090e] text-zinc-100 flex flex-col justify-between selection:bg-violet-500/30 selection:text-violet-200 overflow-hidden font-sans",
		children: [
			/* @__PURE__ */ jsx(Head, { title: `${status} · ${config.title} — Relay Studio` }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-violet-600/10 blur-[140px]" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[600px] rounded-full bg-indigo-600/10 blur-[130px]" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[600px] rounded-full bg-emerald-600/5 blur-[120px]" }),
			/* @__PURE__ */ jsx("header", {
				className: "relative z-10 border-b border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-md px-6 py-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-[1600px] items-center justify-between",
					children: [/* @__PURE__ */ jsxs(Link, {
						href: "/dashboard",
						className: "group flex items-center gap-2.5 transition-opacity hover:opacity-90",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-600/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]",
							children: /* @__PURE__ */ jsx(Terminal, { className: "h-4 w-4" })
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm font-bold tracking-tight text-white group-hover:text-zinc-200",
								children: "Relay Studio"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono text-[10px] text-zinc-500",
								children: "Enterprise PM Engine"
							})]
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-3",
						children: /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#0c0d12] px-3 py-1 text-xs font-mono text-zinc-400",
							children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" }), /* @__PURE__ */ jsxs("span", { children: [
								"System Status: Degraded (HTTP ",
								status,
								")"
							] })]
						})
					})]
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "relative z-10 flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-2xl text-center",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "relative mb-4 flex justify-center items-center",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-mono text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-zinc-800/40 select-none",
								children: status
							}), /* @__PURE__ */ jsx("div", {
								className: "absolute inset-0 flex items-center justify-center",
								children: /* @__PURE__ */ jsx("div", {
									className: "flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-zinc-700/60 bg-[#090a0f] p-4 shadow-2xl backdrop-blur-xl",
									children: /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8 sm:h-10 sm:w-10 text-violet-400" })
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-[#0c0d12] px-3.5 py-1 text-xs font-mono font-medium text-zinc-400 shadow-sm",
							children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-rose-500" }), /* @__PURE__ */ jsx("span", { children: config.badge })]
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white",
							children: config.title
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mx-auto mt-3 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-400",
							children: config.description
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-8 flex flex-wrap items-center justify-center gap-3",
							children: [
								status === 419 && /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: handleReload,
									className: "group inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all duration-150 hover:bg-violet-500 active:scale-[0.98]",
									children: [/* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4 transition-transform group-hover:-rotate-90" }), /* @__PURE__ */ jsx("span", { children: "Reload & Restore Session" })]
								}),
								/* @__PURE__ */ jsxs(Link, {
									href: "/dashboard",
									className: "inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-100 shadow-sm transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-750 hover:text-white active:scale-[0.98]",
									children: [/* @__PURE__ */ jsx(Home, { className: "h-4 w-4 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Back to Dashboard" })]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: handleSearchClick,
									className: "inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#0c0d12] px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 shadow-sm transition-all duration-150 hover:border-zinc-700 hover:bg-[#121318] active:scale-[0.98]",
									children: [
										/* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-zinc-400" }),
										/* @__PURE__ */ jsx("span", { children: "Open Search" }),
										/* @__PURE__ */ jsx("kbd", {
											className: "hidden sm:inline-flex items-center rounded border border-zinc-700 bg-zinc-850 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400",
											children: "⌘K"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-8 border-t border-zinc-800/80 pt-6",
							children: /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-zinc-500",
								children: [
									"Looking for work items? Head to the",
									" ",
									/* @__PURE__ */ jsx(Link, {
										href: "/requests",
										className: "font-medium text-violet-400 hover:underline",
										children: "Tasks Board"
									}),
									" ",
									"or review your",
									" ",
									/* @__PURE__ */ jsx(Link, {
										href: "/settings",
										className: "font-medium text-violet-400 hover:underline",
										children: "Workspace Settings"
									}),
									"."
								]
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "relative z-10 border-t border-zinc-800/80 bg-[#090a0f]/60 px-6 py-4 text-center text-xs text-zinc-500 font-mono",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-[1600px] flex-col sm:flex-row items-center justify-between gap-2",
					children: [/* @__PURE__ */ jsx("span", { children: "Relay Studio" }), /* @__PURE__ */ jsx("span", { children: "System Diagnostics · All Systems Operational" })]
				})
			})
		]
	});
}
//#endregion
export { ErrorPage as default };
