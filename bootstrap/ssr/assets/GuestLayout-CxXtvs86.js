import { Link } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ShieldCheck } from "lucide-react";
//#region resources/js/Components/ApplicationLogo.tsx
function ApplicationLogo({ className = "h-8 w-8", ...props }) {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 36 36",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className,
		...props,
		children: [
			/* @__PURE__ */ jsx("path", {
				d: "M9 7C9 5.89543 9.89543 5 11 5H21C25.4183 5 29 8.58172 29 13C29 16.7224 26.4554 19.8506 23 20.7208V20.7208C21.7247 21.0487 21 22.2513 21 23.5685V31",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M9 5V31",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M9 18H21",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M20 22L28 31",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "21",
				cy: "11.5",
				r: "2.5",
				fill: "currentColor"
			})
		]
	});
}
//#endregion
//#region resources/js/Layouts/GuestLayout.tsx
function Guest({ children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#090a0f] p-4 text-zinc-100 selection:bg-indigo-500/30 selection:text-white",
		children: [
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/[0.04] via-zinc-800/[0.02] to-transparent blur-[140px]" }),
			/* @__PURE__ */ jsx("div", { className: "relay-grid pointer-events-none fixed inset-0 z-0 opacity-40" }),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 flex flex-col items-center gap-3",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/",
					className: "group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700/80 bg-[#13141a] p-3 shadow-xl shadow-black/60 transition-all duration-200 hover:border-zinc-500 hover:bg-[#181a22] hover:scale-105",
					title: "Relay Studio",
					children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "h-full w-full" })
				}), /* @__PURE__ */ jsxs("div", {
					className: "text-center",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-lg font-bold tracking-[0.25em] text-white",
						children: "RELAY"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-0.5 text-xs font-medium text-zinc-400",
						children: "Workspace Studio Platform"
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative z-10 mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111216] p-7 shadow-2xl shadow-black/80 backdrop-blur-xl sm:p-8",
				children
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative z-10 mt-6 flex items-center gap-2 text-[11px] text-zinc-500",
				children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Encrypted Studio Session · SOC2 Security Ready" })]
			})
		]
	});
}
//#endregion
export { Guest as t };
