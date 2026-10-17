import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { t as Authenticated } from "./AuthenticatedLayout-BDkBDsK0.js";
import { n as getAvatarGradient, r as getRoleBadgeStyle } from "./TeamManagementCard-DhJIhOln.js";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState } from "react";
import { Activity, AlertCircle, AtSign, Bell, Calendar, Check, CheckCircle2, Circle, Copy, ExternalLink, Eye, EyeOff, Hash, KanbanSquare, KeyRound, Layers, LayoutDashboard, Loader2, Lock, Mail, MessageSquare, Radio, RefreshCw, Shield, ShieldCheck, Sparkles, TrendingUp, User, UserCheck, Zap } from "lucide-react";
import { Transition } from "@headlessui/react";
import { toast } from "sonner";
//#region resources/js/Features/Profile/components/UpdatePasswordForm.tsx
function calculateStrength(pwd) {
	if (!pwd) return {
		score: 0,
		label: "None",
		widthClass: "w-0",
		barColor: "bg-zinc-700",
		textColor: "text-zinc-500"
	};
	let points = 0;
	if (pwd.length >= 8) points++;
	if (pwd.length >= 12) points++;
	if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) points++;
	if (/\d/.test(pwd)) points++;
	if (/[^A-Za-z0-9]/.test(pwd)) points++;
	let score = 1;
	if (points >= 5) score = 4;
	else if (points >= 3) score = 3;
	else if (points >= 2) score = 2;
	else score = 1;
	switch (score) {
		case 1: return {
			score: 1,
			label: "Weak",
			widthClass: "w-1/4",
			barColor: "bg-rose-500",
			textColor: "text-rose-400"
		};
		case 2: return {
			score: 2,
			label: "Fair",
			widthClass: "w-2/4",
			barColor: "bg-amber-500",
			textColor: "text-amber-400"
		};
		case 3: return {
			score: 3,
			label: "Good",
			widthClass: "w-3/4",
			barColor: "bg-cyan-500",
			textColor: "text-cyan-400"
		};
		case 4: return {
			score: 4,
			label: "Strong",
			widthClass: "w-full",
			barColor: "bg-emerald-500",
			textColor: "text-emerald-400"
		};
		default: return {
			score: 1,
			label: "Weak",
			widthClass: "w-1/4",
			barColor: "bg-rose-500",
			textColor: "text-rose-400"
		};
	}
}
function UpdatePasswordForm({ className = "" }) {
	const passwordInput = useRef(null);
	const currentPasswordInput = useRef(null);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
		current_password: "",
		password: "",
		password_confirmation: ""
	});
	const strength = useMemo(() => calculateStrength(data.password), [data.password]);
	const reqs = useMemo(() => {
		return {
			length: data.password.length >= 8,
			mixed: /[a-z]/.test(data.password) && /[A-Z]/.test(data.password),
			numberOrSymbol: /[\d\W]/.test(data.password),
			matches: data.password.length > 0 && data.password === data.password_confirmation
		};
	}, [data.password, data.password_confirmation]);
	const updatePassword = (e) => {
		e.preventDefault();
		put(route("password.update"), {
			preserveScroll: true,
			onSuccess: () => reset(),
			onError: (errors) => {
				if (errors.password) {
					reset("password", "password_confirmation");
					passwordInput.current?.focus();
				}
				if (errors.current_password) {
					reset("current_password");
					currentPasswordInput.current?.focus();
				}
			}
		});
	};
	const hasErrors = Boolean(errors.current_password || errors.password || errors.password_confirmation);
	return /* @__PURE__ */ jsxs("section", {
		className: `rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7 ${className}`,
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
						children: /* @__PURE__ */ jsx(KeyRound, { className: "h-4 w-4 text-cyan-400" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "text-sm font-semibold text-zinc-100",
						children: "Security & Credentials"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-zinc-400",
						children: "Ensure your account credentials are secured with a high-entropy passphrase."
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#121318] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400",
					children: [/* @__PURE__ */ jsx(Shield, { className: "h-3 w-3 text-cyan-400" }), /* @__PURE__ */ jsx("span", { children: "Argon2id Hash" })]
				})]
			}),
			hasErrors && /* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300",
				children: [/* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-rose-400" }), /* @__PURE__ */ jsxs("div", {
					className: "space-y-0.5",
					children: [
						errors.current_password && /* @__PURE__ */ jsx("p", { children: errors.current_password }),
						errors.password && /* @__PURE__ */ jsx("p", { children: errors.password }),
						errors.password_confirmation && /* @__PURE__ */ jsx("p", { children: errors.password_confirmation })
					]
				})]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: updatePassword,
				className: "mt-6 space-y-5",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(InputLabel, {
							htmlFor: "current_password",
							value: "Current Password"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "relative mt-1.5",
							children: [
								/* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }),
								/* @__PURE__ */ jsx(TextInput_default, {
									id: "current_password",
									ref: currentPasswordInput,
									value: data.current_password,
									onChange: (e) => setData("current_password", e.target.value),
									type: showCurrentPassword ? "text" : "password",
									className: "block w-full pl-9 pr-10 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]",
									autoComplete: "current-password",
									placeholder: "Enter current password"
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowCurrentPassword((prev) => !prev),
									className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200",
									children: showCurrentPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
								})
							]
						}),
						/* @__PURE__ */ jsx(InputError, {
							message: errors.current_password,
							className: "mt-2"
						})
					] }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-5 sm:grid-cols-2",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(InputLabel, {
								htmlFor: "password",
								value: "New Passphrase"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "relative mt-1.5",
								children: [
									/* @__PURE__ */ jsx(KeyRound, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }),
									/* @__PURE__ */ jsx(TextInput_default, {
										id: "password",
										ref: passwordInput,
										value: data.password,
										onChange: (e) => setData("password", e.target.value),
										type: showNewPassword ? "text" : "password",
										className: "block w-full pl-9 pr-10 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]",
										autoComplete: "new-password",
										placeholder: "Minimum 8 characters"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setShowNewPassword((prev) => !prev),
										className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200",
										children: showNewPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
									})
								]
							}),
							/* @__PURE__ */ jsx(InputError, {
								message: errors.password,
								className: "mt-2"
							})
						] }), /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(InputLabel, {
								htmlFor: "password_confirmation",
								value: "Confirm New Passphrase"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "relative mt-1.5",
								children: [
									/* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }),
									/* @__PURE__ */ jsx(TextInput_default, {
										id: "password_confirmation",
										value: data.password_confirmation,
										onChange: (e) => setData("password_confirmation", e.target.value),
										type: showConfirmPassword ? "text" : "password",
										className: "block w-full pl-9 pr-10 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]",
										autoComplete: "new-password",
										placeholder: "Re-enter new passphrase"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setShowConfirmPassword((prev) => !prev),
										className: "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200",
										children: showConfirmPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
									})
								]
							}),
							/* @__PURE__ */ jsx(InputError, {
								message: errors.password_confirmation,
								className: "mt-2"
							})
						] })]
					}),
					data.password && /* @__PURE__ */ jsxs("div", {
						className: "rounded-lg border border-zinc-800/80 bg-[#090a0f] p-3.5 space-y-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between text-[11px]",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-medium text-zinc-400",
								children: "Password Entropy Strength:"
							}), /* @__PURE__ */ jsx("span", {
								className: `font-bold uppercase tracking-wider ${strength.textColor}`,
								children: strength.label
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-4 gap-1.5",
							children: [
								/* @__PURE__ */ jsx("div", { className: `h-1.5 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.barColor : "bg-zinc-800"}` }),
								/* @__PURE__ */ jsx("div", { className: `h-1.5 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.barColor : "bg-zinc-800"}` }),
								/* @__PURE__ */ jsx("div", { className: `h-1.5 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.barColor : "bg-zinc-800"}` }),
								/* @__PURE__ */ jsx("div", { className: `h-1.5 rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.barColor : "bg-zinc-800"}` })
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-xl border border-zinc-800/80 bg-[#090a0f] p-4 space-y-2.5 text-xs",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-[11px] font-bold uppercase tracking-wider text-zinc-400",
							children: "Requirements Checklist"
						}), /* @__PURE__ */ jsxs("div", {
							className: "grid gap-2.5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [reqs.length ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-400" }) : /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5 text-zinc-600" }), /* @__PURE__ */ jsx("span", {
										className: reqs.length ? "font-medium text-zinc-200" : "text-zinc-500",
										children: "At least 8 characters"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [reqs.mixed ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-400" }) : /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5 text-zinc-600" }), /* @__PURE__ */ jsx("span", {
										className: reqs.mixed ? "font-medium text-zinc-200" : "text-zinc-500",
										children: "Upper & lowercase letters"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [reqs.numberOrSymbol ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-400" }) : /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5 text-zinc-600" }), /* @__PURE__ */ jsx("span", {
										className: reqs.numberOrSymbol ? "font-medium text-zinc-200" : "text-zinc-500",
										children: "Number or symbol"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [reqs.matches ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-400" }) : /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5 text-zinc-600" }), /* @__PURE__ */ jsx("span", {
										className: reqs.matches ? "font-medium text-zinc-200" : "text-zinc-500",
										children: "Passphrases match"
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-t border-zinc-800/80 pt-4",
						children: [/* @__PURE__ */ jsx(PrimaryButton, {
							disabled: processing,
							className: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-sm",
							children: processing ? /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Updating credentials…" })]
							}) : "Update Password"
						}), /* @__PURE__ */ jsx(Transition, {
							show: recentlySuccessful,
							enter: "transition ease-in-out duration-300",
							enterFrom: "opacity-0 translate-y-1",
							leave: "transition ease-in-out duration-300",
							leaveTo: "opacity-0 translate-y-1",
							children: /* @__PURE__ */ jsxs("p", {
								className: "flex items-center gap-1.5 text-xs font-semibold text-emerald-400",
								children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Password updated successfully" })]
							})
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Profile/components/UpdateProfileInformationForm.tsx
function UpdateProfileInformation({ className = "" }) {
	const user = usePage().props.auth.user;
	const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
		name: user.name,
		username: user.username,
		email: user.email ?? ""
	});
	const submit = (e) => {
		e.preventDefault();
		patch(route("profile.update"));
	};
	const hasErrors = Object.keys(errors).length > 0;
	return /* @__PURE__ */ jsxs("section", {
		className: `rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7 ${className}`,
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
						children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-violet-400" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "text-sm font-semibold text-zinc-100",
						children: "Profile Information"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-zinc-400",
						children: "Update your public display identity, system handle, and notification address."
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#121318] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400",
					children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Public Identity" })]
				})]
			}),
			hasErrors && /* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300",
				children: [/* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-rose-400" }), /* @__PURE__ */ jsx("div", {
					className: "space-y-0.5",
					children: Object.values(errors).map((err, i) => /* @__PURE__ */ jsx("p", { children: err }, i))
				})]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "mt-6 space-y-5",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 gap-5 sm:grid-cols-2",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(InputLabel, {
								htmlFor: "name",
								value: "Display Name"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "relative mt-1.5",
								children: [/* @__PURE__ */ jsx(User, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }), /* @__PURE__ */ jsx(TextInput_default, {
									id: "name",
									className: "block w-full pl-9 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]",
									value: data.name,
									onChange: (e) => setData("name", e.target.value),
									required: true,
									isFocused: true,
									autoComplete: "name",
									placeholder: "Your full name"
								})]
							}),
							/* @__PURE__ */ jsx(InputError, {
								className: "mt-2",
								message: errors.name
							})
						] }), /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(InputLabel, {
								htmlFor: "username",
								value: "Username Handle"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "relative mt-1.5",
								children: [/* @__PURE__ */ jsx(AtSign, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }), /* @__PURE__ */ jsx(TextInput_default, {
									id: "username",
									type: "text",
									className: "block w-full pl-9 font-mono text-violet-300 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]",
									value: data.username,
									onChange: (e) => setData("username", e.target.value),
									required: true,
									autoComplete: "username",
									placeholder: "handle (e.g. alex)"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[11px] text-zinc-500",
								children: "Identifier for mentions, task assignments, and activity logs."
							}),
							/* @__PURE__ */ jsx(InputError, {
								className: "mt-2",
								message: errors.username
							})
						] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(InputLabel, {
							htmlFor: "email",
							value: "Email Address"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "relative mt-1.5",
							children: [/* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" }), /* @__PURE__ */ jsx(TextInput_default, {
								id: "email",
								type: "email",
								className: "block w-full pl-9 bg-[#121318] border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820]",
								value: data.email,
								onChange: (e) => setData("email", e.target.value),
								autoComplete: "email",
								placeholder: "name@studio.relay"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] text-zinc-500",
							children: "Transactional notifications, ticket alerts, and weekly digest emails will be sent here."
						}),
						/* @__PURE__ */ jsx(InputError, {
							className: "mt-2",
							message: errors.email
						})
					] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-t border-zinc-800/80 pt-4",
						children: [/* @__PURE__ */ jsx(PrimaryButton, {
							disabled: processing,
							className: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-sm",
							children: processing ? /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Saving changes…" })]
							}) : "Save Profile"
						}), /* @__PURE__ */ jsx(Transition, {
							show: recentlySuccessful,
							enter: "transition ease-in-out duration-300",
							enterFrom: "opacity-0 translate-y-1",
							leave: "transition ease-in-out duration-300",
							leaveTo: "opacity-0 translate-y-1",
							children: /* @__PURE__ */ jsxs("p", {
								className: "flex items-center gap-1.5 text-xs font-semibold text-emerald-400",
								children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Profile updated successfully" })]
							})
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Profile/components/VisualIdentityHero.tsx
function getInitials(name) {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	return name.slice(0, 2).toUpperCase();
}
function formatJoined(dateStr) {
	if (!dateStr) return "Active Contributor";
	try {
		return `Joined ${new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			year: "numeric"
		})}`;
	} catch {
		return "Active Contributor";
	}
}
function VisualIdentityHero({ stats }) {
	const user = usePage().props.auth.user;
	const role = usePage().props.auth.role;
	const assignedCount = stats?.assigned_count ?? 0;
	const completedCount = stats?.completed_count ?? 0;
	const activeCount = Math.max(0, assignedCount - completedCount);
	const completionRate = assignedCount > 0 ? Math.round(completedCount / assignedCount * 100) : 100;
	const gradient = getAvatarGradient(user.username || user.name);
	const roleBadge = getRoleBadgeStyle(role?.name || user.role?.name);
	const joinedText = formatJoined(user.created_at);
	return /* @__PURE__ */ jsxs("section", {
		className: "relative overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7",
		children: [
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/[0.05] blur-3xl" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-cyan-600/[0.04] blur-3xl" }),
			/* @__PURE__ */ jsxs("div", {
				className: "relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-5 sm:flex-row sm:items-center",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "relative shrink-0",
						children: [/* @__PURE__ */ jsx("div", {
							className: `flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl sm:text-3xl font-extrabold text-white shadow-xl ring-2 ring-white/10`,
							children: getInitials(user.name)
						}), /* @__PURE__ */ jsx("span", {
							className: "absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-[#0c0d12] shadow-[0_0_10px_rgba(52,211,153,0.8)]",
							title: "Active Session"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-2.5",
								children: [/* @__PURE__ */ jsx("h2", {
									className: "text-2xl sm:text-3xl font-bold tracking-tight text-white",
									children: user.name
								}), /* @__PURE__ */ jsxs("span", {
									className: "rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-300",
									children: ["@", user.username]
								})]
							}),
							user.email && /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1.5 text-xs text-zinc-400",
								children: [/* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: user.email })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-2.5 pt-1 text-xs",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleBadge.pillClass}`,
										children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${roleBadge.dotClass}` }), roleBadge.label]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-zinc-600",
										children: "·"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1.5 text-zinc-400",
										children: [/* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: joinedText })]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-zinc-600",
										children: "·"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400",
										children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }), /* @__PURE__ */ jsx("span", { children: "Studio Contributor" })]
									})
								]
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#121318]/90 p-4 sm:p-5 shadow-inner xl:min-w-[440px]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-0.5",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400",
										children: [/* @__PURE__ */ jsx(Activity, { className: "h-3 w-3 text-cyan-400" }), /* @__PURE__ */ jsx("span", { children: "Assigned" })]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight text-white",
										children: assignedCount
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "text-[10px] text-zinc-500",
										children: [activeCount, " in-flight"]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-0.5 border-x border-zinc-800/80 px-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400",
										children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-emerald-400" }), /* @__PURE__ */ jsx("span", { children: "Completed" })]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight text-emerald-300",
										children: completedCount
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-[10px] text-zinc-500",
										children: "Shipped done"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-0.5 pl-1",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400",
										children: [/* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 text-violet-400" }), /* @__PURE__ */ jsx("span", { children: "Velocity" })]
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight text-violet-300",
										children: [completionRate, "%"]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-[10px] text-zinc-500",
										children: "Close rate"
									})
								]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5 border-t border-zinc-800/80 pt-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between text-[11px]",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "font-medium text-zinc-400 flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx(Layers, { className: "h-3 w-3 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Throughput Velocity" })]
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-mono text-xs font-semibold text-zinc-300",
								children: [
									completedCount,
									"/",
									assignedCount,
									" closed (",
									completionRate,
									"%)"
								]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "h-2 w-full overflow-hidden rounded-full bg-zinc-800 p-0.5 border border-zinc-750",
							children: /* @__PURE__ */ jsx("div", {
								className: "h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]",
								style: { width: `${Math.min(100, Math.max(completionRate, 4))}%` }
							})
						})]
					})]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Features/Profile/components/AccountTelemetryCard.tsx
function AccountTelemetryCard({ stats }) {
	const pageProps = usePage().props;
	const user = pageProps.auth.user;
	const role = pageProps.auth.role;
	const permissions = pageProps.auth.permissions ?? [];
	const [copiedKey, setCopiedKey] = useState(null);
	const copyToClipboard = (text, key) => {
		navigator.clipboard?.writeText(text);
		setCopiedKey(key);
		setTimeout(() => setCopiedKey(null), 2e3);
	};
	const roleBadge = getRoleBadgeStyle(role?.name || user.role?.name);
	const assignedCount = stats?.assigned_count ?? 0;
	const capabilities = permissions.length > 0 ? permissions : [
		"Workspace Triage & Dispatch",
		"Ticket Lifecycle Transitions",
		"Media & Asset Attachments",
		"Real-time Notifications"
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
							children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-emerald-400" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-semibold text-zinc-100",
							children: "Account Telemetry"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-zinc-400",
							children: "Identity attributes & security posture"
						})] })]
					}), /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300",
						children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" }), "Active"]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 divide-y divide-zinc-800/60 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2 text-zinc-400",
								children: [/* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Display Name" })]
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium text-zinc-200",
								children: user.name
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2 text-zinc-400",
								children: [/* @__PURE__ */ jsx(AtSign, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Username" })]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => copyToClipboard(`@${user.username}`, "username"),
								className: "group flex items-center gap-1.5 font-mono text-zinc-300 transition-colors hover:text-white",
								title: "Click to copy handle",
								children: [
									/* @__PURE__ */ jsxs("span", { children: ["@", user.username] }),
									/* @__PURE__ */ jsx(Copy, { className: "h-3 w-3 text-zinc-600 transition-colors group-hover:text-zinc-400" }),
									copiedKey === "username" && /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-emerald-400 font-sans",
										children: "Copied!"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2 text-zinc-400",
								children: [/* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Email" })]
							}), /* @__PURE__ */ jsx("span", {
								className: "max-w-[190px] truncate font-mono text-zinc-300",
								title: user.email ?? "Not set",
								children: user.email || "—"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2 text-zinc-400",
								children: [/* @__PURE__ */ jsx(Hash, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Account ID" })]
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-mono text-zinc-400",
								children: ["USR-", user.id.toString().padStart(4, "0")]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2 text-zinc-400",
								children: [/* @__PURE__ */ jsx(Radio, { className: "h-3.5 w-3.5 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: "Assigned Role" })]
							}), /* @__PURE__ */ jsxs("span", {
								className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleBadge.pillClass}`,
								children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${roleBadge.dotClass}` }), roleBadge.label]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 border-t border-zinc-800/80 pt-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-xs font-semibold text-zinc-200",
						children: [/* @__PURE__ */ jsx(KeyRound, { className: "h-3.5 w-3.5 text-zinc-400" }), /* @__PURE__ */ jsx("span", { children: "Role Permissions & Access" })]
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-2.5 flex flex-wrap gap-1.5",
						children: capabilities.map((perm, idx) => /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-[#121318] px-2 py-1 text-[11px] text-zinc-300",
							children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-emerald-400" }), /* @__PURE__ */ jsx("span", { children: perm })]
						}, idx))
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 rounded-lg border border-zinc-800 bg-[#090a0f] p-3.5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-xs font-semibold text-zinc-200",
						children: [/* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-cyan-400" }), /* @__PURE__ */ jsx("span", { children: "Active Session Security" })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-2 space-y-1.5 text-[11px] text-zinc-400",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Transport Security" }), /* @__PURE__ */ jsx("span", {
									className: "font-mono text-emerald-400",
									children: "TLS 1.3 / HTTPS"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Authentication Status" }), /* @__PURE__ */ jsx("span", {
									className: "text-zinc-200",
									children: "Session Verified"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Credential Encryption" }), /* @__PURE__ */ jsx("span", {
									className: "font-mono text-zinc-300",
									children: "Argon2id Keyring"
								})]
							})
						]
					})]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-between border-b border-zinc-800/80 pb-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300",
						children: /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-amber-400" })
					}), /* @__PURE__ */ jsx("h4", {
						className: "text-xs font-semibold uppercase tracking-wider text-zinc-200",
						children: "Quick Shortcuts"
					})]
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-3 space-y-2",
				children: [
					/* @__PURE__ */ jsxs(Link, {
						href: route("requests.index", { my_work: "1" }),
						className: "group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-850/60 px-3.5 py-2.5 text-xs text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx(KanbanSquare, { className: "h-4 w-4 text-cyan-400 transition-transform group-hover:scale-110" }), /* @__PURE__ */ jsx("span", { children: "My Work Queue" })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300",
								children: assignedCount
							}), /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-zinc-500 group-hover:text-zinc-300" })]
						})]
					}),
					/* @__PURE__ */ jsxs(Link, {
						href: route("dashboard"),
						className: "group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-850/60 px-3.5 py-2.5 text-xs text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4 text-violet-400 transition-transform group-hover:scale-110" }), /* @__PURE__ */ jsx("span", { children: "Studio Dashboard" })]
						}), /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-zinc-500 group-hover:text-zinc-300" })]
					}),
					/* @__PURE__ */ jsxs(Link, {
						href: route("requests.index"),
						className: "group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-850/60 px-3.5 py-2.5 text-xs text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-emerald-400 transition-transform group-hover:scale-110" }), /* @__PURE__ */ jsx("span", { children: "Workspace Triage" })]
						}), /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 text-zinc-500 group-hover:text-zinc-300" })]
					})
				]
			})]
		})]
	});
}
//#endregion
//#region resources/js/Features/Profile/components/NotificationPreferencesCard.tsx
function NotificationPreferencesCard({ className = "" }) {
	const existingPrefs = usePage().props.auth.user.notification_preferences || {};
	const { data, setData, patch, processing, recentlySuccessful } = useForm({ notification_preferences: {
		email_on_assignment: existingPrefs.email_on_assignment !== false,
		email_on_status_change: existingPrefs.email_on_status_change !== false,
		email_on_comment: existingPrefs.email_on_comment !== false
	} });
	const handleToggle = (key) => {
		setData("notification_preferences", {
			...data.notification_preferences,
			[key]: !data.notification_preferences[key]
		});
	};
	const submit = (e) => {
		e.preventDefault();
		patch(route("profile.update"), {
			preserveScroll: true,
			onSuccess: () => {
				toast.success("Notification preferences updated successfully");
			}
		});
	};
	const toggles = [
		{
			key: "email_on_assignment",
			label: "Email on Assignment",
			description: "Receive email alerts whenever work requests or issues are assigned directly to your account.",
			icon: UserCheck,
			enabled: data.notification_preferences.email_on_assignment
		},
		{
			key: "email_on_status_change",
			label: "Email on Status Change",
			description: "Receive notifications when your assigned or requested items change state (e.g. In Review, Done, Blocked).",
			icon: RefreshCw,
			enabled: data.notification_preferences.email_on_status_change
		},
		{
			key: "email_on_comment",
			label: "Email on New Comment / Mention",
			description: "Receive email notifications when team members comment on your tickets or tag you via @mentions.",
			icon: MessageSquare,
			enabled: data.notification_preferences.email_on_comment
		}
	];
	return /* @__PURE__ */ jsxs("section", {
		className: `rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7 ${className}`,
		children: [/* @__PURE__ */ jsxs("header", {
			className: "flex items-center justify-between border-b border-zinc-800/80 pb-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-cyan-400",
					children: /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-sm font-semibold text-zinc-100",
					children: "Notification Preferences"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-zinc-400",
					children: "Configure transactional email delivery rules for your workspace activities."
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#121318] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 font-mono",
				children: [/* @__PURE__ */ jsx(Mail, { className: "h-3 w-3 text-cyan-400" }), /* @__PURE__ */ jsx("span", { children: "Transactional Engine" })]
			})]
		}), /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "mt-6 space-y-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "divide-y divide-zinc-800/60 rounded-lg border border-zinc-800/80 bg-[#111216]",
				children: toggles.map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between p-4 transition-colors hover:bg-zinc-850/30",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-start gap-3.5 pr-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400",
								children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-zinc-200",
								children: item.label
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-[11px] leading-relaxed text-zinc-400",
								children: item.description
							})] })]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							role: "switch",
							"aria-checked": item.enabled,
							onClick: () => handleToggle(item.key),
							className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0c0d12] ${item.enabled ? "bg-violet-600" : "bg-zinc-800"}`,
							children: /* @__PURE__ */ jsx("span", {
								"aria-hidden": "true",
								className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item.enabled ? "translate-x-5" : "translate-x-0"}`
							})
						})]
					}, item.key);
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-4 pt-2",
				children: [/* @__PURE__ */ jsxs(PrimaryButton, {
					disabled: processing,
					className: "flex items-center gap-2",
					children: [processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Save Preferences" })]
				}), /* @__PURE__ */ jsx(Transition, {
					show: recentlySuccessful,
					enter: "transition ease-in-out duration-200",
					enterFrom: "opacity-0 translate-y-1",
					enterTo: "opacity-100 translate-y-0",
					leave: "transition ease-in-out duration-200",
					leaveFrom: "opacity-100 translate-y-0",
					leaveTo: "opacity-0 translate-y-1",
					children: /* @__PURE__ */ jsxs("p", {
						className: "flex items-center gap-1.5 text-xs text-emerald-400 font-medium",
						children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", { children: "Saved successfully." })]
					})
				})]
			})]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Profile/Edit.tsx
function Edit({ stats }) {
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 text-[11px]",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold uppercase tracking-wider text-zinc-400",
						children: "Account"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-zinc-600",
						children: "/"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-zinc-500",
						children: "Identity & Security"
					})
				]
			}), /* @__PURE__ */ jsx("h1", {
				className: "mt-1 text-lg font-semibold text-zinc-100",
				children: "Studio Profile & Credentials"
			})] }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 text-xs",
				children: /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 font-medium text-zinc-300",
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-400" }), /* @__PURE__ */ jsx("span", { children: "Identity Verified · Active Session" })]
				})
			})]
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Profile & Security · Studio Account" }), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1600px] space-y-6",
			children: [/* @__PURE__ */ jsx(VisualIdentityHero, { stats }), /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-12",
				children: [/* @__PURE__ */ jsx("div", {
					className: "space-y-6 lg:col-span-4",
					children: /* @__PURE__ */ jsx(AccountTelemetryCard, { stats })
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-6 lg:col-span-8",
					children: [
						/* @__PURE__ */ jsx(UpdateProfileInformation, {}),
						/* @__PURE__ */ jsx(NotificationPreferencesCard, {}),
						/* @__PURE__ */ jsx(UpdatePasswordForm, {})
					]
				})]
			})]
		})]
	});
}
//#endregion
export { Edit as default };
