import { t as Authenticated } from "./AuthenticatedLayout-CmuF4Gg9.js";
import { a as DiscordWebhookCard, i as DiscordLivePreview, n as EmailLivePreview, o as IntegrationKpiTiles, r as EmailTemplateCard, t as DeliveryLogTable } from "./Integrations-ei35FbPM.js";
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
						children: "Settings"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-zinc-600",
						children: "/"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500",
						children: "Notifications"
					})
				]
			}), /* @__PURE__ */ jsxs("h1", {
				className: "mt-1 text-lg font-semibold text-zinc-100 sm:text-xl flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(Radio, { className: "h-5 w-5 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Integrations & Notifications" })]
			})] }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 text-xs",
				children: /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#111216] px-3 py-1 font-medium text-emerald-400 shadow-sm",
					children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" }), "Notifications Active"]
				})
			})]
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Integrations & Notifications" }), /* @__PURE__ */ jsxs("div", {
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
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "all" ? "border border-zinc-700 bg-zinc-800 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200"}`,
								children: [/* @__PURE__ */ jsx(Layers, { className: `h-3.5 w-3.5 ${activeTab === "all" ? "text-zinc-200" : "text-zinc-500"}` }), /* @__PURE__ */ jsx("span", { children: "All Channels" })]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setActiveTab("discord"),
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "discord" ? "border border-zinc-700 bg-zinc-800 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200"}`,
								children: [
									/* @__PURE__ */ jsx(Bot, { className: `h-3.5 w-3.5 ${activeTab === "discord" ? "text-zinc-200" : "text-zinc-500"}` }),
									/* @__PURE__ */ jsx("span", { children: "Discord Webhook" }),
									/* @__PURE__ */ jsx("span", {
										className: `rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${discord.enabled && discord.configured ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" : "bg-zinc-850 text-zinc-500"}`,
										children: discord.enabled && discord.configured ? "Live" : "Off"
									})
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setActiveTab("email"),
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "email" ? "border border-zinc-700 bg-zinc-800 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200"}`,
								children: [
									/* @__PURE__ */ jsx(Mail, { className: `h-3.5 w-3.5 ${activeTab === "email" ? "text-zinc-200" : "text-zinc-500"}` }),
									/* @__PURE__ */ jsx("span", { children: "Email Templates" }),
									/* @__PURE__ */ jsx("span", {
										className: `rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${activeTab === "email" ? "bg-zinc-750 text-zinc-300" : "bg-zinc-850 text-zinc-500"}`,
										children: email.mailer.toUpperCase()
									})
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setActiveTab("logs"),
								className: `flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${activeTab === "logs" ? "border border-zinc-700 bg-zinc-800 text-white shadow-sm" : "border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200"}`,
								children: [
									/* @__PURE__ */ jsx(Activity, { className: `h-3.5 w-3.5 ${activeTab === "logs" ? "text-zinc-200" : "text-zinc-500"}` }),
									/* @__PURE__ */ jsx("span", { children: "Delivery Logs" }),
									/* @__PURE__ */ jsx("span", {
										className: `rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${activeTab === "logs" ? "bg-zinc-750 text-zinc-300" : "bg-zinc-850 text-zinc-500"}`,
										children: logs.length
									})
								]
							})
						]
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500 font-mono hidden md:inline",
						children: "Email & Discord Notifications"
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
