import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { t as ApplicationLogo } from "./ApplicationLogo-BVzx5-Vz.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, ShieldCheck, Sparkles, User } from "lucide-react";
//#region resources/js/Components/Checkbox.tsx
function Checkbox({ className = "", ...props }) {
	return /* @__PURE__ */ jsx("input", {
		...props,
		type: "checkbox",
		className: "h-4 w-4 rounded-md border-white/10 bg-[#0b0f19] text-violet-600 focus:ring-violet-500/40 focus:ring-offset-0 transition-colors " + className
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
//#region resources/js/Pages/Auth/Login.tsx
var DEMO_PERSONAS = [
	{
		username: "robin",
		name: "Robin",
		role: "Owner",
		initials: "R"
	},
	{
		username: "hussien",
		name: "Hussien",
		role: "Lead Dev",
		initials: "H"
	},
	{
		username: "brother",
		name: "Brother",
		role: "Developer",
		initials: "B"
	},
	{
		username: "designer-1",
		name: "Maya",
		role: "UI/UX Lead",
		initials: "M"
	}
];
function Login() {
	const { data, setData, post, processing, errors, reset } = useForm({
		username: "",
		password: "",
		remember: false
	});
	const [showPassword, setShowPassword] = useState(false);
	const [activePersona, setActivePersona] = useState(null);
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
	return /* @__PURE__ */ jsxs(Guest, { children: [
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
			className: "mb-6 text-center",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-xl font-bold tracking-tight text-white",
				children: "Sign In"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-zinc-400",
				children: "Access your workspace mission control"
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
						className: "w-full justify-center py-2.5",
						disabled: processing,
						children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-zinc-950" }), /* @__PURE__ */ jsx("span", { children: "Signing in…" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { children: "Continue to Workspace" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })] })
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 border-t border-zinc-800/80 pt-5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-zinc-400" }), /* @__PURE__ */ jsx("p", {
								className: "text-[10px] font-semibold uppercase tracking-wider text-zinc-400",
								children: "1-Click Demo Personas"
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[10px] text-zinc-500 font-mono",
							children: "pwd: password"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-2 gap-2",
						children: DEMO_PERSONAS.map((persona) => {
							const isSelected = activePersona === persona.username;
							return /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => selectPersona(persona),
								className: `group flex items-center justify-between rounded-lg border p-2 text-left transition-all duration-150 active:scale-[0.98] ${isSelected ? "border-white/20 bg-zinc-800 shadow-sm" : "border-zinc-800 bg-[#14151b] hover:border-zinc-700 hover:bg-[#181a22]"}`,
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 min-w-0",
									children: [/* @__PURE__ */ jsx("div", {
										className: `flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${isSelected ? "bg-white text-zinc-950 font-bold" : "border border-zinc-700 bg-zinc-800 text-zinc-300"}`,
										children: persona.initials
									}), /* @__PURE__ */ jsxs("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ jsx("p", {
											className: "truncate text-xs font-medium text-zinc-200 group-hover:text-white",
											children: persona.name
										}), /* @__PURE__ */ jsx("p", {
											className: "truncate text-[10px] text-zinc-500",
											children: persona.role
										})]
									})]
								}), isSelected && /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 shrink-0 text-emerald-400" })]
							}, persona.username);
						})
					})]
				})
			]
		})
	] });
}
//#endregion
export { Login as default };
