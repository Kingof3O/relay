import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { t as Guest } from "./GuestLayout-CxXtvs86.js";
import { Head, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Sparkles, User } from "lucide-react";
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
					className: "space-y-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "relative my-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "absolute inset-0 flex items-center",
							children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-zinc-800" })
						}), /* @__PURE__ */ jsx("div", {
							className: "relative flex justify-center text-xs uppercase",
							children: /* @__PURE__ */ jsx("span", {
								className: "bg-[#121318] px-2 text-[10px] font-medium tracking-wider text-zinc-500",
								children: "Or continue with"
							})
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ jsxs("a", {
							href: route("auth.social.redirect", { provider: "github" }),
							className: "inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-[#1a1c26] hover:text-white active:scale-[0.98]",
							children: [/* @__PURE__ */ jsx("svg", {
								className: "h-4 w-4 fill-current",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									fillRule: "evenodd",
									clipRule: "evenodd",
									d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								})
							}), /* @__PURE__ */ jsx("span", { children: "GitHub" })]
						}), /* @__PURE__ */ jsxs("a", {
							href: route("auth.social.redirect", { provider: "google" }),
							className: "inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-[#1a1c26] hover:text-white active:scale-[0.98]",
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
							}), /* @__PURE__ */ jsx("span", { children: "Google" })]
						})]
					})]
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
