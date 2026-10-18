import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { t as Guest } from "./GuestLayout-CxXtvs86.js";
import { Head, useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ArrowRight, Building2, Eye, EyeOff, Loader2, Lock, Mail, Shield, User } from "lucide-react";
//#region resources/js/Pages/Auth/AcceptInvitation.tsx
function AcceptInvitation({ invitation }) {
	const { data, setData, post, processing, errors, reset } = useForm({
		name: "",
		username: "",
		password: "",
		password_confirmation: ""
	});
	const [showPassword, setShowPassword] = useState(false);
	const submit = (e) => {
		e.preventDefault();
		post(route("invitations.store", invitation.token), { onFinish: () => reset("password", "password_confirmation") });
	};
	const workspaceName = invitation.workspace?.name ?? "Relay Workspace";
	const roleName = invitation.role?.name ?? "Team Member";
	return /* @__PURE__ */ jsxs(Guest, { children: [
		/* @__PURE__ */ jsx(Head, { title: `Join ${workspaceName} · Relay Studio` }),
		/* @__PURE__ */ jsx("div", {
			className: "mb-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 p-5 shadow-lg",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/20 text-cyan-300",
					children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-sm font-bold text-white",
						children: workspaceName
					}), /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300",
						children: [/* @__PURE__ */ jsx(Shield, { className: "h-2.5 w-2.5" }), roleName]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-0.5 flex items-center gap-1 text-xs text-zinc-400",
					children: [/* @__PURE__ */ jsx(Mail, { className: "h-3 w-3 text-zinc-500" }), /* @__PURE__ */ jsx("span", { children: invitation.email })]
				})] })]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-6",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-bold text-zinc-100 tracking-tight",
				children: "Complete your account"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-zinc-400 leading-relaxed",
				children: "Set up your display name and password to accept this invitation and enter the workspace."
			})]
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "name",
						value: "Full Name",
						className: "text-xs font-semibold text-zinc-300"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative mt-1.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500",
							children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4" })
						}), /* @__PURE__ */ jsx(TextInput_default, {
							id: "name",
							name: "name",
							value: data.name,
							className: "block w-full rounded-xl border-zinc-800 bg-[#12131a] pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20",
							placeholder: "Alex Smith",
							autoComplete: "name",
							isFocused: true,
							onChange: (e) => setData("name", e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.name,
						className: "mt-1.5"
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "username",
						value: "Username",
						className: "text-xs font-semibold text-zinc-300"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative mt-1.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 font-mono text-xs",
							children: "@"
						}), /* @__PURE__ */ jsx(TextInput_default, {
							id: "username",
							name: "username",
							value: data.username,
							className: "block w-full rounded-xl border-zinc-800 bg-[#12131a] pl-10 pr-4 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20",
							placeholder: "alexsmith",
							autoComplete: "username",
							onChange: (e) => setData("username", e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.username,
						className: "mt-1.5"
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "password",
						value: "Password",
						className: "text-xs font-semibold text-zinc-300"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative mt-1.5",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500",
								children: /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ jsx(TextInput_default, {
								id: "password",
								type: showPassword ? "text" : "password",
								name: "password",
								value: data.password,
								className: "block w-full rounded-xl border-zinc-800 bg-[#12131a] pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20",
								placeholder: "Min. 8 characters",
								autoComplete: "new-password",
								onChange: (e) => setData("password", e.target.value),
								required: true
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowPassword(!showPassword),
								className: "absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors",
								children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
							})
						]
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.password,
						className: "mt-1.5"
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "password_confirmation",
						value: "Confirm Password",
						className: "text-xs font-semibold text-zinc-300"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative mt-1.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500",
							children: /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" })
						}), /* @__PURE__ */ jsx(TextInput_default, {
							id: "password_confirmation",
							type: showPassword ? "text" : "password",
							name: "password_confirmation",
							value: data.password_confirmation,
							className: "block w-full rounded-xl border-zinc-800 bg-[#12131a] pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20",
							placeholder: "Re-enter your password",
							autoComplete: "new-password",
							onChange: (e) => setData("password_confirmation", e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.password_confirmation,
						className: "mt-1.5"
					})
				] }),
				/* @__PURE__ */ jsx("div", {
					className: "pt-2",
					children: /* @__PURE__ */ jsx(PrimaryButton, {
						className: "w-full justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50",
						disabled: processing,
						children: processing ? /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Joining workspace..." })]
						}) : /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", { children: "Accept Invitation & Enter" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })]
						})
					})
				})
			]
		})
	] });
}
//#endregion
export { AcceptInvitation as default };
