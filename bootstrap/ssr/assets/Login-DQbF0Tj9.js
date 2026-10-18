import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { t as ApplicationLogo } from "./ApplicationLogo-BVzx5-Vz.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from "lucide-react";
//#region resources/js/Components/Checkbox.tsx
function Checkbox({ className = "", ...props }) {
	return /* @__PURE__ */ jsx("input", {
		...props,
		type: "checkbox",
		className: "h-4 w-4 rounded-md border-white/10 bg-[#0b0f19] text-violet-600 focus:ring-violet-500/40 focus:ring-offset-0 transition-colors " + className
	});
}
//#endregion
//#region resources/js/Pages/Auth/Login.tsx
var DEMO_PERSONAS = [
	{
		username: "robin",
		name: "Robin",
		role: "Owner"
	},
	{
		username: "hussien",
		name: "Hussien",
		role: "Lead Dev"
	},
	{
		username: "brother",
		name: "Brother",
		role: "Developer"
	},
	{
		username: "designer-1",
		name: "Maya",
		role: "UI/UX"
	}
];
function Login({ socialProviders = {
	github: true,
	google: true
}, status }) {
	const { data, setData, post, processing, errors, reset } = useForm({
		username: "",
		password: "",
		remember: false
	});
	const [showPassword, setShowPassword] = useState(false);
	const [activePersona, setActivePersona] = useState(null);
	const hasSocialProviders = Boolean(socialProviders?.github || socialProviders?.google);
	const bothEnabled = Boolean(socialProviders?.github && socialProviders?.google);
	const submit = (e) => {
		e.preventDefault();
		post(route("login"), { onFinish: () => reset("password") });
	};
	const selectPersona = (persona) => {
		setActivePersona(persona.username);
		setData({
			...data,
			username: persona.username,
			password: "password"
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex min-h-screen w-full bg-[#07090e] text-zinc-100 selection:bg-indigo-500/30 selection:text-white",
		children: [
			/* @__PURE__ */ jsxs(Head, {
				title: "Sign In · Relay Studio",
				children: [
					/* @__PURE__ */ jsx("meta", {
						name: "description",
						content: "Sign in to Relay Studio to access your engineering workspace, active work requests, and real-time team delivery velocity."
					}),
					/* @__PURE__ */ jsx("link", {
						rel: "canonical",
						href: route("login")
					}),
					/* @__PURE__ */ jsx("meta", {
						property: "og:title",
						content: "Sign In · Relay Studio"
					}),
					/* @__PURE__ */ jsx("meta", {
						property: "og:description",
						content: "Sign in to Relay Studio to access your engineering workspace, active work requests, and real-time team delivery velocity."
					}),
					/* @__PURE__ */ jsx("meta", {
						property: "og:url",
						content: route("login")
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative hidden w-full flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#07090e] p-10 lg:flex lg:w-1/2 xl:w-7/12 xl:p-16",
				children: [
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -left-36 -top-36 h-[640px] w-[640px] rounded-full bg-gradient-to-br from-indigo-500/[0.07] via-violet-500/[0.03] to-transparent blur-[140px]" }),
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tl from-cyan-500/[0.05] via-blue-500/[0.02] to-transparent blur-[140px]" }),
					/* @__PURE__ */ jsx("div", { className: "relay-grid pointer-events-none absolute inset-0 opacity-20" }),
					/* @__PURE__ */ jsxs("div", {
						className: "relative z-10 flex items-center justify-between",
						children: [/* @__PURE__ */ jsxs(Link, {
							href: "/",
							className: "group inline-flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#111216] p-2 shadow-xl shadow-black/40 transition-all duration-200 group-hover:scale-105 group-hover:border-white/[0.15]",
								children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "h-full w-full text-white" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-sm font-bold tracking-[0.25em] text-white",
									children: "RELAY"
								}), /* @__PURE__ */ jsx("span", {
									className: "rounded-full border border-zinc-800 bg-zinc-900/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400",
									children: "Studio"
								})]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 font-mono text-[11px] text-zinc-400 backdrop-blur-md",
							children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" }), /* @__PURE__ */ jsx("span", { children: "v2.0 · Open Source" })]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative z-10 my-auto max-w-xl py-6 space-y-8",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090a0f]/80 p-6 shadow-2xl backdrop-blur-xl",
							children: [/* @__PURE__ */ jsxs("svg", {
								viewBox: "0 0 540 220",
								fill: "none",
								xmlns: "http://www.w3.org/2000/svg",
								className: "w-full h-auto text-zinc-500",
								children: [
									/* @__PURE__ */ jsxs("defs", { children: [/* @__PURE__ */ jsxs("linearGradient", {
										id: "relayGlow",
										x1: "0%",
										y1: "0%",
										x2: "100%",
										y2: "100%",
										children: [
											/* @__PURE__ */ jsx("stop", {
												offset: "0%",
												stopColor: "#6366f1",
												stopOpacity: "0.4"
											}),
											/* @__PURE__ */ jsx("stop", {
												offset: "50%",
												stopColor: "#8b5cf6",
												stopOpacity: "0.2"
											}),
											/* @__PURE__ */ jsx("stop", {
												offset: "100%",
												stopColor: "#06b6d4",
												stopOpacity: "0.4"
											})
										]
									}), /* @__PURE__ */ jsxs("radialGradient", {
										id: "centerPulse",
										cx: "50%",
										cy: "50%",
										r: "50%",
										children: [/* @__PURE__ */ jsx("stop", {
											offset: "0%",
											stopColor: "#6366f1",
											stopOpacity: "0.35"
										}), /* @__PURE__ */ jsx("stop", {
											offset: "100%",
											stopColor: "#6366f1",
											stopOpacity: "0"
										})]
									})] }),
									/* @__PURE__ */ jsxs("g", {
										stroke: "rgba(255,255,255,0.04)",
										strokeWidth: "1",
										children: [
											/* @__PURE__ */ jsx("line", {
												x1: "40",
												y1: "20",
												x2: "500",
												y2: "20"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "40",
												y1: "70",
												x2: "500",
												y2: "70"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "40",
												y1: "120",
												x2: "500",
												y2: "120"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "40",
												y1: "170",
												x2: "500",
												y2: "170"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "40",
												y1: "20",
												x2: "40",
												y2: "200"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "155",
												y1: "20",
												x2: "155",
												y2: "200"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "270",
												y1: "20",
												x2: "270",
												y2: "200"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "385",
												y1: "20",
												x2: "385",
												y2: "200"
											}),
											/* @__PURE__ */ jsx("line", {
												x1: "500",
												y1: "20",
												x2: "500",
												y2: "200"
											})
										]
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "270",
										cy: "110",
										r: "90",
										stroke: "url(#relayGlow)",
										strokeWidth: "1.5",
										strokeDasharray: "4 4"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "270",
										cy: "110",
										r: "55",
										stroke: "rgba(255,255,255,0.12)",
										strokeWidth: "1"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "270",
										cy: "110",
										r: "28",
										fill: "url(#centerPulse)",
										stroke: "rgba(99,102,241,0.5)",
										strokeWidth: "1.5"
									}),
									/* @__PURE__ */ jsx("path", {
										d: "M70 160 L155 120 L270 110 L385 70 L470 40",
										stroke: "url(#relayGlow)",
										strokeWidth: "2",
										strokeLinecap: "round"
									}),
									/* @__PURE__ */ jsx("path", {
										d: "M70 60 L155 90 L270 110 L385 140 L470 180",
										stroke: "rgba(255,255,255,0.08)",
										strokeWidth: "1.2",
										strokeLinecap: "round"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "70",
										cy: "160",
										r: "3.5",
										fill: "#6366f1"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "155",
										cy: "120",
										r: "3",
										fill: "#818cf8"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "270",
										cy: "110",
										r: "5",
										fill: "#ffffff"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "385",
										cy: "70",
										r: "3",
										fill: "#38bdf8"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "470",
										cy: "40",
										r: "3.5",
										fill: "#2dd4bf"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "70",
										cy: "60",
										r: "2.5",
										fill: "#71717a"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "155",
										cy: "90",
										r: "2.5",
										fill: "#71717a"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "385",
										cy: "140",
										r: "2.5",
										fill: "#71717a"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "470",
										cy: "180",
										r: "2.5",
										fill: "#71717a"
									}),
									/* @__PURE__ */ jsx("text", {
										x: "50",
										y: "195",
										fill: "#71717a",
										fontSize: "9",
										fontFamily: "monospace",
										children: "NODE:IAD-1"
									}),
									/* @__PURE__ */ jsx("text", {
										x: "248",
										y: "138",
										fill: "#a1a1aa",
										fontSize: "10",
										fontFamily: "monospace",
										fontWeight: "600",
										children: "RELAY CORE"
									}),
									/* @__PURE__ */ jsx("text", {
										x: "430",
										y: "25",
										fill: "#2dd4bf",
										fontSize: "9",
										fontFamily: "monospace",
										children: "SYNC:0.1ms"
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] font-mono text-zinc-400",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-indigo-400" }), "HIGH-VELOCITY WORKSPACE"]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-zinc-500",
									children: "LATENCY < 12MS"
								})]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-4 max-w-lg",
							children: [
								/* @__PURE__ */ jsx("h1", {
									className: "text-2xl font-bold tracking-tight text-white xl:text-3xl",
									children: "The issue tracker for engineering teams that ship."
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm leading-relaxed text-zinc-400",
									children: "Linear-grade sprint cadence, live WebSockets collaboration, and sub-second keyboard navigation — built with modern open-source transparency."
								}),
								/* @__PURE__ */ jsxs("blockquote", {
									className: "border-l-2 border-indigo-500/50 pl-4 py-1 text-xs text-zinc-300 italic",
									children: ["“Relay Studio eliminated our sprint overhead. The sub-second keyboard ergonomics and obsidian interface keep our developers entirely in the flow.”", /* @__PURE__ */ jsx("footer", {
										className: "mt-1 text-[11px] font-mono text-zinc-500 not-italic",
										children: "— Engineering Lead · Relay Studio Platform"
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative z-10 flex items-center justify-between border-t border-white/[0.04] pt-6 text-xs text-zinc-500",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "relative flex h-2 w-2",
								children: [/* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500" })]
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium text-zinc-400",
								children: "All systems operational"
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "font-mono text-[11px] text-zinc-500",
							children: "SOC2 Ready · Apache 2.0"
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative flex min-h-screen w-full flex-col justify-center items-center overflow-y-auto bg-[#090a0f] p-6 sm:p-10 lg:w-1/2 lg:p-12 xl:w-5/12 xl:p-16",
				children: [/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-white/[0.03] to-transparent blur-[120px]" }), /* @__PURE__ */ jsxs("div", {
					className: "relative z-10 w-full max-w-[400px] space-y-6",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-6 flex flex-col items-center gap-3 text-center lg:hidden",
							children: [/* @__PURE__ */ jsx(Link, {
								href: "/",
								className: "flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700/80 bg-[#13141a] p-2.5 shadow-xl shadow-black/60",
								children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "h-full w-full text-white" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
								className: "text-base font-bold tracking-[0.25em] text-white",
								children: "RELAY"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-xs text-zinc-400",
								children: "Workspace Studio Platform"
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-bold tracking-tight text-white",
								children: "Sign In"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-zinc-400",
								children: "Enter your workspace credentials to continue"
							})]
						}),
						status && /* @__PURE__ */ jsx("div", {
							className: "rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300",
							children: status
						}),
						hasSocialProviders && /* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: `grid gap-2.5 ${bothEnabled ? "grid-cols-2" : "grid-cols-1"}`,
								children: [socialProviders.github && /* @__PURE__ */ jsxs("a", {
									href: route("auth.social.redirect", { provider: "github" }),
									className: "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#14151b] px-4 py-2.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:bg-[#1a1c26] hover:text-white active:scale-[0.98]",
									children: [/* @__PURE__ */ jsx("svg", {
										className: "h-4 w-4 fill-current",
										viewBox: "0 0 24 24",
										children: /* @__PURE__ */ jsx("path", {
											fillRule: "evenodd",
											clipRule: "evenodd",
											d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
										})
									}), /* @__PURE__ */ jsx("span", { children: "Continue with GitHub" })]
								}), socialProviders.google && /* @__PURE__ */ jsxs("a", {
									href: route("auth.social.redirect", { provider: "google" }),
									className: "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#14151b] px-4 py-2.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:bg-[#1a1c26] hover:text-white active:scale-[0.98]",
									children: [/* @__PURE__ */ jsxs("svg", {
										className: "h-4 w-4",
										viewBox: "0 0 24 24",
										children: [
											/* @__PURE__ */ jsx("path", {
												fill: "#4285F4",
												d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											}),
											/* @__PURE__ */ jsx("path", {
												fill: "#34A853",
												d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											}),
											/* @__PURE__ */ jsx("path", {
												fill: "#FBBC05",
												d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
											}),
											/* @__PURE__ */ jsx("path", {
												fill: "#EA4335",
												d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
											})
										]
									}), /* @__PURE__ */ jsx("span", { children: "Continue with Google" })]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "relative my-4",
								children: [/* @__PURE__ */ jsx("div", {
									className: "absolute inset-0 flex items-center",
									children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-zinc-800" })
								}), /* @__PURE__ */ jsx("div", {
									className: "relative flex justify-center text-xs uppercase",
									children: /* @__PURE__ */ jsx("span", {
										className: "bg-[#090a0f] px-2 text-[10px] font-medium tracking-wider text-zinc-500",
										children: "Or continue with credentials"
									})
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx(InputLabel, {
										htmlFor: "username",
										value: "Username or Email"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "relative mt-1.5",
										children: [/* @__PURE__ */ jsx("div", {
											className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500",
											children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4" })
										}), /* @__PURE__ */ jsx(TextInput_default, {
											id: "username",
											type: "text",
											name: "username",
											value: data.username,
											className: "block w-full pl-9",
											autoComplete: "username",
											placeholder: "e.g. robin or robin@relay.studio",
											isFocused: true,
											onChange: (e) => {
												setData("username", e.target.value);
												setActivePersona(null);
											},
											required: true
										})]
									}),
									/* @__PURE__ */ jsx(InputError, {
										message: errors.username,
										className: "mt-1.5"
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("div", {
										className: "flex items-center justify-between",
										children: /* @__PURE__ */ jsx(InputLabel, {
											htmlFor: "password",
											value: "Password"
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "relative mt-1.5",
										children: [
											/* @__PURE__ */ jsx("div", {
												className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500",
												children: /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" })
											}),
											/* @__PURE__ */ jsx(TextInput_default, {
												id: "password",
												type: showPassword ? "text" : "password",
												name: "password",
												value: data.password,
												className: "block w-full pl-9 pr-10",
												autoComplete: "current-password",
												placeholder: "••••••••",
												onChange: (e) => setData("password", e.target.value),
												required: true
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setShowPassword(!showPassword),
												className: "absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200 transition-colors",
												title: showPassword ? "Hide password" : "Show password",
												children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
											})
										]
									}),
									/* @__PURE__ */ jsx(InputError, {
										message: errors.password,
										className: "mt-1.5"
									})
								] }),
								/* @__PURE__ */ jsx("div", {
									className: "flex items-center justify-between pt-0.5",
									children: /* @__PURE__ */ jsxs("label", {
										className: "flex items-center cursor-pointer select-none",
										children: [/* @__PURE__ */ jsx(Checkbox, {
											name: "remember",
											checked: data.remember,
											onChange: (e) => setData("remember", e.target.checked || false)
										}), /* @__PURE__ */ jsx("span", {
											className: "ms-2.5 text-xs text-zinc-400 hover:text-zinc-300 transition duration-150",
											children: "Keep session active"
										})]
									})
								}),
								/* @__PURE__ */ jsx("div", {
									className: "pt-2",
									children: /* @__PURE__ */ jsx(PrimaryButton, {
										className: "w-full justify-center py-2.5 text-sm",
										disabled: processing,
										children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-zinc-950" }), /* @__PURE__ */ jsx("span", { children: "Signing in…" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { children: "Continue to Workspace" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })] })
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-6 border-t border-zinc-800/80 pt-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "mb-2.5 flex items-center justify-between text-xs text-zinc-500",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-medium text-zinc-400",
											children: "Quick demo access:"
										}), /* @__PURE__ */ jsx("span", {
											className: "font-mono text-[10px] text-zinc-500",
											children: "password: password"
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "grid grid-cols-2 gap-2",
										children: DEMO_PERSONAS.map((persona) => {
											const isSelected = activePersona === persona.username;
											return /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => selectPersona(persona),
												className: `flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all duration-150 ${isSelected ? "border-indigo-500/50 bg-indigo-500/10 text-white shadow-sm" : "border-zinc-800/80 bg-[#121318] text-zinc-300 hover:border-zinc-700 hover:text-white"}`,
												children: [/* @__PURE__ */ jsx("span", {
													className: "truncate font-medium",
													children: persona.name
												}), /* @__PURE__ */ jsx("span", {
													className: "font-mono text-[10px] text-zinc-500 ml-1.5 shrink-0",
													children: persona.role
												})]
											}, persona.username);
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-center gap-2 pt-2 text-[11px] text-zinc-500",
							children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Encrypted Studio Session · SOC2 Security Ready" })]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { Login as default };
