import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { Head, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
//#region resources/js/Pages/Auth/ResetPassword.tsx
function ResetPassword({ token, email }) {
	const [showPassword, setShowPassword] = useState(false);
	const { data, setData, post, processing, errors, reset } = useForm({
		token,
		email: email || "",
		password: "",
		password_confirmation: ""
	});
	const submit = (e) => {
		e.preventDefault();
		post(route("password.store"), { onFinish: () => reset("password", "password_confirmation") });
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex min-h-screen w-full bg-[#08090d] text-zinc-100 selection:bg-indigo-500/30 selection:text-white",
		children: [/* @__PURE__ */ jsx(Head, { title: "Reset Password · Relay Studio" }), /* @__PURE__ */ jsxs("div", {
			className: "relative flex min-h-screen w-full flex-col justify-center items-center overflow-y-auto bg-[#090a0f] p-6 sm:p-10",
			children: [/* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 overflow-hidden",
				children: /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-600/[0.05] to-transparent blur-[120px]" })
			}), /* @__PURE__ */ jsxs("div", {
				className: "relative z-10 w-full max-w-[400px] space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-center text-center space-y-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111216] p-2.5 shadow-2xl",
						children: /* @__PURE__ */ jsx(KeyRound, { className: "h-6 w-6 text-indigo-400" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-semibold tracking-tight text-white",
						children: "Set new password"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-zinc-400 leading-relaxed max-w-xs",
						children: "Please choose a strong password with at least 8 characters."
					})] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "rounded-2xl border border-white/[0.08] bg-[#111217]/80 p-6 shadow-2xl backdrop-blur-xl",
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: submit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx(InputLabel, {
									htmlFor: "email",
									value: "Email",
									className: "text-xs text-zinc-400 font-medium"
								}),
								/* @__PURE__ */ jsx(TextInput_default, {
									id: "email",
									type: "email",
									name: "email",
									value: data.email,
									className: "mt-1.5 block w-full bg-[#16171f] px-3.5 py-2.5 text-sm text-zinc-300",
									autoComplete: "username",
									onChange: (e) => setData("email", e.target.value),
									required: true
								}),
								/* @__PURE__ */ jsx(InputError, {
									message: errors.email,
									className: "mt-2 text-xs"
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx(InputLabel, {
									htmlFor: "password",
									value: "New Password",
									className: "text-xs text-zinc-400 font-medium"
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
											className: "block w-full pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50",
											placeholder: "••••••••",
											autoComplete: "new-password",
											isFocused: true,
											onChange: (e) => setData("password", e.target.value),
											required: true
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => setShowPassword(!showPassword),
											className: "absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300",
											children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
										})
									]
								}),
								/* @__PURE__ */ jsx(InputError, {
									message: errors.password,
									className: "mt-2 text-xs"
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx(InputLabel, {
									htmlFor: "password_confirmation",
									value: "Confirm Password",
									className: "text-xs text-zinc-400 font-medium"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative mt-1.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500",
										children: /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" })
									}), /* @__PURE__ */ jsx(TextInput_default, {
										id: "password_confirmation",
										type: showPassword ? "text" : "password",
										name: "password_confirmation",
										value: data.password_confirmation,
										className: "block w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50",
										placeholder: "••••••••",
										autoComplete: "new-password",
										onChange: (e) => setData("password_confirmation", e.target.value),
										required: true
									})]
								}),
								/* @__PURE__ */ jsx(InputError, {
									message: errors.password_confirmation,
									className: "mt-2 text-xs"
								})
							] }),
							/* @__PURE__ */ jsx(PrimaryButton, {
								className: "w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 transition-all duration-200",
								disabled: processing,
								children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Resetting password..."] }) : /* @__PURE__ */ jsxs(Fragment, { children: ["Reset Password", /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] })
							})
						]
					})
				})]
			})]
		})]
	});
}
//#endregion
export { ResetPassword as default };
