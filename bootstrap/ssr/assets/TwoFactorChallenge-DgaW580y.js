import { i as InputError, n as PrimaryButton, r as InputLabel, t as TextInput_default } from "./TextInput-CMpMv42q.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, ShieldCheck } from "lucide-react";
//#region resources/js/Pages/Auth/TwoFactorChallenge.tsx
function TwoFactorChallenge() {
	const [recovery, setRecovery] = useState(false);
	const { data, setData, post, processing, errors, reset } = useForm({
		code: "",
		recovery_code: ""
	});
	const codeInput = useRef(null);
	const recoveryCodeInput = useRef(null);
	const toggleRecovery = () => {
		setRecovery(!recovery);
		reset("code", "recovery_code");
		setTimeout(() => {
			if (!recovery) recoveryCodeInput.current?.focus();
			else codeInput.current?.focus();
		}, 100);
	};
	const submit = (e) => {
		e.preventDefault();
		post(route("two-factor.login.store"), { onFinish: () => reset("code", "recovery_code") });
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex min-h-screen w-full bg-[#08090d] text-zinc-100 selection:bg-indigo-500/30 selection:text-white",
		children: [/* @__PURE__ */ jsx(Head, { title: "Two-Factor Verification · Relay Studio" }), /* @__PURE__ */ jsxs("div", {
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
						children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-6 w-6 text-indigo-400" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-semibold tracking-tight text-white",
						children: "Two-Factor Verification"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-zinc-400 leading-relaxed max-w-xs",
						children: !recovery ? "Enter the 6-digit verification code from your authenticator application." : "Enter one of your emergency backup recovery codes to access your account."
					})] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "rounded-2xl border border-white/[0.08] bg-[#111217]/80 p-6 shadow-2xl backdrop-blur-xl",
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: submit,
						className: "space-y-5",
						children: [
							!recovery ? /* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx(InputLabel, {
									htmlFor: "code",
									value: "Authentication Code",
									className: "text-xs text-zinc-400 font-medium"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "relative mt-1.5",
									children: /* @__PURE__ */ jsx(TextInput_default, {
										id: "code",
										ref: codeInput,
										type: "text",
										inputMode: "numeric",
										pattern: "[0-9]*",
										maxLength: 6,
										name: "code",
										value: data.code,
										className: "block w-full rounded-xl border border-white/[0.08] bg-[#16171f] px-4 py-2.5 text-center text-xl font-mono tracking-[0.4em] text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50",
										placeholder: "000000",
										autoFocus: true,
										autoComplete: "one-time-code",
										onChange: (e) => setData("code", e.target.value.replace(/\D/g, ""))
									})
								}),
								/* @__PURE__ */ jsx(InputError, {
									message: errors.code,
									className: "mt-2 text-xs"
								})
							] }) : /* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx(InputLabel, {
									htmlFor: "recovery_code",
									value: "Recovery Code",
									className: "text-xs text-zinc-400 font-medium"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative mt-1.5",
									children: [/* @__PURE__ */ jsx("div", {
										className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500",
										children: /* @__PURE__ */ jsx(KeyRound, { className: "h-4 w-4" })
									}), /* @__PURE__ */ jsx(TextInput_default, {
										id: "recovery_code",
										ref: recoveryCodeInput,
										type: "text",
										name: "recovery_code",
										value: data.recovery_code,
										className: "block w-full rounded-xl border border-white/[0.08] bg-[#16171f] pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50",
										placeholder: "xxxxx-xxxxx",
										autoFocus: true,
										autoComplete: "off",
										onChange: (e) => setData("recovery_code", e.target.value)
									})]
								}),
								/* @__PURE__ */ jsx(InputError, {
									message: errors.recovery_code,
									className: "mt-2 text-xs"
								})
							] }),
							/* @__PURE__ */ jsx(PrimaryButton, {
								className: "w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 transition-all duration-200",
								disabled: processing,
								children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Verifying..."] }) : /* @__PURE__ */ jsxs(Fragment, { children: ["Verify & Continue", /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] })
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center gap-3 pt-2 text-center text-xs",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: toggleRecovery,
									className: "text-indigo-400 hover:text-indigo-300 font-medium transition-colors",
									children: !recovery ? "Use an emergency recovery code" : "Use an authenticator code"
								}), /* @__PURE__ */ jsxs(Link, {
									href: route("login"),
									className: "inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-400 transition-colors",
									children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "h-3 w-3" }), "Back to sign in"]
								})]
							})
						]
					})
				})]
			})]
		})]
	});
}
//#endregion
export { TwoFactorChallenge as default };
