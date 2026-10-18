import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Components/ApplicationLogo.tsx
function ApplicationLogo({ className = "h-8 w-8", ...props }) {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 36 36",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className,
		...props,
		children: [
			/* @__PURE__ */ jsx("path", {
				d: "M9 7C9 5.89543 9.89543 5 11 5H21C25.4183 5 29 8.58172 29 13C29 16.7224 26.4554 19.8506 23 20.7208V20.7208C21.7247 21.0487 21 22.2513 21 23.5685V31",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M9 5V31",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M9 18H21",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M20 22L28 31",
				stroke: "currentColor",
				strokeWidth: "3.2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "21",
				cy: "11.5",
				r: "2.5",
				fill: "currentColor"
			})
		]
	});
}
//#endregion
export { ApplicationLogo as t };
