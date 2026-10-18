import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { t as ApplicationLogo } from "./ApplicationLogo-BVzx5-Vz.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
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
		role: "Design"
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
		className: "relative flex min-h-screen w-full bg-[#08090d] text-zinc-100 selection:bg-indigo-500/30 selection:text-white",
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
				className: "relative hidden w-full flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#07080c] p-10 lg:flex lg:w-1/2 xl:w-7/12 xl:p-16",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "pointer-events-none absolute inset-0 overflow-hidden",
						children: [
							/* @__PURE__ */ jsx("div", { className: "absolute -left-32 -top-32 h-[680px] w-[680px] rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-600/[0.07] to-transparent blur-[130px]" }),
							/* @__PURE__ */ jsx("div", { className: "absolute bottom-[-10%] right-[-10%] h-[580px] w-[580px] rounded-full bg-gradient-to-tl from-indigo-500/10 via-violet-600/[0.05] to-transparent blur-[140px]" }),
							/* @__PURE__ */ jsx("div", { className: "relay-grid absolute inset-0 opacity-20" })
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "relative z-10",
						children: /* @__PURE__ */ jsxs(Link, {
							href: "/",
							className: "group inline-flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#111216] p-2 shadow-2xl transition-all duration-200 group-hover:scale-105 group-hover:border-white/[0.15]",
								children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "h-full w-full text-white" })
							}), /* @__PURE__ */ jsx("span", {
								className: "text-base font-semibold tracking-wide text-white",
								children: "Relay"
							})]
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative z-10 my-auto max-w-lg space-y-6",
						children: [/* @__PURE__ */ jsx("h1", {
							className: "text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[44px] leading-[1.18]",
							children: "A better way to build products together."
						}), /* @__PURE__ */ jsx("p", {
							className: "text-base text-zinc-400 leading-relaxed max-w-md",
							children: "Plan sprint cycles, track issues, and coordinate delivery with the speed, clarity, and focus modern engineering teams deserve."
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "relative z-10 text-xs text-zinc-500",
						children: "Relay Studio Platform"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative flex min-h-screen w-full flex-col justify-center items-center overflow-y-auto bg-[#090a0f] p-6 sm:p-10 lg:w-1/2 lg:p-12 xl:w-5/12 xl:p-16",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative z-10 w-full max-w-[380px] space-y-6",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-6 flex items-center justify-center gap-2.5 lg:hidden",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-[#12131a] p-2",
								children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "h-full w-full text-white" })
							}), /* @__PURE__ */ jsx("span", {
								className: "text-base font-semibold tracking-wide text-white",
								children: "Relay"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-semibold tracking-tight text-white",
								children: "Sign in to your account"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-zinc-400",
								children: "Welcome back. Enter your details to continue."
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
									className: "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#121318] px-4 py-2.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:bg-[#181920] hover:text-white active:scale-[0.98]",
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
									className: "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#121318] px-4 py-2.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:bg-[#181920] hover:text-white active:scale-[0.98]",
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
									children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-zinc-800/80" })
								}), /* @__PURE__ */ jsx("div", {
									className: "relative flex justify-center text-xs uppercase",
									children: /* @__PURE__ */ jsx("span", {
										className: "bg-[#090a0f] px-2 text-[10px] font-medium tracking-wider text-zinc-500",
										children: "or continue with credentials"
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
											placeholder: "robin or robin@relay.studio",
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
											children: "Remember this device"
										})]
									})
								}),
								/* @__PURE__ */ jsx("div", {
									className: "pt-2",
									children: /* @__PURE__ */ jsx(PrimaryButton, {
										className: "w-full justify-center py-2.5 text-sm",
										disabled: processing,
										children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-zinc-950" }), /* @__PURE__ */ jsx("span", { children: "Signing in…" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { children: "Continue" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })] })
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-6 border-t border-zinc-800/80 pt-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "mb-2 flex items-center justify-between text-[11px] text-zinc-500",
										children: [/* @__PURE__ */ jsx("span", { children: "Quick demo accounts:" }), /* @__PURE__ */ jsx("span", {
											className: "font-mono text-[10px]",
											children: "password: password"
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "flex flex-wrap gap-1.5",
										children: DEMO_PERSONAS.map((persona) => {
											const isSelected = activePersona === persona.username;
											return /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => selectPersona(persona),
												className: `rounded-lg border px-2.5 py-1 text-xs transition-colors duration-150 ${isSelected ? "border-indigo-500/50 bg-indigo-500/10 text-white" : "border-zinc-800/80 bg-[#121318] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"}`,
												children: [/* @__PURE__ */ jsx("span", {
													className: "font-medium",
													children: persona.name
												}), /* @__PURE__ */ jsxs("span", {
													className: "ml-1 text-[10px] text-zinc-500",
													children: [
														"(",
														persona.role,
														")"
													]
												})]
											}, persona.username);
										})
									})]
								})
							]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Login as default };
