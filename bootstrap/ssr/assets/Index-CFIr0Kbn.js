import { t as Authenticated } from "./AuthenticatedLayout-BGgfVQov.js";
import { a as DiscordWebhookCard, i as DiscordLivePreview, n as EmailLivePreview, o as IntegrationKpiTiles, r as EmailTemplateCard, t as DeliveryLogTable } from "./Integrations-B-LOWpFJ.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Activity, Bot, Layers, Mail, Radio } from "lucide-react";
//#region resources/js/Pages/Integrations/Index.tsx
function IntegrationsIndex({ discord: initialDiscord, email: initialEmail, logs: initialLogs, kpis, canManage }) {
	const [discord, setDiscord] = useState(initialDiscord);
	const [email, setEmail] = useState(initialEmail);
	const [logs, setLogs] = useState(initialLogs);
	const [activeTab, setActiveTab] = useState("all");
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
						children: "Dispatch & Telemetry"
					})
				]
			}), /* @__PURE__ */ jsxs("h1", {
				className: "mt-1 text-lg font-semibold text-zinc-100 sm:text-xl flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(Radio, { className: "h-5 w-5 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Integrations & Notification Dispatch" })]
			})] }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 text-xs",
				children: /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#111216] px-3 py-1 font-medium text-emerald-400 shadow-sm",
					children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" }), "Dual Pipeline Active"]
				})
			})]
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Integrations & Notifications · Workspace Studio" }), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1600px] space-y-6",
			children: [
				/* @__PURE__ */ jsx(IntegrationKpiTiles, {
					discord,
					email,
					kpis
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3",
					children: [/* @__PURE__ */ jsxs("nav", {
						className: "flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111216] p-1.5 shadow-sm",
						children: [
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setActiveTab("all"),
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "all" ? "border border-violet-500/40 bg-violet-500/10 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:text-zinc-200"}`,
								children: [/* @__PURE__ */ jsx(Layers, { className: "h-3.5 w-3.5 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "All Channels" })]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setActiveTab("discord"),
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "discord" ? "border border-[#5865F2]/40 bg-[#5865F2]/10 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:text-zinc-200"}`,
								children: [
									/* @__PURE__ */ jsx(Bot, { className: "h-3.5 w-3.5 text-[#5865F2]" }),
									/* @__PURE__ */ jsx("span", { children: "Discord Webhook" }),
									/* @__PURE__ */ jsx("span", {
										className: `rounded-full px-1.5 py-0.2 text-[9px] font-bold ${discord.enabled && discord.configured ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`,
										children: discord.enabled && discord.configured ? "Live" : "Off"
									})
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setActiveTab("email"),
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "email" ? "border border-violet-500/40 bg-violet-500/10 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:text-zinc-200"}`,
								children: [
									/* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 text-violet-400" }),
									/* @__PURE__ */ jsx("span", { children: "Email Templates" }),
									/* @__PURE__ */ jsx("span", {
										className: "rounded-full px-1.5 py-0.2 text-[9px] font-bold bg-violet-500/20 text-violet-300",
										children: email.mailer.toUpperCase()
									})
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setActiveTab("logs"),
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "logs" ? "border border-cyan-500/40 bg-cyan-500/10 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:text-zinc-200"}`,
								children: [
									/* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5 text-cyan-400" }),
									/* @__PURE__ */ jsx("span", { children: "Delivery Logs" }),
									/* @__PURE__ */ jsx("span", {
										className: "rounded-full px-1.5 py-0.2 text-[9px] font-mono text-cyan-300 bg-cyan-500/20",
										children: logs.length
									})
								]
							})
						]
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500 font-mono hidden md:inline",
						children: "Dual Notification Pipeline · Asynchronous Queue"
					})]
				}),
				activeTab === "all" && /* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ jsx(DiscordWebhookCard, {
								config: discord,
								onUpdated: (newCfg) => setDiscord(newCfg),
								canManage
							}), /* @__PURE__ */ jsx(DiscordLivePreview, { config: discord })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ jsx(EmailTemplateCard, {
								config: email,
								onUpdated: (newCfg) => setEmail(newCfg),
								canManage
							}), /* @__PURE__ */ jsx(EmailLivePreview, { config: email })]
						})]
					}), /* @__PURE__ */ jsx(DeliveryLogTable, { logs })]
				}),
				activeTab === "discord" && /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
					children: [/* @__PURE__ */ jsx("div", {
						className: "lg:col-span-7",
						children: /* @__PURE__ */ jsx(DiscordWebhookCard, {
							config: discord,
							onUpdated: (newCfg) => setDiscord(newCfg),
							canManage
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "lg:col-span-5",
						children: /* @__PURE__ */ jsx(DiscordLivePreview, { config: discord })
					})]
				}),
				activeTab === "email" && /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
					children: [/* @__PURE__ */ jsx("div", {
						className: "lg:col-span-5",
						children: /* @__PURE__ */ jsx(EmailTemplateCard, {
							config: email,
							onUpdated: (newCfg) => setEmail(newCfg),
							canManage
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "lg:col-span-7",
						children: /* @__PURE__ */ jsx(EmailLivePreview, { config: email })
					})]
				}),
				activeTab === "logs" && /* @__PURE__ */ jsx(DeliveryLogTable, { logs })
			]
		})]
	});
}
//#endregion
export { IntegrationsIndex as default };
