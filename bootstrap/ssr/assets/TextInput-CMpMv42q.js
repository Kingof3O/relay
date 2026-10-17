import { jsx, jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
//#region resources/js/Components/InputError.tsx
function InputError({ message, className = "", ...props }) {
	return message ? /* @__PURE__ */ jsxs("p", {
		...props,
		className: "flex items-center gap-1.5 text-xs font-medium text-rose-400 mt-1.5 " + className,
		children: [/* @__PURE__ */ jsx("span", { className: "inline-block h-1 w-1 rounded-full bg-rose-400" }), message]
	}) : null;
}
//#endregion
//#region resources/js/Components/InputLabel.tsx
function InputLabel({ value, className = "", children, ...props }) {
	return /* @__PURE__ */ jsx("label", {
		...props,
		className: `block text-xs font-semibold uppercase tracking-wider text-zinc-400 ` + className,
		children: value ? value : children
	});
}
//#endregion
//#region resources/js/Components/PrimaryButton.tsx
function PrimaryButton({ className = "", disabled, children, ...props }) {
	return /* @__PURE__ */ jsx("button", {
		...props,
		className: `relative inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-all duration-150 ease-out hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-[#090a0f] active:scale-[0.98] ${disabled ? "cursor-not-allowed opacity-50 hover:bg-white active:scale-100 shadow-none" : ""} ` + className,
		disabled,
		children
	});
}
//#endregion
//#region resources/js/Components/TextInput.tsx
var TextInput_default = forwardRef(function TextInput({ type = "text", className = "", isFocused = false, ...props }, ref) {
	const localRef = useRef(null);
	useImperativeHandle(ref, () => ({ focus: () => localRef.current?.focus() }));
	useEffect(() => {
		if (isFocused) localRef.current?.focus();
	}, [isFocused]);
	return /* @__PURE__ */ jsx("input", {
		...props,
		type,
		className: "rounded-lg border border-zinc-800 bg-[#14151b] px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm transition-all duration-150 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820] focus:outline-none focus:ring-1 focus:ring-zinc-500 " + className,
		ref: localRef
	});
});
//#endregion
export { InputError as i, PrimaryButton as n, InputLabel as r, TextInput_default as t };
